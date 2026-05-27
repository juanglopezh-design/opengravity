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
          <p>
            Elige el plan Basic ($1.99/mes) para comenzar con 25 generaciones al mes.
            Crea tu cuenta, activa el plan con Bitcoin y entra al dashboard.
            Desde ahí elige el tipo de contenido, describe tu idea y genera tu primera versión en segundos.
          </p>
          <p style={{ marginTop: "12px" }}>
            <Link href="/signup" style={{ color: "var(--accent-purple)", fontWeight: 600 }}>
              → Crear cuenta y empezar
            </Link>
          </p>
        </section>

        <section className={styles.section}>
          <h2>No puedo iniciar sesión</h2>
          <p>Comprueba que el email y la contraseña sean correctos. Si usas Google, asegúrate de elegir la misma cuenta con la que te registraste.</p>
        </section>

        <section className={styles.section}>
          <h2>Pagos y planes</h2>
          <p>
            Todos los planes (Basic, Starter, Pro y Business) se activan con Bitcoin después de verificar la transacción en la blockchain.
            Si tu pago no aparece reflejado en los próximos 30 minutos, escríbenos a soporte con el TX ID de tu transacción.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contacto</h2>
          <p>
            Para soporte directo, escríbenos a{" "}
            <a href="mailto:juanglopezh@gmail.com">juanglopezh@gmail.com</a>.
            Incluye tu email de cuenta y una descripción breve del problema.
          </p>
        </section>
      </article>
    </main>
  );
}
