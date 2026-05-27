"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./settings.module.css";
import { Bitcoin, Sparkles, User } from "lucide-react";
import { isUnlimitedPlan } from "@/lib/config";

export default function SettingsPage() {
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      let data: Record<string, unknown> | null = null;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          data = docSnap.data() as Record<string, unknown>;
        }
      } catch (e) {
        console.warn("Could not fetch user doc from Firestore in settings:", e);
      }

      if (process.env.NODE_ENV === "development") {
        try {
          const mockUpgradeStr = localStorage.getItem(`contentflow_mock_upgrade_${user.uid}`);
          if (mockUpgradeStr) {
            const mockUpgrade = JSON.parse(mockUpgradeStr);
            data = { ...data, plan: mockUpgrade.plan, generationsLimit: mockUpgrade.generationsLimit };
          }
        } catch (storageError) {
          console.error("Local storage read error in settings:", storageError);
        }
      }

      setUserData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckout = async (planId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setOrderLoading(planId);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        console.error("[Settings] create-order error:", data.error);
        return;
      }

      const params = new URLSearchParams({
        order_id: data.orderId,
        plan_id: data.planId,
        user_email: user.email || "",
      });
      window.location.href = `/checkout/crypto?${params.toString()}`;
    } catch (err) {
      console.error("[Settings] Error creating order:", err);
    } finally {
      setOrderLoading(null);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando configuración...</div>;

  const currentUser = auth.currentUser;
  const plan = (userData?.plan as string) || "free";
  const generationsUsed = Number(userData?.generationsUsed ?? 0);
  const generationsLimit = Number(userData?.generationsLimit ?? 10);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.subtitle}>Gestiona tu cuenta y suscripción.</p>
      </header>

      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <User size={20} className={styles.icon} />
            <h2>Perfil</h2>
          </div>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nombre</span>
              <span className={styles.value}>
                {(userData?.name as string) || currentUser?.displayName || "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>
                {(userData?.email as string) || currentUser?.email || "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Plan Actual</span>
              <span className={styles.valueBadge} style={{ textTransform: "capitalize" }}>
                {plan}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <Bitcoin size={20} className={styles.icon} />
            <h2>Suscripción Bitcoin</h2>
          </div>

          <div className={styles.usageSection}>
            <div className={styles.usageHeader}>
              <span>Uso mensual</span>
              <span>
                {generationsUsed} / {isUnlimitedPlan(plan) ? "∞" : generationsLimit}
              </span>
            </div>
            <div className={styles.usageBar}>
              <div
                className={styles.usageFill}
                style={{
                  width: `${
                    isUnlimitedPlan(plan)
                      ? 100
                      : Math.min(100, (generationsUsed / generationsLimit) * 100)
                  }%`,
                }}
              />
            </div>
          </div>

          {plan !== "business" && (
            <div className={styles.upgradeSection}>
              <h3>Mejora tu plan</h3>
              <p>Obtén generaciones ilimitadas, agentes autónomos y más herramientas elite.</p>

              <div className={styles.plans}>
                {plan === "free" && (
                  <button
                    onClick={() => handleCheckout("starter")}
                    className="btn-secondary"
                    disabled={orderLoading === "starter"}
                    style={{ flex: 1 }}
                  >
                    {orderLoading === "starter" ? "Preparando..." : "Plan Starter ($9)"}
                  </button>
                )}
                {(plan === "free" || plan === "starter") && (
                  <button
                    onClick={() => handleCheckout("pro")}
                    className="btn-secondary"
                    disabled={orderLoading === "pro"}
                    style={{ flex: 1 }}
                  >
                    {orderLoading === "pro" ? "Preparando..." : "Plan Pro ($29)"}
                  </button>
                )}
                <button
                  onClick={() => handleCheckout("business")}
                  className="btn-primary"
                  disabled={orderLoading === "business"}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <Sparkles size={16} />
                  {orderLoading === "business" ? "Preparando..." : "Plan Business ($79)"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
