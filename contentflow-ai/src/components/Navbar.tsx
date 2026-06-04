"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className="gradient-text">ContentFlow AI</span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
          <Link href="#features" className={styles.link}>
            {t("nav.features")}
          </Link>
          <Link href="#pricing" className={styles.link}>
            {t("nav.pricing")}
          </Link>
          <Link href="#testimonials" className={styles.link}>
            {t("nav.testimonials")}
          </Link>
        </div>

        <div className={styles.actions}>
          <div className={styles.langSelector}>
            <button
              onClick={() => setLocale("en")}
              className={`${styles.langBtn} ${locale === "en" ? styles.activeLang : ""}`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <span className={styles.langDivider}>/</span>
            <button
              onClick={() => setLocale("es")}
              className={`${styles.langBtn} ${locale === "es" ? styles.activeLang : ""}`}
              aria-label="Cambiar a Español"
            >
              ES
            </button>
          </div>

          <Link href="/login" className="btn-secondary" style={{ padding: "10px 20px", fontSize: "14px" }}>
            {t("nav.login")}
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
            {t("nav.getStarted")}
          </Link>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          id="nav-menu-toggle"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

