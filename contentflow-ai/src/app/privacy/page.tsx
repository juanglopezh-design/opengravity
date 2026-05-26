import type { Metadata } from "next";
import Link from "next/link";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Política de privacidad de ContentFlow AI.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
        <h1 className={styles.title}>Política de privacidad</h1>
        <p className={styles.subtitle}>Última actualización: 26 de mayo de 2026.</p>

        <section className={styles.section}>
          <h2>Datos que recopilamos</h2>
          <p>Recopilamos los datos necesarios para crear y administrar tu cuenta, como nombre, email, método de acceso, plan activo, uso de generaciones y datos técnicos básicos para seguridad y diagnóstico.</p>
        </section>

        <section className={styles.section}>
          <h2>Cómo usamos tus datos</h2>
          <p>Usamos la información para autenticarte, entregar el servicio, procesar pagos, limitar el uso según tu plan, mejorar la estabilidad del producto y responder solicitudes de soporte.</p>
        </section>

        <section className={styles.section}>
          <h2>Contenido generado</h2>
          <p>El contenido que generas te pertenece. No lo vendemos ni lo usamos para entrenar modelos propios. Puede almacenarse en tu historial para que puedas consultarlo y reutilizarlo.</p>
        </section>

        <section className={styles.section}>
          <h2>Proveedores</h2>
          <p>Trabajamos con proveedores de infraestructura, autenticación, base de datos, pagos e IA para operar ContentFlow AI. Solo compartimos los datos necesarios para prestar el servicio.</p>
        </section>

        <section className={styles.section}>
          <h2>Tus derechos</h2>
          <p>Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a <a href="mailto:hola@contentflowai.com">hola@contentflowai.com</a>.</p>
        </section>
      </article>
    </main>
  );
}
