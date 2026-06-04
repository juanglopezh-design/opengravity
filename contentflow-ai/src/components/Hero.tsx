"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t, locale } = useLanguage();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const outputs = t("hero.demoOutputs") || [];
    const text = outputs[currentDemo];
    if (!text) return;
    let i = 0;
    setDisplayText("");
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setCurrentDemo((prev) => (prev + 1) % outputs.length);
        }, 2500);
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [currentDemo, locale, t]);

  return (
    <section className={styles.hero}>
      <div className={`orb orb-purple ${styles.orb1}`} />
      <div className={`orb orb-blue ${styles.orb2}`} />

      <div className="container">
        <div className={styles.content}>
          <div className={`badge fade-in-up ${styles.badge}`} style={{ animationDelay: "0.1s" }}>
            <span>✨</span>
            {t("hero.badge")}
          </div>

          <h1 className={`${styles.headline} fade-in-up`} style={{ animationDelay: "0.2s" }}>
            {t("hero.title1")}
            <span className="gradient-text">{t("hero.titleViral")}</span>
            {t("hero.title2")}
            <br />
            <span className="gradient-text">{t("hero.titleTime")}</span>
          </h1>

          <p className={`${styles.subtitle} fade-in-up`} style={{ animationDelay: "0.3s" }}>
            {t("hero.subtitle")}
          </p>

          <div className={`${styles.ctas} fade-in-up`} style={{ animationDelay: "0.4s" }}>
            <Link href="/signup" className="btn-primary" id="hero-cta-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              {t("hero.ctaPrimary")}
              <span>→</span>
            </Link>
            <Link href="#features" className="btn-secondary" id="hero-cta-secondary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              {t("hero.ctaSecondary")}
            </Link>
          </div>

          <p className={styles.note}>{t("hero.note")}</p>

          <div className={`glass-card ${styles.demoCard} fade-in-up float-anim`} style={{ animationDelay: "0.5s" }}>
            <div className={styles.demoHeader}>
              <div className={styles.dots}>
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </div>
              <span className={styles.demoLabel}>{t("hero.demoLabel")}</span>
            </div>
            <div className={styles.demoPrompt}>
              <span className={styles.promptLabel}>Prompt:</span>
              <span className={styles.promptText}>{t("hero.demoPrompt")}</span>
            </div>
            <div className={styles.demoOutput}>
              <span className={styles.outputLabel}>{t("hero.demoResult")}</span>
              <p className={styles.typewriter}>
                {displayText}
                {isTyping && <span className={styles.cursor}>|</span>}
              </p>
            </div>

            <div className={styles.statsRow}>
              {[
                { value: "10s", label: t("hero.statTime") },
                { value: "50+", label: t("hero.statTypes") },
                { value: "12", label: t("hero.statLangs") },
              ].map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

