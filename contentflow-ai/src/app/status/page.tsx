import type { Metadata } from "next";
import Link from "next/link";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Estado",
  description: "Estado del servicio de ContentFlow AI.",
  alternates: { canonical: "/status" },
};

const services = [
  "Aplicación web",
  "Autenticación",
  "Generación con IA",
  "Dashboard",
  "Pagos cripto",
];

export default function StatusPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>⚡ ContentFlow AI</Link>
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
        </nav>
      </header>
      <article className={styles.content}>
        <p className={styles.eyebrow}>Sistema</p>
        <h1 className={styles.title}>Estado del servicio</h1>
        <p className={styles.subtitle}>Panel simple de disponibilidad. Si detectas una incidencia, contacta con soporte.</p>

        <section className={styles.section}>
          <div className={styles.statusGrid}>
            {services.map((service) => (
              <div className={styles.statusItem} key={service}>
                <strong>{service}</strong>
                <span className={styles.ok}>Operativo</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Reportar un problema</h2>
          <p>Escríbenos a <a href="mailto:hola@contentflowai.com">hola@contentflowai.com</a> con la URL, hora aproximada y una captura si la tienes.</p>
        </section>
      </article>
    </main>
  );
}
