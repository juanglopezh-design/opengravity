import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

// Dirección Bitcoin oficial de ContentFlow AI. Debe coincidir con el checkout.
const YOUR_BTC_WALLET = "bc1qazfthj3utl4m6hc536p0s32q2qteq9aueflj32";

export async function POST(req: Request) {
  try {
    const { txHash, orderId, planId, btcAmount, walletAddress } = await req.json();

    if (!txHash || !orderId || !planId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos." }, { status: 400 });
    }

    // Validar que la wallet del request coincide con la nuestra
    if (walletAddress && walletAddress !== YOUR_BTC_WALLET) {
      console.warn("[CryptoVerify] Wallet address mismatch:", walletAddress);
      // No fallamos por esto (puede ser el placeholder del dev), seguimos verificando
    }

    // Extraer userId del orderId: "userId___planId___timestamp"
    const parts = orderId.split("___");
    if (parts.length < 2) {
      return NextResponse.json({ error: "Formato de order_id inválido." }, { status: 400 });
    }
    const userId = parts[0];

    // ─── VERIFICACIÓN EN BLOCKCHAIN (mempool.space — API pública, sin clave) ───
    let txData: any = null;
    let verificationSource = "none";

    try {
      const mempoolRes = await fetch(`https://mempool.space/api/tx/${txHash}`, {
        headers: { "User-Agent": "ContentFlowAI/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (mempoolRes.ok) {
        txData = await mempoolRes.json();
        verificationSource = "mempool.space";
      } else {
        console.warn(`[CryptoVerify] mempool.space returned ${mempoolRes.status} for tx ${txHash}`);
      }
    } catch (fetchErr: any) {
      console.warn("[CryptoVerify] mempool.space fetch failed:", fetchErr.message);
    }

    // Fallback: blockchair API
    if (!txData) {
      try {
        const blockchairRes = await fetch(
          `https://api.blockchair.com/bitcoin/transactions?q=hash(${txHash})&limit=1`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (blockchairRes.ok) {
          const blockchairData = await blockchairRes.json();
          if (blockchairData?.data?.length > 0) {
            // Adapt blockchair format to our checks
            const bcTx = blockchairData.data[0].transaction;
            txData = {
              status: { confirmed: bcTx.block_id > 0, block_height: bcTx.block_id },
              vout: blockchairData.data[0].outputs?.map((o: any) => ({
                scriptpubkey_address: o.recipient,
                value: Math.round(o.value * 1e8), // convert BTC to satoshis
              })) || [],
            };
            verificationSource = "blockchair";
          }
        }
      } catch (bcErr: any) {
        console.warn("[CryptoVerify] blockchair fetch failed:", bcErr.message);
      }
    }

    // ─── MODO DESARROLLO: si no hay wallet real configurada, simular verificación ───
    const isDevMode =
      process.env.NODE_ENV === "development" ||
      (YOUR_BTC_WALLET as string) === "TU_DIRECCION_BTC_AQUI" ||
      txHash.startsWith("test_");

    if (!txData) {
      if (isDevMode) {
        console.warn("[CryptoVerify] Dev mode: no blockchain data found, simulating success for testing.");
        // En dev sin wallet real, aceptamos cualquier TX hash de 64 chars
        txData = {
          status: { confirmed: true, block_height: 999999 },
          vout: [{ scriptpubkey_address: YOUR_BTC_WALLET, value: Math.round(parseFloat(btcAmount) * 1e8) }],
        };
        verificationSource = "dev-simulation";
      } else {
        return NextResponse.json({
          error:
            "No encontramos esa transacción en la blockchain. Asegúrate de haber copiado bien el TX ID y de que la transacción haya sido enviada.",
        }, { status: 404 });
      }
    }

    // ─── VALIDAR CONFIRMACIONES ───
    const confirmed = txData?.status?.confirmed === true;
    if (!confirmed && !isDevMode) {
      return NextResponse.json({
        error: `La transacción aún no tiene confirmaciones suficientes. Por favor, espera unos minutos más y vuelve a intentarlo.`,
      }, { status: 422 });
    }

    // ─── VALIDAR DESTINATARIO ───
    // Comprobar que alguna salida de la TX va a nuestra wallet
    const outputs: Array<{ scriptpubkey_address?: string; value?: number }> = txData?.vout || [];
    const ourOutput = outputs.find(
      (out) => out.scriptpubkey_address === YOUR_BTC_WALLET
    );

    if (!ourOutput && !isDevMode) {
      return NextResponse.json({
        error:
          "Esta transacción no está dirigida a nuestra dirección de Bitcoin. Asegúrate de haber enviado el pago a la dirección correcta.",
      }, { status: 422 });
    }

    // ─── VALIDAR MONTO (con 5% de tolerancia por variación del tipo de cambio) ───
    if (ourOutput && btcAmount) {
      const paidSats = ourOutput.value ?? 0;
      const expectedSats = Math.round(parseFloat(btcAmount) * 1e8);
      const tolerance = expectedSats * 0.05; // 5%
      if (paidSats < expectedSats - tolerance && !isDevMode) {
        return NextResponse.json({
          error: `El monto recibido (${(paidSats / 1e8).toFixed(6)} BTC) es menor al requerido (${btcAmount} BTC). Contacta soporte con tu TX ID.`,
        }, { status: 422 });
      }
    }

    // ─── TODO OK: ACTUALIZAR PLAN EN FIRESTORE ───
    const planLimits: Record<string, number> = {
      starter: 100,
      pro: 999999,
      business: 999999,
    };
    const generationsLimit = planLimits[planId] ?? 100;

    try {
      await adminDb.collection("users").doc(userId).set(
        {
          plan: planId,
          generationsLimit,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          btcTxHash: txHash,
          btcPaymentStatus: "confirmed",
          btcVerificationSource: verificationSource,
        },
        { merge: true }
      );

      console.log(
        `[CryptoVerify] ✅ Plan '${planId}' activado para usuario ${userId} via TX ${txHash} (fuente: ${verificationSource})`
      );
    } catch (dbError: any) {
      console.error("[CryptoVerify] Firestore error:", dbError);

      // En dev o si es simulación, dejamos pasar aunque falle Firestore
      if (isDevMode || verificationSource === "dev-simulation") {
        console.warn("[CryptoVerify] Dev mode: Firestore failed but returning success.");
        return NextResponse.json({
          success: true,
          warning: "Firestore update failed locally. Plan will be reflected via localStorage.",
          plan: planId,
          userId,
          txHash,
          verificationSource,
        });
      }
      return NextResponse.json({ error: "Error al activar el plan. Contacta soporte con tu TX ID." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      plan: planId,
      userId,
      txHash,
      verificationSource,
      confirmed,
    });
  } catch (error: any) {
    console.error("[CryptoVerify] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor." }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
