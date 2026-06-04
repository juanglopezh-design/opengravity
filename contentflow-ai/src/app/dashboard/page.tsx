"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import styles from "./page.module.css";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { getApiUrl } from "@/lib/api-helper";
import { useUserData } from "./UserDataContext";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const { applyUsageFromServer, refreshUserData, userData } = useUserData();
  const { t, locale } = useLanguage();

  const contentTypesMap = [
    { value: "Post de LinkedIn (Profesional)", label: t("type.linkedin") },
    { value: "Hilo de Twitter/X (Enganchador)", label: t("type.twitter") },
    { value: "Caption de Instagram (Lifestyle)", label: t("type.instagram") },
    { value: "Email de Ventas (Conversión)", label: t("type.email") },
    { value: "Newsletter (Informativo)", label: t("type.newsletter") },
    { value: "Idea para Video de YouTube/TikTok", label: t("type.youtube") },
  ];

  const tonesMap = [
    { value: "Profesional", label: t("tone.professional") },
    { value: "Inspirador", label: t("tone.inspiring") },
    { value: "Humorístico", label: t("tone.humorous") },
    { value: "Directo", label: t("tone.direct") },
    { value: "Conversacional", label: t("tone.conversational") },
  ];

  const languagesMap = [
    { value: "Español", label: locale === "es" ? "Español" : "Spanish" },
    { value: "Inglés", label: locale === "es" ? "Inglés" : "English" },
    { value: "Portugués", label: locale === "es" ? "Portugués" : "Portuguese" },
    { value: "Francés", label: locale === "es" ? "Francés" : "French" },
  ];

  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("Post de LinkedIn (Profesional)");
  const [tone, setTone] = useState("Profesional");
  const [language, setLanguage] = useState("Español");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError("");
    setLoading(true);
    setResult("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No has iniciado sesión");

      const token = await user.getIdToken();

      const response = await fetch(getApiUrl("/api/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, type, tone, language }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setResult(data.content);

      if (typeof data.generationsUsed === "number") {
        applyUsageFromServer({
          generationsUsed: data.generationsUsed,
          generationsLimit: data.generationsLimit,
          plan: data.plan,
        });
      } else {
        await refreshUserData();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("dash.error");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Block access if no active plan
  if (userData !== null && (!userData?.plan || userData?.plan === "pending")) {
    return (
      <div className={styles.page}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: "20px"
        }}>
          <Sparkles size={56} style={{ color: "var(--accent-purple)", opacity: 0.8 }} />
          <h2 style={{ fontSize: "24px", fontWeight: 700 }}>{t("dash.needPlan")}</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
            {t("dash.needPlanDesc")}
          </p>
          <Link href="/dashboard/settings" className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>
            <Sparkles size={18} />
            {t("dash.needPlanCta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("dash.title")}</h1>
        <p className={styles.subtitle}>{t("dash.subtitle")}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.formCol}>
          <form onSubmit={handleGenerate} className={`glass-card ${styles.card}`}>
            <div className={styles.field}>
              <label>{t("dash.promptLabel")}</label>
              <textarea
                className="input-field"
                placeholder={t("dash.promptPlaceholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={5}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>{t("dash.contentType")}</label>
                <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                  {contentTypesMap.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>{t("dash.tone")}</label>
                <select className="input-field" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {tonesMap.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>{t("dash.language")}</label>
              <select
                className="input-field"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languagesMap.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !prompt.trim()}
              style={{ width: "100%", justifyContent: "center", marginTop: "10px", padding: "16px" }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className={styles.spin} /> {t("dash.generating")}
                </>
              ) : (
                <>
                  <Sparkles size={18} /> {t("dash.generateCta")}
                </>
              )}
            </button>
          </form>
        </div>

        <div className={styles.resultCol}>
          <div className={`glass-card ${styles.resultCard} ${result ? styles.hasResult : ""}`}>
            {result ? (
              <>
                <div className={styles.resultHeader}>
                  <span className="badge">{t("dash.resultHeader")}</span>
                  <button onClick={copyToClipboard} className={styles.copyBtn} title={t("dash.copy")}>
                    {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                    {copied ? t("dash.copied") : t("dash.copy")}
                  </button>
                </div>
                <div className={styles.resultContent}>
                  {result.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <Sparkles size={48} className={styles.emptyIcon} />
                <h3>{t("dash.emptyTitle")}</h3>
                <p>{t("dash.emptyDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

