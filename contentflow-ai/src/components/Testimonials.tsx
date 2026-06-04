"use client";
import styles from "./Testimonials.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: "María González",
      role: t("testimonials.item1.role"),
      avatar: "MG",
      color: "#8b5cf6",
      text: t("testimonials.item1.text"),
      stars: 5,
    },
    {
      name: "Carlos Rodríguez",
      role: t("testimonials.item2.role"),
      avatar: "CR",
      color: "#3b82f6",
      text: t("testimonials.item2.text"),
      stars: 5,
    },
    {
      name: "Ana Martínez",
      role: t("testimonials.item3.role"),
      avatar: "AM",
      color: "#06b6d4",
      text: t("testimonials.item3.text"),
      stars: 5,
    },
    {
      name: "David Pérez",
      role: t("testimonials.item4.role"),
      avatar: "DP",
      color: "#f59e0b",
      text: t("testimonials.item4.text"),
      stars: 5,
    },
    {
      name: "Laura Sánchez",
      role: t("testimonials.item5.role"),
      avatar: "LS",
      color: "#ec4899",
      text: t("testimonials.item5.text"),
      stars: 5,
    },
    {
      name: "Roberto Lima",
      role: t("testimonials.item6.role"),
      avatar: "RL",
      color: "#10b981",
      text: t("testimonials.item6.text"),
      stars: 5,
    },
  ];

  return (
    <section className={styles.section} id="testimonials">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">{t("testimonials.badge")}</div>
          <h2 className={styles.title}>
            {t("testimonials.title1")}
            <span className="gradient-text">{t("testimonials.title2")}</span>
          </h2>
          <p className={styles.subtitle}>
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((t) => (
            <div key={t.name} className={`glass-card ${styles.card}`}>
              <div className={styles.stars}>
                {"★".repeat(t.stars)}
              </div>
              <p className={styles.text}>&quot;{t.text}&quot;</p>
              <div className={styles.author}>
                <div
                  className={styles.avatar}
                  style={{ background: t.color + "22", color: t.color, border: `1px solid ${t.color}44` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

