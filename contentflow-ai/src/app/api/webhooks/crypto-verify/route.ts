import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { btcWalletAddress, planGenerationLimits } from "@/lib/config";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;

    const { txHash, orderId, planId, btcAmount, walletAddress } = await req.json();

    if (!txHash || !orderId || !planId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos." }, { status: 400 });
    }

    if (!btcWalletAddress) {
      return NextResponse.json(
        { error: "Wallet Bitcoin no configurada en el servidor." },
        { status: 503 }
      );
    }

    // Validate wallet address sent by client matches server config
    if (walletAddress && walletAddress !== btcWalletAddress) {
      console.warn("[CryptoVerify] Wallet address mismatch:", walletAddress);
      return NextResponse.json(
        { error: "Dirección de wallet no válida." },
        { status: 400 }
      );
    }

    // Parse and validate orderId — must be server-generated format
    const parts = orderId.split("___");
    if (parts.length < 3) {
      return NextResponse.json({ error: "Formato de order_id inválido." }, { status: 400 });
    }

    const userId = parts[0];
    const orderPlanId = parts[1];
    const orderTimestamp = Number(parts[2]);

    // Verify the authenticated user owns this order
    if (userId !== authResult.uid) {
      return NextResponse.json(
        { error: "Este pedido no pertenece a tu cuenta." },
        { status: 403 }
      );
    }

    // Verify planId matches what's encoded in the orderId (prevents plan substitution)
    if (orderPlanId !== planId) {
      return NextResponse.json(
        { error: "El plan del pedido no coincide." },
        { status: 400 }
      );
    }

    // Reject orders older than 2 hours
    const orderAgeMs = Date.now() - orderTimestamp;
    if (orderAgeMs > 2 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Este pedido ha expirado. Por favor, inicia un nuevo proceso de pago." },
        { status: 410 }
      );
    }

    if (!planGenerationLimits[planId] && planId !== "free") {
      return NextResponse.json({ error: "Plan no válido." }, { status: 400 });
    }

    // Check for duplicate transaction
    try {
      const existingTx = await adminDb
        .collection("users")
        .where("btcTxHash", "==", txHash)
        .limit(1)
        .get();
      if (!existingTx.empty) {
        return NextResponse.json(
          { error: "Esta transacción ya fue utilizada para activar un plan." },
          { status: 409 }
        );
      }
    } catch (indexError) {
      console.warn("[CryptoVerify] Duplicate TX check skipped:", indexError);
    }

    let txData: {
      status?: { confirmed?: boolean };
      vout?: Array<{ scriptpubkey_address?: string; value?: number }>;
    } | null = null;
    let verificationSource = "none";

    // Primary: mempool.space
    try {
      const mempoolRes = await fetch(`https://mempool.space/api/tx/${txHash}`, {
        headers: { "User-Agent": "ContentFlowAI/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (mempoolRes.ok) {
        txData = await mempoolRes.json();
        verificationSource = "mempool.space";
      }
    } catch (fetchErr) {
      const message = fetchErr instanceof Error ? fetchErr.message : "fetch failed";
      console.warn("[CryptoVerify] mempool.space fetch failed:", message);
    }

    // Fallback: blockchair
    if (!txData) {
      try {
        const blockchairRes = await fetch(
          `https://api.blockchair.com/bitcoin/transactions?q=hash(${txHash})&limit=1`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (blockchairRes.ok) {
          const blockchairData = await blockchairRes.json();
          if (blockchairData?.data?.length > 0) {
            const bcTx = blockchairData.data[0].transaction;
            txData = {
              status: { confirmed: bcTx.block_id > 0 },
              vout:
                blockchairData.data[0].outputs?.map(
                  (o: { recipient?: string; value?: number }) => ({
                    scriptpubkey_address: o.recipient,
                    value: Math.round((o.value ?? 0) * 1e8),
                  })
                ) || [],
            };
            verificationSource = "blockchair";
          }
        }
      } catch (bcErr) {
        const message = bcErr instanceof Error ? bcErr.message : "fetch failed";
        console.warn("[CryptoVerify] blockchair fetch failed:", message);
      }
    }

    const isDevMode =
      process.env.NODE_ENV === "development" &&
      (txHash.startsWith("test_") || !btcWalletAddress);

    if (!txData) {
      if (isDevMode) {
        txData = {
          status: { confirmed: true },
          vout: [
            {
              scriptpubkey_address: btcWalletAddress,
              value: Math.round(parseFloat(btcAmount || "0") * 1e8),
            },
          ],
        };
        verificationSource = "dev-simulation";
      } else {
        return NextResponse.json(
          {
            error:
              "No encontramos esa transacción en la blockchain. Verifica el TX ID y que la transacción se haya enviado.",
          },
          { status: 404 }
        );
      }
    }

    const confirmed = txData?.status?.confirmed === true;
    if (!confirmed && !isDevMode) {
      return NextResponse.json(
        {
          error:
            "La transacción aún no tiene confirmaciones. Espera unos minutos e inténtalo de nuevo.",
        },
        { status: 422 }
      );
    }

    const outputs = txData?.vout || [];
    const ourOutput = outputs.find((out) => out.scriptpubkey_address === btcWalletAddress);

    if (!ourOutput && !isDevMode) {
      return NextResponse.json(
        {
          error:
            "Esta transacción no está dirigida a nuestra dirección de Bitcoin.",
        },
        { status: 422 }
      );
    }

    if (ourOutput && btcAmount) {
      const paidSats = ourOutput.value ?? 0;
      const expectedSats = Math.round(parseFloat(btcAmount) * 1e8);
      const tolerance = expectedSats * 0.05;
      if (paidSats < expectedSats - tolerance && !isDevMode) {
        return NextResponse.json(
          {
            error: `El monto recibido (${(paidSats / 1e8).toFixed(6)} BTC) es menor al requerido (${btcAmount} BTC).`,
          },
          { status: 422 }
        );
      }
    }

    const generationsLimit = planGenerationLimits[planId] ?? 100;

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
        `[CryptoVerify] Plan '${planId}' activado para ${userId} (TX ${txHash}, ${verificationSource})`
      );
    } catch (dbError) {
      console.error("[CryptoVerify] Firestore error:", dbError);
      if (isDevMode) {
        return NextResponse.json({
          success: true,
          warning: "Firestore no disponible en local.",
          plan: planId,
          userId,
          txHash,
          verificationSource,
        });
      }
      return NextResponse.json(
        { error: "Error al activar el plan. Contacta soporte con tu TX ID." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: planId,
      userId,
      txHash,
      verificationSource,
      confirmed,
      generationsLimit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor.";
    console.error("[CryptoVerify] Unexpected error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
