"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import styles from "./Pricing.module.css";

const plans = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    period: "/siempre",
    desc: "Para probar y enamorarte",
    features: [
      "10 generaciones por mes",
      "5 tipos de contenido",
      "1 idioma",
      "Historial básico",
    ],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    name: "Starter",
    id: "starter",
    price: "$9",
    period: "/mes",
    desc: "Para creadores que quieren crecer",
    features: [
      "100 generaciones por mes",
      "30+ tipos de contenido",
      "5 idiomas",
      "Historial completo",
      "Soporte por email",
    ],
    cta: "Empezar con Starter",
    highlight: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$29",
    period: "/mes",
    desc: "Para negocios y agencias serias",
    features: [
      "Generaciones ilimitadas",
      "50+ tipos de contenido",
      "12 idiomas",
      "Historial ilimitado",
      "Soporte prioritario 24/7",
      "API Access",
      "Team workspace",
    ],
    cta: "Empezar con Pro",
    highlight: true,
    badge: "MÁS POPULAR",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
];

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (plan: any) => {
    if (plan.id === "free") {
      router.push("/signup");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setLoading(plan.id);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al iniciar el pago. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Ocurrió un error inesperado.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className={styles.section} id="pricing">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">💰 Precios</div>
          <h2 className={styles.title}>
            Planes simples,{" "}
            <span className="gradient-text">resultados extraordinarios</span>
          </h2>
          <p className={styles.subtitle}>
            Empieza gratis. Escala cuando estés listo. Sin sorpresas ni letras pequeñas.
          </p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.card} ${plan.highlight ? styles.highlighted : ""}`}
            >
              {plan.badge && (
                <div className={styles.badge}>{plan.badge}</div>
              )}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.check}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan(plan)}
                className={plan.highlight ? "btn-primary" : "btn-secondary"}
                id={`pricing-cta-${plan.name.toLowerCase()}`}
                disabled={loading === plan.id}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "auto",
                  cursor: loading === plan.id ? "not-allowed" : "pointer",
                  opacity: loading === plan.id ? 0.7 : 1,
                }}
              >
                {loading === plan.id ? "Cargando..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          💳 Sin tarjeta de crédito para el plan Free &nbsp;•&nbsp; Cancela en cualquier momento &nbsp;•&nbsp; Reembolso 30 días
        </p>
      </div>
    </section>
  );
}
