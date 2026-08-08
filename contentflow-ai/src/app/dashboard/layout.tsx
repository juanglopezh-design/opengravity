"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import styles from "./layout.module.css";
import { LayoutDashboard, History, Settings, LogOut, Sparkles, Megaphone, Users, Share2 } from "lucide-react";
import { UserDataProvider, useUserData } from "./UserDataContext";
import { isUnlimitedPlan } from "@/lib/config";
import { useLanguage } from "@/context/LanguageContext";

function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userData, refreshUserData } = useUserData();
  const { t } = useLanguage();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      refreshUserData();
      router.replace("/dashboard");
    }
  }, [searchParams, refreshUserData, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const usagePercent =
    isUnlimitedPlan(userData?.plan)
      ? 100
      : Math.min(
          100,
          ((userData?.generationsUsed || 0) / (userData?.generationsLimit || 10)) * 100
        );

  const getPlanText = (plan?: string) => {
    if (!plan || plan === "pending") return t("sidebar.noPlan");
    if (plan === "pro") return "Pro";
    if (plan === "business") return "Business";
    if (plan === "starter") return "Starter";
    if (plan === "basic") return "Basic";
    return "Basic";
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/dashboard" className={styles.logo}>
            <span>⚡</span>
            <span className="gradient-text">ContentFlow</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            <LayoutDashboard size={20} />
            <span>{t("sidebar.generator")}</span>
          </Link>
          <Link
            href="/dashboard/repurpose"
            className={`${styles.navItem} ${pathname === "/dashboard/repurpose" ? styles.active : ""}`}
          >
            <Share2 size={20} />
            <span>1-Click Omnicanal</span>
          </Link>
          <Link
            href="/dashboard/history"
            className={`${styles.navItem} ${pathname === "/dashboard/history" ? styles.active : ""}`}
          >
            <History size={20} />
            <span>{t("sidebar.history")}</span>
          </Link>
          <Link
            href="/dashboard/marketing"
            className={`${styles.navItem} ${pathname === "/dashboard/marketing" ? styles.active : ""}`}
          >
            <Megaphone size={20} />
            <span>{t("sidebar.marketing")}</span>
          </Link>
          <Link
            href="/dashboard/affiliates"
            className={`${styles.navItem} ${pathname === "/dashboard/affiliates" ? styles.active : ""}`}
          >
            <Users size={20} />
            <span>{t("sidebar.affiliates")}</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={`${styles.navItem} ${pathname === "/dashboard/settings" ? styles.active : ""}`}
          >
            <Settings size={20} />
            <span>{t("sidebar.settings")}</span>
          </Link>
        </nav>

        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <Sparkles size={16} className={styles.planIcon} />
            <span>
              {t("sidebar.plan")} {getPlanText(userData?.plan)}
            </span>
          </div>
          <div className={styles.usageBar}>
            <div className={styles.usageFill} style={{ width: `${usagePercent}%` }} />
          </div>
          <p className={styles.usageText}>
            {userData?.generationsUsed || 0} /{" "}
            {isUnlimitedPlan(userData?.plan) ? "∞" : userData?.generationsLimit || 25}{" "}
            {t("sidebar.generations")}
          </p>
          {!isUnlimitedPlan(userData?.plan) && (
            <Link href="/dashboard/settings" className={styles.upgradeBtn}>
              {t("sidebar.upgrade")}
            </Link>
          )}
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.displayName || "Usuario"}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title={t("sidebar.logout")}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Clear auth hint cookie on logout
        document.cookie = "cf_auth=; path=/; max-age=0; SameSite=Strict";
        router.push("/login");
      } else {
        // Refresh auth hint cookie so middleware keeps protecting routes
        document.cookie = "cf_auth=1; path=/; max-age=86400; SameSite=Strict; Secure";
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <p>{t("sidebar.loading")}</p>
      </div>
    );
  }

  return (
    <UserDataProvider userId={user.uid}>
      <Suspense>
        <DashboardShell user={user}>{children}</DashboardShell>
      </Suspense>
    </UserDataProvider>
  );
}

