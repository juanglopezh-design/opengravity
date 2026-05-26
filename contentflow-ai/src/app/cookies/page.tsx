import type { Metadata } from "next";
import Link from "next/link";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Política de cookies de ContentFlow AI.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>⚡ ContentFlow AI</Link>
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
        </nav>
      </header>
      <article className={styles.content}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Política de cookies</h1>
        <p className={styles.subtitle}>Última actualización: 26 de mayo de 2026.</p>

        <section className={styles.section}>
          <h2>Qué son</h2>
          <p>Las cookies y tecnologías similares ayudan a mantener sesiones, recordar preferencias y entender el uso técnico del producto.</p>
        </section>

        <section className={styles.section}>
          <h2>Cookies necesarias</h2>
          <p>Usamos cookies o almacenamiento local necesarios para autenticación, seguridad, funcionamiento del dashboard y prevención de abuso.</p>
        </section>

        <section className={styles.section}>
          <h2>Medición y mejora</h2>
          <p>Podemos usar datos técnicos agregados para detectar errores, mejorar rendimiento y priorizar mejoras del producto.</p>
        </section>

        <section className={styles.section}>
          <h2>Control</h2>
          <p>Puedes borrar cookies desde tu navegador. Algunas funciones, como iniciar sesión, pueden dejar de funcionar si bloqueas almacenamiento esencial.</p>
        </section>
      </article>
    </main>
  );
}
