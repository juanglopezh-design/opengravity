import type { Metadata } from "next";
import Link from "next/link";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Términos",
  description: "Términos de uso de ContentFlow AI.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
        <h1 className={styles.title}>Términos de uso</h1>
        <p className={styles.subtitle}>Última actualización: 26 de mayo de 2026.</p>

        <section className={styles.section}>
          <h2>Uso del servicio</h2>
          <p>ContentFlow AI te ayuda a crear contenido con inteligencia artificial. Debes usar la plataforma de forma legal, responsable y respetando derechos de terceros.</p>
        </section>

        <section className={styles.section}>
          <h2>Cuentas y seguridad</h2>
          <p>Eres responsable de mantener la seguridad de tu cuenta y de las acciones realizadas desde ella. Si detectas un uso no autorizado, contáctanos cuanto antes.</p>
        </section>

        <section className={styles.section}>
          <h2>Planes y pagos</h2>
          <p>Los planes de pago amplían límites y funciones. Los precios y beneficios vigentes se muestran en la página de precios antes de contratar.</p>
        </section>

        <section className={styles.section}>
          <h2>Contenido</h2>
          <p>Debes revisar el contenido generado antes de publicarlo. La IA puede cometer errores, por lo que no garantizamos exactitud legal, médica, financiera o factual.</p>
        </section>

        <section className={styles.section}>
          <h2>Contacto</h2>
          <p>Para dudas sobre estos términos, escríbenos a <a href="mailto:juanglopezh@gmail.com">juanglopezh@gmail.com</a>.</p>
        </section>
      </article>
    </main>
  );
}
