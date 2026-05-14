"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./settings.module.css";
import { User, CreditCard, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleCheckout = (plan: string) => {
    alert(`En producción, esto abriría Stripe Checkout para el plan ${plan}.`);
    // Aquí iría la integración real de Stripe:
    // 1. Llamar a API /api/checkout con el plan
    // 2. Recibir URL de Stripe
    // 3. window.location.href = url
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
              <span className={styles.valueBadge}>{userData?.plan || "free"}</span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <CreditCard size={20} className={styles.icon} />
            <h2>Suscripción</h2>
          </div>
          
          <div className={styles.usageSection}>
            <div className={styles.usageHeader}>
              <span>Uso mensual</span>
              <span>{userData?.generationsUsed || 0} / {userData?.plan === "pro" ? "∞" : (userData?.generationsLimit || 10)}</span>
            </div>
            <div className={styles.usageBar}>
              <div 
                className={styles.usageFill} 
                style={{ width: `${Math.min(100, ((userData?.generationsUsed || 0) / (userData?.generationsLimit || 10)) * 100)}%` }}
              ></div>
            </div>
          </div>

          {userData?.plan !== "pro" && (
            <div className={styles.upgradeSection}>
              <h3>Mejora tu plan</h3>
              <p>Obtén generaciones ilimitadas y más características.</p>
              
              <div className={styles.plans}>
                {userData?.plan === "free" && (
                  <button onClick={() => handleCheckout("starter")} className="btn-secondary">
                    Plan Starter ($9/mes)
                  </button>
                )}
                <button onClick={() => handleCheckout("pro")} className="btn-primary">
                  <Sparkles size={16} /> Plan Pro ($29/mes)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
