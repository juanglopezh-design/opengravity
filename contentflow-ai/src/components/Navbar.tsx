"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className="gradient-text">ContentFlow AI</span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
          <Link href="#features" className={styles.link}>Características</Link>
          <Link href="#pricing" className={styles.link}>Precios</Link>
          <Link href="#testimonials" className={styles.link}>Testimonios</Link>
        </div>

        <div className={styles.actions}>
          <Link href="/login" className="btn-secondary" style={{ padding: "10px 20px", fontSize: "14px" }}>
            Iniciar sesión
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
            Empezar
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
