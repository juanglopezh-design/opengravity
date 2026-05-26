"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import styles from "./page.module.css";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { getApiUrl } from "@/lib/api-helper";

const contentTypes = [
  "Post de LinkedIn (Profesional)",
  "Hilo de Twitter/X (Enganchador)",
  "Caption de Instagram (Lifestyle)",
  "Email de Ventas (Conversión)",
  "Newsletter (Informativo)",
  "Idea para Video de YouTube/TikTok",
];

const tones = ["Profesional", "Inspirador", "Humorístico", "Directo", "Conversacional"];
const languages = ["Español", "Inglés", "Portugués", "Francés"];

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState(contentTypes[0]);
  const [tone, setTone] = useState(tones[0]);
  const [language, setLanguage] = useState(languages[0]);
  
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

      // Call API
      const response = await fetch(getApiUrl("/api/generate"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, type, tone, language }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setResult(data.content);

    } catch (err: any) {
      setError(err.message || "Error al generar el contenido");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Generador de Contenido</h1>
        <p className={styles.subtitle}>Describe lo que necesitas y la IA hará el resto.</p>
      </header>

      <div className={styles.grid}>
        {/* Form Column */}
        <div className={styles.formCol}>
          <form onSubmit={handleGenerate} className={`glass-card ${styles.card}`}>
            <div className={styles.field}>
              <label>¿De qué quieres hablar? *</label>
              <textarea
                className="input-field"
                placeholder="Ej: Tres consejos sobre cómo usar la Inteligencia Artificial para ahorrar tiempo en tareas diarias..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={5}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Tipo de contenido</label>
                <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                  {contentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Tono</label>
                <select className="input-field" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {tones.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>Idioma</label>
              <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
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
                <><RefreshCw size={18} className={styles.spin} /> Generando magia...</>
              ) : (
                <><Sparkles size={18} /> Generar contenido</>
              )}
            </button>
          </form>
        </div>

        {/* Result Column */}
        <div className={styles.resultCol}>
          <div className={`glass-card ${styles.resultCard} ${result ? styles.hasResult : ""}`}>
            {result ? (
              <>
                <div className={styles.resultHeader}>
                  <span className="badge">✨ Resultado Final</span>
                  <button onClick={copyToClipboard} className={styles.copyBtn} title="Copiar">
                    {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <div className={styles.resultContent}>
                  {result.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <Sparkles size={48} className={styles.emptyIcon} />
                <h3>Tu contenido aparecerá aquí</h3>
                <p>Llena el formulario a la izquierda y presiona generar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
