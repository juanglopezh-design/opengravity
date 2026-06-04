"use client";
import styles from "./Features.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: "⚡",
      title: t("features.item1.title"),
      desc: t("features.item1.desc"),
    },
    {
      icon: "🎯",
      title: t("features.item2.title"),
      desc: t("features.item2.desc"),
    },
    {
      icon: "🌍",
      title: t("features.item3.title"),
      desc: t("features.item3.desc"),
    },
    {
      icon: "🤖",
      title: t("features.item4.title"),
      desc: t("features.item4.desc"),
    },
    {
      icon: "📊",
      title: t("features.item5.title"),
      desc: t("features.item5.desc"),
    },
    {
      icon: "🔒",
      title: t("features.item6.title"),
      desc: t("features.item6.desc"),
    },
  ];

  return (
    <section className={styles.section} id="features">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">{t("features.badge")}</div>
          <h2 className={styles.title}>
            {t("features.title1")}
            <span className="gradient-text">{t("features.title2")}</span>
          </h2>
          <p className={styles.subtitle}>
            {t("features.subtitle")}
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card ${styles.card}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={styles.iconWrap}>
                <span className={styles.icon}>{f.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

