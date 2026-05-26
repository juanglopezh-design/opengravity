"use client";
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
  },
  {
    name: "Business",
    id: "business",
    price: "$79",
    period: "/mes",
    desc: "Para agencias autónomas de élite",
    features: [
      "Todo lo de Pro",
      "Agentes IA autónomos",
      "Generación automática de TikToks",
      "Publicación automática",
      "IA para responder mensajes",
      "Creación masiva de contenido",
      "Soporte VIP dedicado 24/7",
    ],
    cta: "Empezar con Business",
    highlight: false,
  },
];

export default function Pricing() {
  const router = useRouter();

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (plan.id === "free") {
      router.push("/signup");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      // No logueado: redirigir a login con plan como parámetro
      // El login construirá el orderId con el UID real tras autenticarse
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    // Logueado: ir directo al checkout con plan_id solamente
    // El checkout genera el orderId con el UID confirmado por Firebase Auth
    const params = new URLSearchParams({
      plan_id: plan.id,
      user_email: user.email || "",
    });

    router.push(`/checkout/crypto?${params.toString()}`);
  };

  return (
    <section className={styles.section} id="pricing">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">₿ Bitcoin only</div>
          <h2 className={styles.title}>
            Planes simples, resultados extraordinarios
          </h2>
          <p className={styles.subtitle}>
            Empieza gratis. Escala cuando estés listo. Los planes de pago se activan solo con Bitcoin.
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
                style={{ width: "100%", justifyContent: "center" }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
