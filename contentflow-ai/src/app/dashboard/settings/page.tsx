"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./settings.module.css";
import { Bitcoin, Sparkles, User } from "lucide-react";
import { isUnlimitedPlan } from "@/lib/config";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      let data: any = null;
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          data = docSnap.data();
        }
      } catch (e) {
        console.warn("Could not fetch user doc from Firestore in settings:", e);
      }

      // Local simulation fallback for dev mode
      if (process.env.NODE_ENV === "development") {
        try {
          const mockUpgradeStr = localStorage.getItem(`contentflow_mock_upgrade_${user.uid}`);
          if (mockUpgradeStr) {
            const mockUpgrade = JSON.parse(mockUpgradeStr);
            data = {
              ...data,
              plan: mockUpgrade.plan,
              generationsLimit: mockUpgrade.generationsLimit,
            };
          }
        } catch (storageError) {
          console.error("Local storage read error in settings:", storageError);
        }
      }

      setUserData(data);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleCheckout = (planId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    // Redirigir directo a la página de pago Bitcoin.
    const orderId = `${user.uid}___${planId}___${Date.now()}`;
    const params = new URLSearchParams({
      order_id: orderId,
      plan_id: planId,
      user_email: user.email || "",
    });

    window.location.href = `/checkout/crypto?${params.toString()}`;
  };

  if (loading) return <div className={styles.loading}>Cargando configuración...</div>;

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
              <span className={styles.value}>{userData?.name || auth.currentUser?.displayName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{userData?.email || auth.currentUser?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Plan Actual</span>
              <span className={styles.valueBadge} style={{ textTransform: "capitalize" }}>
                {userData?.plan || "free"}
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
                {userData?.generationsUsed || 0} /{" "}
                {isUnlimitedPlan(userData?.plan)
                  ? "∞"
                  : userData?.generationsLimit || 10}
              </span>
            </div>
            <div className={styles.usageBar}>
              <div 
                className={styles.usageFill} 
                style={{ 
                  width: `${
                    isUnlimitedPlan(userData?.plan)
                      ? 100
                      : Math.min(100, ((userData?.generationsUsed || 0) / (userData?.generationsLimit || 10)) * 100)
                  }%` 
                }}
              ></div>
            </div>
          </div>

          {userData?.plan !== "business" && (
            <div className={styles.upgradeSection}>
              <h3>Mejora tu plan</h3>
              <p>Obtén generaciones ilimitadas, agentes autónomos y más herramientas elite.</p>
              
              <div className={styles.plans}>
                {userData?.plan === "free" && (
                  <button 
                    onClick={() => handleCheckout("starter")} 
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Plan Starter ($9)
                  </button>
                )}
                {(userData?.plan === "free" || userData?.plan === "starter") && (
                  <button 
                    onClick={() => handleCheckout("pro")} 
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Plan Pro ($29)
                  </button>
                )}
                <button 
                  onClick={() => handleCheckout("business")} 
                  className="btn-primary"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <Sparkles size={16} /> Plan Business ($79)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
