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
              <span aria-label="YouTube" title="YouTube" style={{ cursor: "default" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                </svg>
              </span>
              <span aria-label="Instagram" title="Instagram" style={{ cursor: "default" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="url(#ig)" aria-hidden="true">
                  <defs>
                    <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="25%" stopColor="#e6683c"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="75%" stopColor="#cc2366"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>
                </svg>
              </span>
              <span aria-label="TikTok" title="TikTok" style={{ cursor: "default" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f1f5f9" aria-hidden="true">
                  <path d="M19.6 3.3A4.9 4.9 0 0 1 14.7 0h-3.6v16.4a2.9 2.9 0 0 1-2.9 2.5 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .5 0 .8.1V9.5a6.5 6.5 0 0 0-.8-.1 6.5 6.5 0 0 0-6.5 6.5A6.5 6.5 0 0 0 8.2 22.4a6.5 6.5 0 0 0 6.5-6.5V8.1a8.4 8.4 0 0 0 4.9 1.6V6.1a4.9 4.9 0 0 1-3-2.8z"/>
                </svg>
              </span>
              <span aria-label="Gmail" title="Gmail" style={{ cursor: "default" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 5.5v13A1.5 1.5 0 0 1 22.5 20H21V9.3l-9 5.6-9-5.6V20H1.5A1.5 1.5 0 0 1 0 18.5v-13A1.5 1.5 0 0 1 1.5 4h.8L12 10.3 21.7 4h.8A1.5 1.5 0 0 1 24 5.5z" fill="#EA4335"/>
                  <path d="M3 9.3V20H1.5A1.5 1.5 0 0 1 0 18.5v-13L3 9.3z" fill="#34A853"/>
                  <path d="M21 9.3V20h1.5A1.5 1.5 0 0 0 24 18.5v-13L21 9.3z" fill="#FBBC05"/>
                  <path d="M0 5.5L3 9.3 12 10.3l9-1L24 5.5A1.5 1.5 0 0 0 22.5 4h-.8L12 10.3 2.3 4H1.5A1.5 1.5 0 0 0 0 5.5z" fill="#EA4335"/>
                </svg>
              </span>
              <span aria-label="WhatsApp" title="WhatsApp" style={{ cursor: "default" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4C8 8.3 7.2 9 7.2 10.6s1.1 3.1 1.3 3.3c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
                </svg>
              </span>
            </div>
          </div>

          <div className={styles.links}>
            <div className={styles.col}>
              <h4>Producto</h4>
              <Link href="#features">Características</Link>
              <Link href="#pricing">Precios</Link>
              <Link href="#testimonials">Testimonios</Link>
            </div>
            <div className={styles.col}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacidad</Link>
              <Link href="/terms">Términos</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
            <div className={styles.col}>
              <h4>Soporte</h4>
              <a href="mailto:juanglopezh@gmail.com">Contacto</a>
              <Link href="/help">Ayuda</Link>
              <Link href="/status">Estado</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} ContentFlow AI. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ y potenciado por Gemini AI</p>
        </div>
      </div>
    </footer>
  );
}
