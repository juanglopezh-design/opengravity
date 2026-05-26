"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/api-helper";
import {
  Copy,
  Check,
  Loader2,
  Bitcoin,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Search,
  ShieldCheck,
  Clock,
} from "lucide-react";
import styles from "./crypto.module.css";

// ─── CONFIGURACIÓN DE TU WALLET ─────────────────────────────────────────
// Pon tu dirección de Bitcoin aquí. Cuando la tengas, cámbiala y redespliega.
const WALLET_CONFIG = {
  BTC: {
    address: "bc1qazfthj3utl4m6hc536p0s32q2qteq9aueflj32",  // ← cambia esto por tu wallet real
    network: "Bitcoin Mainnet",
    label: "Bitcoin (BTC)",
    explorer: "https://mempool.space/tx/",
  },
};

// Precios por plan (en USD)
const PLAN_PRICES: Record<string, number> = {
  starter: 9,
  pro: 29,
  business: 79,
};

// BTC/USD rate aproximado (se actualiza al cargar la página)
const FALLBACK_BTC_RATE = 68500;

function CryptoCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id") || "";
  const planId = searchParams.get("plan_id") || "starter";
  const userEmail = searchParams.get("user_email") || "";
  const priceUsd = PLAN_PRICES[planId] ?? 9;

  const [btcRate, setBtcRate] = useState(FALLBACK_BTC_RATE);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<"waiting" | "verifying" | "success" | "error">("waiting");
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(1799); // 30 min
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const btcAmount = (priceUsd / btcRate).toFixed(6);
  const walletAddress = WALLET_CONFIG.BTC.address;

  // Fetch real BTC price
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
      .then((r) => r.json())
      .then((data) => {
        if (data?.bitcoin?.usd) setBtcRate(data.bitcoin.usd);
      })
      .catch(() => {}); // fallback silently
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0 || status !== "waiting") return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(btcAmount);
  };

  const handleVerify = async () => {
    if (!txHash.trim()) {
      setErrorMsg("Por favor, ingresa el hash de tu transacción.");
      return;
    }
    if (txHash.trim().length < 60) {
      setErrorMsg("El hash de transacción parece incorrecto. Debe tener 64 caracteres.");
      return;
    }

    setErrorMsg("");
    setStatus("verifying");
    setVerifyAttempts((p) => p + 1);

    try {
      const response = await fetch(getApiUrl("/api/webhooks/crypto-verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          orderId,
          planId,
          priceUsd,
          btcAmount,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save locally too for immediate UI refresh
        const userId = orderId.split("___")[0];
        if (userId) {
          localStorage.setItem(
            `contentflow_mock_upgrade_${userId}`,
            JSON.stringify({
              plan: planId,
              generationsLimit: planId === "starter" ? 100 : 999999,
              userId,
            })
          );
        }
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard?payment=success&gateway=btc");
        }, 2500);
      } else {
        setStatus("waiting");
        setErrorMsg(
          data.error ||
            "No pudimos verificar el pago todavía. Asegúrate de que la transacción haya sido confirmada en la red Bitcoin (puede tardar ~10 min)."
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("waiting");
      setErrorMsg("Error de red al verificar. Inténtalo de nuevo.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={`orb orb-purple ${styles.orb1}`} />
      <div className={`orb orb-blue ${styles.orb2}`} />

      <div className={`glass-card ${styles.card}`}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <Link href="/pricing" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Volver a Planes</span>
          </Link>
          <div className={styles.logo}>
            <span>⚡</span>
            <span className="gradient-text">ContentFlow AI</span>
          </div>
        </div>

        {/* Success screen */}
        {status === "success" ? (
          <div className={styles.successScreen}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={72} className={styles.successIcon} />
            </div>
            <h2>¡Pago Verificado en Blockchain!</h2>
            <p>
              Tu transacción de Bitcoin ha sido confirmada. El plan{" "}
              <strong style={{ color: "var(--accent-purple)", textTransform: "capitalize" }}>
                {planId}
              </strong>{" "}
              ha sido activado en tu cuenta.
            </p>
            <div className={styles.redirectBadge}>
              <Loader2 size={16} className="animate-spin" />
              <span>Redirigiendo a tu dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.checkoutHeader}>
              <div className={styles.titleArea}>
                <h1>Pago con Bitcoin</h1>
                <div className={styles.securityRow}>
                  <ShieldCheck size={13} />
                  <span>Verificación automática en blockchain</span>
                </div>
              </div>
              <div className={styles.timerBox}>
                <span>Expira en:</span>
                <span className={styles.countdown}>{formatTime(timer)}</span>
              </div>
            </div>

            {/* Order summary */}
            <div className={styles.orderSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Plan</span>
                <span className={styles.summaryValue} style={{ textTransform: "capitalize" }}>
                  {planId}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Email</span>
                <span className={styles.summaryValue}>{userEmail}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total USD</span>
                <span className={styles.summaryPrice}>${priceUsd} USD</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total BTC</span>
                <span className={styles.summaryBtc}>
                  <Bitcoin size={14} />
                  {btcAmount} BTC
                </span>
              </div>
            </div>

            {/* Payment section */}
            <div className={styles.paymentSection}>
              <div className={styles.networkBadge}>
                <Bitcoin size={14} />
                <span>Bitcoin Mainnet</span>
              </div>

              {/* Amount to send */}
              <div className={styles.amountBox}>
                <span className={styles.amountLabel}>Envía exactamente:</span>
                <div className={styles.amountRow}>
                  <span className={styles.bigAmount}>
                    <Bitcoin size={22} />
                    {btcAmount} BTC
                  </span>
                  <button className={styles.copySmall} onClick={handleCopyAmount} title="Copiar monto">
                    <Copy size={14} />
                  </button>
                </div>
                <span className={styles.amountUsd}>(≈ ${priceUsd} USD · 1 BTC = ${btcRate.toLocaleString()})</span>
              </div>

              {/* Wallet address */}
              <div className={styles.addressSection}>
                <span className={styles.addressLabel}>Dirección de destino (Bitcoin):</span>
                <div className={styles.addressBar}>
                  <code className={styles.addressCode}>{walletAddress}</code>
                  <button className={styles.copyBtn} onClick={handleCopy} title="Copiar dirección">
                    {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && <span className={styles.copiedHint}>¡Dirección copiada!</span>}
              </div>

              {/* Instructions */}
              <div className={styles.instructionBox}>
                <ol className={styles.steps}>
                  <li>Abre tu wallet de Bitcoin (Coinbase, Trust Wallet, Binance, etc.)</li>
                  <li>Envía exactamente <strong>{btcAmount} BTC</strong> a la dirección de arriba</li>
                  <li>Espera la confirmación en la red (~5–15 min)</li>
                  <li>Copia el hash de transacción (TX ID) y pégalo abajo</li>
                </ol>
              </div>
            </div>

            {/* TX Verification */}
            <div className={styles.verifySection}>
              <div className={styles.verifyHeader}>
                <Search size={16} />
                <h3>Verificar mi pago</h3>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "12px" }}>
                <p className={styles.verifyHint} style={{ margin: 0, paddingRight: "10px" }}>
                  Una vez enviado el pago, pega el hash de transacción (TX ID) aquí. Lo verificaremos
                  automáticamente en la blockchain.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const randomHex = Array.from({ length: 59 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
                    setTxHash("test_" + randomHex);
                    setErrorMsg("");
                  }}
                  style={{
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px dashed #a855f7",
                    color: "#c084fc",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(168, 85, 247, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(168, 85, 247, 0.15)";
                  }}
                >
                  ⚡ Simular Pago (Sandbox)
                </button>
              </div>
              <div className={styles.txInputRow}>
                <input
                  type="text"
                  className={`input-field ${styles.txInput}`}
                  placeholder="ej: 3d3c8f7a2b1e9d4c6f5a8b2e1d9c3a7f4b6e2d8c1a5f3b7e9d2c4a6f8b1e3d5c7a9f"
                  value={txHash}
                  onChange={(e) => {
                    setTxHash(e.target.value);
                    setErrorMsg("");
                  }}
                  disabled={status === "verifying"}
                />
              </div>

              {errorMsg && (
                <div className={styles.errorBox}>
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleVerify}
                disabled={status === "verifying" || !txHash.trim()}
                style={{ width: "100%", justifyContent: "center", gap: "8px", fontWeight: 700, padding: "16px" }}
              >
                {status === "verifying" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verificando en blockchain...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verificar Pago y Activar Plan
                  </>
                )}
              </button>

              {verifyAttempts > 0 && status === "waiting" && (
                <div className={styles.retryHint}>
                  <Clock size={13} />
                  <span>
                    Las transacciones Bitcoin pueden tardar 10–30 min en confirmarse. Si acabas de enviar,
                    espera unos minutos e inténtalo de nuevo.
                  </span>
                </div>
              )}
            </div>

            {/* Explorer link */}
            <div className={styles.explorerHint}>
              Puedes buscar tu TX en{" "}
              <a
                href="https://mempool.space"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.explorerLink}
              >
                mempool.space ↗
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CryptoCheckoutPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 18, color: "var(--text-secondary)" }}>Cargando procesador de pago...</div>}>
      <CryptoCheckoutForm />
    </Suspense>
  );
}
