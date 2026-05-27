"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import styles from "../login/auth.module.css";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err, "No pudimos enviar el email. Verifica la dirección e inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`orb orb-purple ${styles.orb1}`} />
      <div className={`orb orb-blue ${styles.orb2}`} />

      <div className={`glass-card ${styles.card}`}>
        <Link href="/" className={styles.logo}>
          <span>⚡</span>
          <span className="gradient-text">ContentFlow AI</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.subtitle}>
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
              ¡Email enviado!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue el enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="btn-primary" style={{ display: "inline-flex", justifyContent: "center" }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="reset-email">Email de tu cuenta</label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>
        )}

        <p className={styles.switchLink}>
          <Link href="/login">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
