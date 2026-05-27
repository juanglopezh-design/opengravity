"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Hero.module.css";

const demoOutputs = [
  "🚀 5 razones por las que tu negocio NECESITA IA ahora mismo...",
  "📧 Asunto: La estrategia que duplicó nuestras ventas en 30 días",
  "💡 Thread: Cómo pasé de $0 a $10k/mes con contenido automatizado",
  "🎯 Instagram caption: El secreto que nadie te cuenta sobre crecer online...",
];

export default function Hero() {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const text = demoOutputs[currentDemo];
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
          setCurrentDemo((prev) => (prev + 1) % demoOutputs.length);
        }, 2500);
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [currentDemo]);

  return (
    <section className={styles.hero}>
      <div className={`orb orb-purple ${styles.orb1}`} />
      <div className={`orb orb-blue ${styles.orb2}`} />

      <div className="container">
        <div className={styles.content}>
          <div className={`badge fade-in-up ${styles.badge}`} style={{ animationDelay: "0.1s" }}>
            <span>✨</span>
            Potenciado por Gemini AI
          </div>

          <h1 className={`${styles.headline} fade-in-up`} style={{ animationDelay: "0.2s" }}>
            Genera contenido{" "}
            <span className="gradient-text">viral</span>
            {" "}en{" "}
            <br />
            <span className="gradient-text">10 segundos</span>
          </h1>

          <p className={`${styles.subtitle} fade-in-up`} style={{ animationDelay: "0.3s" }}>
            La IA más avanzada para crear posts, emails y blogs que enganchan.
            Sin bloqueo creativo. Sin horas de trabajo. Sin límites.
          </p>

          <div className={`${styles.ctas} fade-in-up`} style={{ animationDelay: "0.4s" }}>
            <Link href="/signup" className="btn-primary" id="hero-cta-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              Empezar ahora
              <span>→</span>
            </Link>
            <Link href="#features" className="btn-secondary" id="hero-cta-secondary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              Ver cómo funciona
            </Link>
          </div>

          <p className={styles.note}>✓ Desde $1.99/mes &nbsp;✓ Pago con Bitcoin &nbsp;✓ Sin tarjeta de crédito</p>

          <div className={`glass-card ${styles.demoCard} fade-in-up float-anim`} style={{ animationDelay: "0.5s" }}>
            <div className={styles.demoHeader}>
              <div className={styles.dots}>
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </div>
              <span className={styles.demoLabel}>ContentFlow AI • Generando...</span>
            </div>
            <div className={styles.demoPrompt}>
              <span className={styles.promptLabel}>Prompt:</span>
              <span className={styles.promptText}>Post viral sobre productividad con IA</span>
            </div>
            <div className={styles.demoOutput}>
              <span className={styles.outputLabel}>✨ Resultado:</span>
              <p className={styles.typewriter}>
                {displayText}
                {isTyping && <span className={styles.cursor}>|</span>}
              </p>
            </div>

            <div className={styles.statsRow}>
              {[
                { value: "10s", label: "Tiempo generación" },
                { value: "50+", label: "Tipos de contenido" },
                { value: "12", label: "Idiomas" },
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
