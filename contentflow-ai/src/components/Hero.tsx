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

  // Custom Interactive Sandbox States
  const [mode, setMode] = useState<"custom" | "auto">("custom");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedType, setSelectedType] = useState("linkedin");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [demoResult, setDemoResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [remainingDemos, setRemainingDemos] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Typewriter Auto loop
  useEffect(() => {
    if (mode !== "auto") return;
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
  }, [currentDemo, locale, t, mode]);

  // Load remaining generations counter from client storage
  useEffect(() => {
    const saved = localStorage.getItem("cf_remaining_demos");
    if (saved !== null) {
      setRemainingDemos(Number(saved));
    }
  }, []);

  const handleGenerateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    if (remainingDemos <= 0) {
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setDemoResult("");

    try {
      const res = await fetch("/api/generate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customPrompt,
          type: selectedType,
          tone: selectedTone,
          language: locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "demo_limit_reached") {
          setShowLimitModal(true);
          setRemainingDemos(0);
          localStorage.setItem("cf_remaining_demos", "0");
        } else {
          setErrorMsg(data.error || "Error");
        }
        setIsGenerating(false);
        return;
      }

      setDemoResult(data.content);
      if (typeof data.remaining === "number") {
        setRemainingDemos(data.remaining);
        localStorage.setItem("cf_remaining_demos", String(data.remaining));
      }
      setShowModal(true);
    } catch {
      setErrorMsg(t("dash.error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(demoResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <button 
              onClick={() => {
                setMode("custom");
                const el = document.getElementById("sandbox-anchor");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} 
              className="btn-secondary" 
              id="hero-cta-secondary" 
              style={{ fontSize: "16px", padding: "14px 32px" }}
            >
              {t("hero.ctaSecondary")}
            </button>
          </div>

          <p className={styles.note}>{t("hero.note")}</p>

          {/* Tab Header to switch demo modes */}
          <div id="sandbox-anchor" className={styles.tabHeader}>
            <button
              onClick={() => setMode("custom")}
              className={`${styles.tabBtn} ${mode === "custom" ? styles.activeTab : ""}`}
              type="button"
            >
              ⚡ {t("hero.sandboxTitle")}
            </button>
            <button
              onClick={() => setMode("auto")}
              className={`${styles.tabBtn} ${mode === "auto" ? styles.activeTab : ""}`}
              type="button"
            >
              📺 Auto Play
            </button>
          </div>

          <div className={`glass-card ${styles.demoCard} fade-in-up float-anim`} style={{ animationDelay: "0.5s" }}>
            <div className={styles.demoHeader}>
              <div className={styles.dots}>
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </div>
              <span className={styles.demoLabel}>
                {mode === "custom" ? "ContentFlow AI • Live Playground" : t("hero.demoLabel")}
              </span>
            </div>

            {mode === "auto" ? (
              // Original typewriter mockup
              <>
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
              </>
            ) : (
              // New Interactive Sandbox Form
              <div className={styles.sandboxContainer}>
                <form onSubmit={handleGenerateDemo} className={styles.sandboxForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="sandbox-type">{t("hero.sandboxType")}</label>
                      <select
                        id="sandbox-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className={styles.select}
                      >
                        <option value="linkedin">LinkedIn Post</option>
                        <option value="twitter">X/Twitter Thread</option>
                        <option value="email">Sales Email</option>
                        <option value="instagram">Instagram Caption</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="sandbox-tone">{t("hero.sandboxTone")}</label>
                      <select
                        id="sandbox-tone"
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className={styles.select}
                      >
                        <option value="professional">{t("tone.professional")}</option>
                        <option value="inspiring">{t("tone.inspiring")}</option>
                        <option value="humorous">{t("tone.humorous")}</option>
                        <option value="direct">{t("tone.direct")}</option>
                        <option value="conversational">{t("tone.conversational")}</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="sandbox-prompt">Prompt (Max 150 chars)</label>
                    <textarea
                      id="sandbox-prompt"
                      rows={2}
                      maxLength={150}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={t("hero.sandboxPlaceholder")}
                      className={styles.textarea}
                      required
                    />
                  </div>

                  <div className={styles.formActions}>
                    <span className={styles.remainingCounter}>
                      {t("hero.sandboxRemaining")} <strong>{remainingDemos}</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={isGenerating || !customPrompt.trim()}
                      className="btn-primary"
                      style={{ padding: "10px 20px", fontSize: "14px" }}
                    >
                      {isGenerating ? t("hero.sandboxGenerating") : t("hero.sandboxGenerate")}
                    </button>
                  </div>
                </form>

                {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

                {demoResult && (
                  <div className={styles.resultContainer}>
                    <span className={styles.outputLabel}>{t("hero.demoResult")}</span>
                    <div className={styles.resultContent}>
                      <pre className={styles.resultPre}>{demoResult}</pre>
                      <button onClick={handleCopy} className={styles.copyBtn} type="button">
                        {copied ? t("dash.copied") : t("hero.sandboxCopyCta")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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

      {/* Conversion Success Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass-card ${styles.modalCard}`}>
            <h3 className={styles.modalTitle}>{t("hero.sandboxModalTitle")}</h3>
            <p className={styles.modalDesc}>{t("hero.sandboxModalDesc")}</p>

            <div className={styles.modalActions}>
              <Link href="/signup?plan=basic" className="btn-primary" style={{ padding: "12px 24px" }}>
                {t("hero.sandboxModalSignup")}
              </Link>
              <Link href="/login" className="btn-secondary" style={{ padding: "12px 24px" }}>
                {t("hero.sandboxModalLogin")}
              </Link>
            </div>

            <div className={styles.modalShareSection}>
              <div className={styles.shareHeader}>🐦 ¿Quieres otra prueba gratis?</div>
              <p className={styles.shareText}>
                {t("hero.sandboxShareText").substring(0, 100)}...
              </p>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t("hero.sandboxShareText"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
                onClick={() => {
                  const newLimit = Math.min(3, remainingDemos + 1);
                  setRemainingDemos(newLimit);
                  localStorage.setItem("cf_remaining_demos", String(newLimit));
                  setShowModal(false);
                }}
              >
                {t("hero.sandboxShareCta")}
              </a>
            </div>

            <button className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label="Close">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Demo limit reached Modal */}
      {showLimitModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass-card ${styles.modalCard}`}>
            <h3 className={styles.modalTitle}>{t("hero.sandboxLimitTitle")}</h3>
            <p className={styles.modalDesc}>{t("hero.sandboxLimitDesc")}</p>

            <div className={styles.modalActions} style={{ justifyContent: "center" }}>
              <Link href="/signup?plan=basic" className="btn-primary" style={{ padding: "12px 24px" }}>
                {t("hero.sandboxModalSignup")}
              </Link>
              <button 
                onClick={() => setShowLimitModal(false)} 
                className="btn-secondary"
                style={{ padding: "12px 24px" }}
              >
                Cerrar
              </button>
            </div>

            <div className={styles.modalShareSection}>
              <div className={styles.shareHeader}>🚀 Desbloquea compartiendo en X/Twitter</div>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t("hero.sandboxShareText"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
                onClick={() => {
                  setRemainingDemos(1);
                  localStorage.setItem("cf_remaining_demos", "1");
                  setShowLimitModal(false);
                }}
              >
                {t("hero.sandboxShareCta")}
              </a>
            </div>

            <button className={styles.closeBtn} onClick={() => setShowLimitModal(false)} aria-label="Close">
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
