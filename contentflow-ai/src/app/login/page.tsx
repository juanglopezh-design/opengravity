"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import styles from "./auth.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const plan = searchParams.get("plan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ensureUserDoc = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "Usuario",
        email: user.email || "",
        plan: "pending",       // no active plan until payment confirmed
        generationsUsed: 0,
        generationsLimit: 0,   // zero until paid
        createdAt: serverTimestamp(),
      });
    }
  };

  const routeAfterAuth = async (user: User) => {
    // Set a lightweight auth hint cookie so the middleware can guard protected routes
    document.cookie = "cf_auth=1; path=/; max-age=3600; SameSite=Strict";

    if (redirect === "/pricing" && plan && plan !== "basic") {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ planId: plan }),
        });
        const data = await res.json();
        if (res.ok && data.orderId) {
          const params = new URLSearchParams({
            order_id: data.orderId,
            plan_id: data.planId,
            user_email: user.email || email.trim(),
          });
          router.push(`/checkout/crypto?${params.toString()}`);
          return;
        }
      } catch {
        // Fall through to dashboard on error
      }
    }

    if (redirect?.startsWith("/") && !redirect.startsWith("//") && redirect !== "/login") {
      router.push(redirect);
      return;
    }

    router.push("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      await routeAfterAuth(user);
    } catch (err) {
      setError(getAuthErrorMessage(err, "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);
      await ensureUserDoc(user);
      await routeAfterAuth(user);
    } catch (err) {
      setError(getAuthErrorMessage(err, "No pudimos iniciar sesión con Google. Inténtalo de nuevo."));
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
          <h1 className={styles.title}>Bienvenido de vuelta</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar generando contenido</p>
        </div>

        <button
          id="google-login-btn"
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={loading}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.4 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.4 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 36.2 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C41.8 35.5 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          Continuar con Google
        </button>

        <div className={styles.divider}><span>o con email</span></div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
          <div className={styles.field}>
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.error} role="alert" aria-live="polite">{error}</div>}

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className={styles.switchLink}>
          ¿No tienes cuenta?{" "}
          <Link href="/signup">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
