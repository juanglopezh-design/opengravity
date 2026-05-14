"use client";
import Link from "next/link";
import styles from "./Pricing.module.css";

const plans = [
  {
    name: "Free",
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
    href: "/signup",
    highlight: false,
    badge: null,
  },
  {
    name: "Starter",
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
    href: "/signup?plan=starter",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
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
    href: "/signup?plan=pro",
    highlight: true,
    badge: "MÁS POPULAR",
  },
];

export default function Pricing() {
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
              <Link
                href={plan.href}
                className={plan.highlight ? "btn-primary" : "btn-secondary"}
                id={`pricing-cta-${plan.name.toLowerCase()}`}
                style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
              >
                {plan.cta}
              </Link>
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
