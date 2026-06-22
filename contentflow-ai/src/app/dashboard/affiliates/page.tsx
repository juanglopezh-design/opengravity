"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import styles from "./page.module.css";
import { Users, Copy, Check, TrendingUp, DollarSign, Wallet, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Commission {
  id: string;
  referredUserId: string;
  planId: string;
  amountUsd: number;
  commissionUsd: number;
  btcAmount: number;
  commissionBtc: number;
  status: "pending" | "paid";
  txHash: string;
  createdAt: any;
}

export default function AffiliatesPage() {
  const { t } = useLanguage();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState("https://contentflow-ai-juang26.web.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  const fetchCommissions = async (userId: string) => {
    try {
      setLoading(true);
      const commissionsRef = collection(db, "commissions");
      const q = query(
        commissionsRef,
        where("referrerId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const list: Commission[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          referredUserId: data.referredUserId || "",
          planId: data.planId || "",
          amountUsd: Number(data.amountUsd) || 0,
          commissionUsd: Number(data.commissionUsd) || 0,
          btcAmount: Number(data.btcAmount) || 0,
          commissionBtc: Number(data.commissionBtc) || 0,
          status: data.status || "pending",
          txHash: data.txHash || "",
          createdAt: data.createdAt,
        });
      });
      setCommissions(list);
    } catch (err) {
      console.error("Error fetching commissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchCommissions(user.uid);
    } else {
      const unsubscribe = auth.onAuthStateChanged((u) => {
        if (u) {
          fetchCommissions(u.uid);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const user = auth.currentUser;
  const referralLink = user ? `${appUrl}?ref=${user.uid}` : `${appUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats Calculations
  const uniqueReferredUsers = new Set(commissions.map((c) => c.referredUserId)).size;
  const totalEarnedUsd = commissions.reduce((sum, c) => sum + c.commissionUsd, 0);
  const totalEarnedBtc = commissions.reduce((sum, c) => sum + c.commissionBtc, 0);
  
  const pendingUsd = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionUsd, 0);
  const pendingBtc = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionBtc, 0);

  const formatBtc = (val: number) => {
    return val.toFixed(8);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Users className={styles.titleIcon} size={28} />
          <div>
            <h1>{t("affiliates.title")}</h1>
            <p>{t("affiliates.subtitle")}</p>
          </div>
        </div>
        <div className={styles.badge}>
          <span>₿</span>
          <span>Bitcoin Payouts</span>
        </div>
      </header>

      {/* Referral Link Card */}
      <section className={styles.linkCard}>
        <div className={styles.linkCardHeader}>
          <h3>{t("affiliates.linkTitle")}</h3>
          <p>{t("affiliates.linkDesc")}</p>
        </div>
        <div className={styles.linkContainer}>
          <input
            type="text"
            readOnly
            value={referralLink}
            className={styles.linkInput}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopyLink}
            className={copied ? "btn-success" : "btn-primary"}
            style={{ minWidth: "150px" }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? t("affiliates.copied") : t("affiliates.copy")}</span>
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.statLabel}>{t("affiliates.referred")}</span>
            <Users size={20} style={{ color: "var(--accent-purple)", opacity: 0.8 }} />
          </div>
          <span className={styles.statValue}>{uniqueReferredUsers}</span>
          <span className={styles.statSubtext}>Usuarios registrados con tu link</span>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.statLabel}>{t("affiliates.totalEarned")} (USD)</span>
            <DollarSign size={20} style={{ color: "#10b981", opacity: 0.8 }} />
          </div>
          <span className={styles.statValue}>${totalEarnedUsd.toFixed(2)}</span>
          <span className={styles.statSubtext}>Acumulado total de ventas</span>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.statLabel}>{t("affiliates.totalEarned")} (BTC)</span>
            <Wallet size={20} style={{ color: "#f59e0b", opacity: 0.8 }} />
          </div>
          <span className={styles.statValue} style={{ fontSize: "24px", padding: "6px 0" }}>
            {formatBtc(totalEarnedBtc)}
          </span>
          <span className={styles.statSubtext}>Monto total acumulado en BTC</span>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={styles.statLabel}>{t("affiliates.pendingPayout")}</span>
            <TrendingUp size={20} style={{ color: "var(--accent-cyan)", opacity: 0.8 }} />
          </div>
          <span className={styles.statValue} style={{ fontSize: "24px", padding: "6px 0" }}>
            {formatBtc(pendingBtc)}
          </span>
          <span className={styles.statSubtext}>${pendingUsd.toFixed(2)} USD pendientes</span>
        </div>
      </section>

      {/* Commissions History Table */}
      <section className={`glass-card ${styles.tableCard}`}>
        <div className={styles.tableHeader}>
          <h3>{t("affiliates.tableTitle")}</h3>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <RefreshCw size={24} className="spin" style={{ color: "var(--accent-purple)" }} />
          </div>
        ) : commissions.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={40} className={styles.emptyIcon} />
            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t("affiliates.empty")}</p>
            <p>{t("affiliates.emptyDesc")}</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("affiliates.colDate")}</th>
                  <th>ID Referido</th>
                  <th>{t("affiliates.colPlan")}</th>
                  <th>{t("affiliates.colAmount")}</th>
                  <th>{t("affiliates.colCommission")}</th>
                  <th>{t("affiliates.colTx")}</th>
                  <th>{t("affiliates.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((comm) => (
                  <tr key={comm.id}>
                    <td>
                      {comm.createdAt?.toDate
                        ? comm.createdAt.toDate().toLocaleDateString()
                        : "Reciente"}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {comm.referredUserId.slice(0, 8)}...{comm.referredUserId.slice(-4)}
                    </td>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{comm.planId}</td>
                    <td>${comm.amountUsd.toFixed(2)}</td>
                    <td style={{ color: "#10b981", fontWeight: 700 }}>
                      ${comm.commissionUsd.toFixed(2)} <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>({formatBtc(comm.commissionBtc)} BTC)</span>
                    </td>
                    <td>
                      {comm.txHash ? (
                        <a
                          href={`https://mempool.space/tx/${comm.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-accent"
                          style={{ fontSize: "12px", fontFamily: "monospace" }}
                        >
                          {comm.txHash.slice(0, 8)}...{comm.txHash.slice(-6)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          comm.status === "paid" ? styles.statusPaid : styles.statusPending
                        }`}
                      >
                        {comm.status === "paid" ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
