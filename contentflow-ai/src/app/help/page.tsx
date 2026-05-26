import type { Metadata } from "next";
import Link from "next/link";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Ayuda",
  description: "Centro de ayuda de ContentFlow AI.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>⚡ ContentFlow AI</Link>
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
        </nav>
      </header>
      <article className={styles.content}>
        <p className={styles.eyebrow}>Soporte</p>
        <h1 className={styles.title}>Ayuda</h1>
        <p className={styles.subtitle}>Respuestas rápidas para empezar a crear contenido sin fricción.</p>

        <section className={styles.section}>
          <h2>Cómo empezar</h2>
          <p>Crea una cuenta gratis, entra al dashboard, elige el tipo de contenido, describe tu idea y genera una primera versión en segundos.</p>
        </section>

        <section className={styles.section}>
          <h2>No puedo iniciar sesión</h2>
          <p>Comprueba que el email y la contraseña sean correctos. Si usas Google, asegúrate de elegir la misma cuenta con la que te registraste.</p>
        </section>

        <section className={styles.section}>
          <h2>Pagos y planes</h2>
          <p>Los planes Starter, Pro y Business se activan después de verificar el pago. Si tu pago no aparece reflejado, escribe a soporte con el email de tu cuenta.</p>
        </section>

        <section className={styles.section}>
          <h2>Contacto</h2>
          <p>Para soporte directo, escríbenos a <a href="mailto:hola@contentflowai.com">hola@contentflowai.com</a>. Incluye tu email de cuenta y una descripción breve del problema.</p>
        </section>
      </article>
    </main>
  );
}
