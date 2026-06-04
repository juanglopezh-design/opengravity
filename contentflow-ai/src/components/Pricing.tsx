"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { btcWalletAddress } from "@/lib/config";
import styles from "./Pricing.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function Pricing() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { t } = useLanguage();

  const plans = [
    {
      name: "Basic",
      id: "basic",
      price: "$1.99",
      period: t("pricing.period"),
      desc: t("pricing.basic.desc"),
      features: t("pricing.basic.features") || [],
      cta: t("pricing.basic.cta"),
      highlight: false,
    },
    {
      name: "Starter",
      id: "starter",
      price: "$9",
      period: t("pricing.period"),
      desc: t("pricing.starter.desc"),
      features: t("pricing.starter.features") || [],
      cta: t("pricing.starter.cta"),
      highlight: false,
    },
    {
      name: "Pro",
      id: "pro",
      price: "$29",
      period: t("pricing.period"),
      desc: t("pricing.pro.desc"),
      features: t("pricing.pro.features") || [],
      cta: t("pricing.pro.cta"),
      highlight: true,
      badge: t("pricing.popular"),
    },
    {
      name: "Business",
      id: "business",
      price: "$79",
      period: t("pricing.period"),
      desc: t("pricing.business.desc"),
      features: t("pricing.business.features") || [],
      cta: t("pricing.business.cta"),
      highlight: false,
    },
  ];

  const handleSelectPlan = async (plan: (typeof plans)[0]) => {
    const user = auth.currentUser;
    if (!user) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        console.error("[Pricing] create-order error:", data.error);
        return;
      }

      const params = new URLSearchParams({
        order_id: data.orderId,
        plan_id: data.planId,
        user_email: user.email || "",
      });
      router.push(`/checkout/crypto?${params.toString()}`);
    } catch (err) {
      console.error("[Pricing] Error creating order:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className={styles.section} id="pricing">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">{t("pricing.badge")}</div>
          <h2 className={styles.title}>
            {t("pricing.title1")}
            <span className="gradient-text">{t("pricing.title2")}</span>
          </h2>
          <p className={styles.subtitle}>
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.card} ${plan.highlight ? styles.highlighted : ""}`}
            >
              {plan.badge && <div className={styles.badge}>{plan.badge}</div>}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <ul className={styles.features}>
                {plan.features.map((f: string) => (
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
                disabled={loadingPlan === plan.id}
                style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
              >
                {loadingPlan === plan.id ? t("pricing.preparing") : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          {t("pricing.note")} {btcWalletAddress}
        </p>
      </div>
    </section>
  );
}

