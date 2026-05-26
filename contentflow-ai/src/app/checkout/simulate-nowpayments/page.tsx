"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Copy, 
  Check, 
  Loader2, 
  Coins, 
  QrCode, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink 
} from "lucide-react";
import styles from "./simulate.module.css";

function SimulationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get("order_id") || "";
  const priceAmount = searchParams.get("price_amount") || "9";
  const planId = searchParams.get("plan_id") || "starter";
  const userEmail = searchParams.get("user_email") || "";

  const [selectedCrypto, setSelectedCrypto] = useState<"USDT" | "BTC" | "ETH">("USDT");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"waiting" | "confirming" | "success" | "error">("waiting");
  const [timer, setTimer] = useState(1199); // 19:59 minutes

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCryptoInfo = () => {
    switch (selectedCrypto) {
      case "BTC":
        return {
          name: "Bitcoin",
          ticker: "BTC",
          address: "bc1qxy2kg3ut5xgzpt5rx7hssgqt0qyrc0yyvnc8tx",
          network: "Bitcoin Mainnet",
          amount: (parseFloat(priceAmount) / 68500).toFixed(6),
        };
      case "ETH":
        return {
          name: "Ethereum",
          ticker: "ETH",
          address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          network: "Ethereum (ERC-20)",
          amount: (parseFloat(priceAmount) / 3600).toFixed(5),
        };
      case "USDT":
      default:
        return {
          name: "Tether",
          ticker: "USDT",
          address: "TYqVd1bU28cKqH2NdeXJtD2mFp6zJgU7mX",
          network: "Tron (TRC-20)",
          amount: priceAmount,
        };
    }
  };

  const cryptoInfo = getCryptoInfo();

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoInfo.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerMockPayment = async () => {
    setStatus("confirming");
    
    // Wait 2 seconds to simulate block confirmation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await fetch("/api/webhooks/nowpayments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-nowpayments-sig": "simulate-payment",
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_status: "finished",
          price_amount: parseFloat(priceAmount),
          price_currency: "usd",
          actually_paid: parseFloat(priceAmount),
          pay_currency: selectedCrypto.toLowerCase(),
          payment_id: `np_sim_${Math.floor(Math.random() * 10000000)}`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const extractedUserId = orderId.split("___")[0];
        if (extractedUserId) {
          localStorage.setItem(`contentflow_mock_upgrade_${extractedUserId}`, JSON.stringify({
            plan: planId,
            generationsLimit: planId === "starter" ? 100 : 999999,
            userId: extractedUserId
          }));
        }
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard?payment=success&gateway=nowpayments");
        }, 2500);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={`orb orb-purple ${styles.orb1}`} />
      <div className={`orb orb-blue ${styles.orb2}`} />

      <div className={`glass-card ${styles.card}`}>
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

        {status === "success" ? (
          <div className={styles.successScreen}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={72} className={styles.successIcon} />
            </div>
            <h2>¡Pago Recibido y Confirmado!</h2>
            <p>
              Hemos verificado la transacción en la red blockchain. Tu plan{" "}
              <strong style={{ color: "var(--primary)", textTransform: "capitalize" }}>
                {planId}
              </strong>{" "}
              ha sido activado con éxito.
            </p>
            <div className={styles.redirectBadge}>
              <Loader2 size={16} className="animate-spin" />
              <span>Redirigiendo a tu dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.checkoutHeader}>
              <div className={styles.titleArea}>
                <h1>Procesador Crypto Simulado</h1>
                <span className={styles.sandboxBadge}>MODO PRUEBA</span>
              </div>
              <div className={styles.timerBox}>
                <span>Vence en:</span>
                <span className={styles.countdown}>{formatTime(timer)}</span>
              </div>
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Plan Seleccionado</span>
                <span className={styles.summaryValue} style={{ textTransform: "capitalize" }}>
                  {planId}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Email</span>
                <span className={styles.summaryValue}>{userEmail}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Precio Total</span>
                <span className={styles.summaryPrice}>${priceAmount} USD</span>
              </div>
            </div>

            {/* Crypto Tabs */}
            <div className={styles.cryptoTabs}>
              {(["USDT", "BTC", "ETH"] as const).map((coin) => (
                <button
                  key={coin}
                  className={`${styles.tabBtn} ${selectedCrypto === coin ? styles.activeTab : ""}`}
                  onClick={() => {
                    if (status === "waiting") setSelectedCrypto(coin);
                  }}
                  disabled={status !== "waiting"}
                >
                  <Coins size={16} />
                  <span>{coin}</span>
                </button>
              ))}
            </div>

            {/* Main Billing Card */}
            <div className={styles.billingSection}>
              <div className={styles.qrArea}>
                {/* SVG mock QR Code */}
                <div className={styles.qrCodeWrapper}>
                  <QrCode size={130} strokeWidth={1.5} className={styles.qrIcon} />
                  <div className={styles.qrBrand}>
                    <span>{cryptoInfo.ticker}</span>
                  </div>
                </div>
                <div className={styles.qrDetails}>
                  <span className={styles.networkText}>{cryptoInfo.network}</span>
                  <div className={styles.amountText}>
                    {cryptoInfo.amount} {cryptoInfo.ticker}
                  </div>
                  <p className={styles.instructions}>
                    Envía exactamente esta cantidad a la dirección de abajo para activar tu cuenta.
                  </p>
                </div>
              </div>

              <div className={styles.addressArea}>
                <span className={styles.addressLabel}>Dirección de depósito:</span>
                <div className={styles.addressBar}>
                  <code className={styles.addressCode}>{cryptoInfo.address}</code>
                  <button className={styles.copyBtn} onClick={handleCopy} title="Copiar dirección">
                    {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className={styles.statusBox}>
              {status === "waiting" && (
                <>
                  <Loader2 size={18} className={`${styles.spinIcon} animate-spin`} />
                  <span>Esperando transferencia blockchain en {selectedCrypto}...</span>
                </>
              )}
              {status === "confirming" && (
                <>
                  <Loader2 size={18} className={`${styles.spinIcon} animate-spin`} style={{ color: "#3b82f6" }} />
                  <span>Confirmando transacción en red {cryptoInfo.name}...</span>
                </>
              )}
              {status === "error" && (
                <>
                  <AlertCircle size={18} style={{ color: "#ef4444" }} />
                  <span>Ocurrió un error al verificar tu pago. Inténtalo de nuevo.</span>
                </>
              )}
            </div>

            {/* Simulation controls */}
            <div className={styles.simulationControls}>
              <div className={styles.simHeader}>
                <span className={styles.simPulse}></span>
                <h3>Simulador de Red Crypto</h3>
              </div>
              <p className={styles.simText}>
                Este panel simula la transferencia blockchain en tiempo real y realiza una llamada
                segura a nuestro webhook de NOWPayments.
              </p>
              <div className={styles.buttonGroup}>
                <button
                  onClick={triggerMockPayment}
                  disabled={status !== "waiting"}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                >
                  {status === "waiting" ? (
                    <>
                      <Coins size={18} /> Simular Transferencia Blockchain
                    </>
                  ) : (
                    "Procesando simulación..."
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SimulateNowPaymentsPage() {
  return (
    <Suspense fallback={<div className={styles.loadingContainer}>Cargando procesador...</div>}>
      <SimulationForm />
    </Suspense>
  );
}
