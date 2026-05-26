import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span>⚡</span>
              <span className="gradient-text">ContentFlow AI</span>
            </Link>
            <p className={styles.desc}>
              La plataforma de generación de contenido con IA más avanzada del mundo.
              Crea contenido viral en segundos.
            </p>
            <div className={styles.socials}>
              <a href="https://x.com/contentflowai" id="footer-twitter" aria-label="ContentFlow AI en X" target="_blank" rel="noopener noreferrer">𝕏</a>
              <a href="https://instagram.com/contentflowai" id="footer-instagram" aria-label="ContentFlow AI en Instagram" target="_blank" rel="noopener noreferrer">📸</a>
              <a href="https://www.linkedin.com/company/contentflow-ai" id="footer-linkedin" aria-label="ContentFlow AI en LinkedIn" target="_blank" rel="noopener noreferrer">💼</a>
            </div>
          </div>

          <div className={styles.links}>
            <div className={styles.col}>
              <h4>Producto</h4>
              <Link href="#features">Características</Link>
              <Link href="#pricing">Precios</Link>
              <Link href="#testimonials">Testimonios</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className={styles.col}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacidad</Link>
              <Link href="/terms">Términos</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
            <div className={styles.col}>
              <h4>Soporte</h4>
              <a href="mailto:hola@contentflowai.com">Contacto</a>
              <Link href="/help">Ayuda</Link>
              <Link href="/status">Estado</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 ContentFlow AI. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ y potenciado por Gemini AI</p>
        </div>
      </div>
    </footer>
  );
}
