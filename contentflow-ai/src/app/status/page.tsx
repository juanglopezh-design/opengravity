import type { Metadata } from "next";
import Link from "next/link";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Estado",
  description: "Estado del servicio de ContentFlow AI.",
  alternates: { canonical: "/status" },
};

export const dynamic = "force-dynamic";

async function getServiceStatus() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://contentflow-ai-9wy7.onrender.com"}/api/health`,
      { next: { revalidate: 0 }, signal: AbortSignal.timeout(5000) }
    );
    return res.ok;
  } catch {
    return false;
  }
}

const services = [
  "Aplicación web",
  "Autenticación",
  "Generación con IA",
  "Dashboard",
  "Pagos cripto",
];

export default async function StatusPage() {
  const apiOnline = await getServiceStatus();

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
        <p className={styles.subtitle}>
          {apiOnline
            ? "✅ Todos los sistemas operativos."
            : "⚠️ Detectamos una posible incidencia. Estamos trabajando en ello."}
        </p>

        <section className={styles.section}>
          <div className={styles.statusGrid}>
            {services.map((service) => (
              <div className={styles.statusItem} key={service}>
                <strong>{service}</strong>
                <span className={apiOnline ? styles.ok : styles.error}>
                  {apiOnline ? "Operativo" : "Verificando..."}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Reportar un problema</h2>
          <p>
            Escríbenos a{" "}
            <a href="mailto:juanglopezh@gmail.com">juanglopezh@gmail.com</a>{" "}
            con la URL, hora aproximada y una captura si la tienes.
          </p>
        </section>
      </article>
    </main>
  );
}
