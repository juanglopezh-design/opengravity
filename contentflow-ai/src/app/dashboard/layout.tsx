"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import styles from "./layout.module.css";
import { LayoutDashboard, History, Settings, LogOut, Sparkles } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        // Fetch user plan data
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Cargando tu espacio...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/dashboard" className={styles.logo}>
            <span>⚡</span>
            <span className="gradient-text">ContentFlow</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={20} />
            <span>Generador</span>
          </Link>
          <Link href="/dashboard/history" className={styles.navItem}>
            <History size={20} />
            <span>Historial</span>
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
        </nav>

        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <Sparkles size={16} className={styles.planIcon} />
            <span>Plan {userData?.plan === "pro" ? "Pro" : userData?.plan === "starter" ? "Starter" : "Free"}</span>
          </div>
          <div className={styles.usageBar}>
            <div 
              className={styles.usageFill} 
              style={{ width: `${Math.min(100, ((userData?.generationsUsed || 0) / (userData?.generationsLimit || 10)) * 100)}%` }}
            ></div>
          </div>
          <p className={styles.usageText}>
            {userData?.generationsUsed || 0} / {userData?.plan === "pro" ? "∞" : (userData?.generationsLimit || 10)} generaciones
          </p>
          {userData?.plan !== "pro" && (
            <Link href="/dashboard/settings" className={styles.upgradeBtn}>
              Mejorar plan
            </Link>
          )}
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.displayName || "Usuario"}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
