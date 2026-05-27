"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getApiUrl } from "@/lib/api-helper";
import { btcWalletAddress, planPricesUsd } from "@/lib/config";
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
  XCircle,
} from "lucide-react";
import styles from "./crypto.module.css";

const FALLBACK_BTC_RATE = 68500;
// Order expires in 2 hours (matches server-side validation)
const ORDER_EXPIRY_SECONDS = 2 * 60 * 60;

function CryptoCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // orderId comes from the server via create-order — never generated client-side
  const orderIdParam = searchParams.get("order_id") || "";
  const planId = searchParams.get("plan_id") || "basic";
  const userEmailParam = searchParams.get("user_email") || "";
  const priceUsd = planPricesUsd[planId] ?? 1.99;

  const [authReady, setAuthReady] = useState(false);
  const [orderId, setOrderId] = useState(orderIdParam);
  const [userEmail, setUserEmail] = useState(userEmailParam);
  const [btcRate, setBtcRate] = useState(FALLBACK_BTC_RATE);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<"waiting" | "verifying" | "success" | "expired">("waiting");
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(ORDER_EXPIRY_SECONDS);
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const btcAmount = (priceUsd / btcRate).toFixed(6);
  const walletAddress = btcWalletAddress;

  useEffect(() => {
    const returnUrl = `/checkout/crypto?${searchParams.toString()}`;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // If no orderId in URL, create one server-side
      if (!orderIdParam) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ planId }),
          });
          const data = await res.json();
          if (res.ok && data.orderId) {
            setOrderId(data.orderId);
          } else {
            setErrorMsg(data.error || "No se pudo crear la orden. Vuelve a intentarlo.");
          }
        } catch {
          setErrorMsg("Error de red al crear la orden. Inténtalo de nuevo.");
        }
      }

      setUserEmail(user.email || userEmailParam);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [planId, orderIdParam, router, searchParams, userEmailParam]);

  // Fetch real BTC price
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
      .then((r) => r.json())
      .then((data) => {
        if (data?.bitcoin?.usd) setBtcRate(data.bitcoin.usd);
      })
      .catch(() => {});
  }, []);

  // Countdown timer — when it hits 0, mark as expired
  useEffect(() => {
    if (timer <= 0) {
      setStatus("expired");
      return;
    }
    if (status !== "waiting") return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const safeCopy = (text: string, onSuccess: () => void) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
          // Fallback for mobile/HTTP
          const el = document.createElement("textarea");
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
          onSuccess();
        });
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        onSuccess();
      }
    } catch {
      // Silent fail
    }
  };

  const handleCopy = () => {
    safeCopy(walletAddress, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyAmount = () => {
    safeCopy(btcAmount, () => {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    });
  };

  const handleVerify = async () => {
    if (!txHash.trim()) {
      setErrorMsg("Por favor, ingresa el hash de tu transacción.");
      return;
    }
    const isDevTestTx = process.env.NODE_ENV === "development" && txHash.trim().startsWith("test_");
    if (!isDevTestTx && txHash.trim().length < 60) {
      setErrorMsg("El hash de transacción parece incorrecto. Debe tener 64 caracteres.");
      return;
    }

    setErrorMsg("");
    setStatus("verifying");
    setVerifyAttempts((p) => p + 1);

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMsg("Debes iniciar sesión para verificar el pago.");
        setStatus("waiting");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(getApiUrl("/api/webhooks/crypto-verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txHash: txHash.trim(), orderId, planId, priceUsd, btcAmount, walletAddress }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard?payment=success&gateway=btc"), 2500);
      } else {
        setStatus("waiting");
        setErrorMsg(
          data.error ||
            "No pudimos verificar el pago todavía. Asegúrate de que la transacción haya sido confirmada en la red Bitcoin (puede tardar ~10 min)."
        );
      }
    } catch {
      setStatus("waiting");
      setErrorMsg("Error de red al verificar. Inténtalo de nuevo.");
    }
  };

  if (!authReady) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-secondary)" }}>
        Verificando sesión...
      </div>
    );
  }

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
        {status === "success" && (
          <div className={styles.successScreen}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={72} className={styles.successIcon} />
            </div>
            <h2>¡Pago Verificado en Blockchain!</h2>
            <p>
              Tu transacción de Bitcoin ha sido confirmada. El plan{" "}
              <strong style={{ color: "var(--accent-purple)", textTransform: "capitalize" }}>{planId}</strong>{" "}
              ha sido activado en tu cuenta.
            </p>
            <div className={styles.redirectBadge}>
              <Loader2 size={16} className="animate-spin" />
              <span>Redirigiendo a tu dashboard...</span>
            </div>
          </div>
        )}

        {/* Expired screen */}
        {status === "expired" && (
          <div className={styles.successScreen}>
            <div className={styles.successIconWrapper}>
              <XCircle size={72} style={{ color: "#ef4444" }} />
            </div>
            <h2 style={{ color: "#ef4444" }}>Orden expirada</h2>
            <p>
              Esta orden ha expirado. Si ya enviaste el pago, escríbenos a{" "}
              <a href="mailto:juanglopezh@gmail.com" style={{ color: "var(--accent-purple)" }}>
                juanglopezh@gmail.com
              </a>{" "}
              con tu TX ID y lo activamos manualmente.
            </p>
            <Link href="/pricing" className="btn-primary" style={{ display: "inline-flex", justifyContent: "center", marginTop: "16px" }}>
              Crear nueva orden
            </Link>
          </div>
        )}

        {/* Main checkout */}
        {(status === "waiting" || status === "verifying") && (
          <>
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
                <span className={styles.countdown} style={{ color: timer < 600 ? "#ef4444" : undefined }}>
                  {formatTime(timer)}
                </span>
              </div>
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Plan</span>
                <span className={styles.summaryValue} style={{ textTransform: "capitalize" }}>{planId}</span>
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

            <div className={styles.paymentSection}>
              <div className={styles.networkBadge}>
                <Bitcoin size={14} />
                <span>Bitcoin Mainnet</span>
              </div>

              <div className={styles.amountBox}>
                <span className={styles.amountLabel}>Envía exactamente:</span>
                <div className={styles.amountRow}>
                  <span className={styles.bigAmount}>
                    <Bitcoin size={22} />
                    {btcAmount} BTC
                  </span>
                  <button className={styles.copySmall} onClick={handleCopyAmount} title="Copiar monto" aria-label="Copiar monto">
                    {copiedAmount ? <Check size={14} style={{ color: "#10b981" }} /> : <Copy size={14} />}
                  </button>
                </div>
                <span className={styles.amountUsd}>(≈ ${priceUsd} USD · 1 BTC = ${btcRate.toLocaleString()})</span>
              </div>

              <div className={styles.addressSection}>
                <span className={styles.addressLabel}>Dirección de destino (Bitcoin):</span>
                <div className={styles.addressBar}>
                  <code className={styles.addressCode} style={{ wordBreak: "break-all" }}>{walletAddress}</code>
                  <button className={styles.copyBtn} onClick={handleCopy} title="Copiar dirección" aria-label="Copiar dirección Bitcoin">
                    {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && <span className={styles.copiedHint}>¡Dirección copiada!</span>}
              </div>

              <div className={styles.instructionBox}>
                <ol className={styles.steps}>
                  <li>Abre tu wallet de Bitcoin (Coinbase, Trust Wallet, Binance, etc.)</li>
                  <li>Envía exactamente <strong>{btcAmount} BTC</strong> a la dirección de arriba</li>
                  <li>Espera la confirmación en la red (~5–15 min)</li>
                  <li>Copia el hash de transacción (TX ID) y pégalo abajo</li>
                </ol>
              </div>
            </div>

            <div className={styles.verifySection}>
              <div className={styles.verifyHeader}>
                <Search size={16} />
                <h3>Verificar mi pago</h3>
              </div>
              <p className={styles.verifyHint}>
                Una vez enviado el pago, pega el hash de transacción (TX ID) aquí.
              </p>
              <div className={styles.txInputRow}>
                <input
                  type="text"
                  className={`input-field ${styles.txInput}`}
                  placeholder="ej: 3d3c8f7a2b1e9d4c6f5a8b2e1d9c3a7f4b6e2d8c1a5f3b7e9d2c4a6f8b1e3d5c7a9f"
                  value={txHash}
                  onChange={(e) => { setTxHash(e.target.value); setErrorMsg(""); }}
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
                disabled={status === "verifying" || !txHash.trim() || !orderId}
                style={{ width: "100%", justifyContent: "center", gap: "8px", fontWeight: 700, padding: "16px" }}
              >
                {status === "verifying" ? (
                  <><Loader2 size={18} className="animate-spin" /> Verificando en blockchain...</>
                ) : (
                  <><ShieldCheck size={18} /> Verificar Pago y Activar Plan</>
                )}
              </button>

              {verifyAttempts >= 3 && status === "waiting" && (
                <div className={styles.retryHint} style={{ marginTop: "12px" }}>
                  <AlertCircle size={13} />
                  <span>
                    ¿Sigues teniendo problemas? Escríbenos a{" "}
                    <a href="mailto:juanglopezh@gmail.com" style={{ color: "var(--accent-purple)" }}>
                      juanglopezh@gmail.com
                    </a>{" "}
                    con tu TX ID y lo activamos manualmente.
                  </span>
                </div>
              )}

              {verifyAttempts > 0 && verifyAttempts < 3 && status === "waiting" && (
                <div className={styles.retryHint}>
                  <Clock size={13} />
                  <span>Las transacciones Bitcoin pueden tardar 10–30 min en confirmarse. Espera unos minutos e inténtalo de nuevo.</span>
                </div>
              )}
            </div>

            <div className={styles.explorerHint}>
              Puedes buscar tu TX en{" "}
              <a href="https://mempool.space" target="_blank" rel="noopener noreferrer" className={styles.explorerLink}>
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
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 18, color: "var(--text-secondary)" }}>
        Cargando procesador de pago...
      </div>
    }>
      <CryptoCheckoutForm />
    </Suspense>
  );
}
