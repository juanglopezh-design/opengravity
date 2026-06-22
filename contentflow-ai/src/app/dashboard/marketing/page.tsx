"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { 
  Megaphone, 
  Copy, 
  Check, 
  Send, 
  TrendingUp, 
  Share2, 
  Globe, 
  Users, 
  Sparkles
} from "lucide-react";

export default function MarketingPage() {
  const [activeSection, setActiveSection] = useState<"launch" | "outreach" | "strategies">("launch");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Launch templates copy
  const PH_TAGLINE = "Generate viral posts, emails & threads in 10 seconds | Powered by Gemini";
  const PH_DESCRIPTION = "ContentFlow AI is a high-performance content engine built for founders, marketers, and creators who need to scale their output without compromising on human-like copywriting quality. Powered by Google Gemini AI, it generates fully formatted LinkedIn posts, X threads, sales outreach, newsletters, and video outlines in seconds. Activated natively via Bitcoin Mainnet for full developer privacy and no credit card lock-ins.";
  const PH_COMMENT = `Hello Product Hunt community! 👋

I built ContentFlow AI because as a creator and developer, I was tired of spending hours crafting individual social threads and sales copy. Most tools in the market are either too complex, require expensive credit card plans, or generate robotic copy.

With ContentFlow AI, you get:
- High-conversion copy powered by Gemini AI
- 50+ content categories and multi-language support (English, Spanish, Portuguese, French)
- A native privacy-first checkout process validated directly on-chain via Bitcoin.
- A clean, lightning-fast dashboard that stores your complete history.

I would love to get your feedback and see what we can build next together. I'll be answering questions all day! 🚀`;

  const TWEET_THREAD = `1/ We just launched ContentFlow AI! ⚡ 

A premium SaaS built to crush writer's block and generate high-conversion viral posts, threads, and sales emails in under 10 seconds. 

Here is why we built it and how it works: 👇

2/ Social writing is broken. You either pay $100s/mo for bloated platforms or spend hours staring at a blank screen. 

ContentFlow AI is powered by Google Gemini to write copy that actually sounds human, engaging, and ready to post.

3/ What can you create?
✅ Hook-heavy LinkedIn posts
✅ High-engagement X/Twitter threads
✅ High-conversion cold sales emails
✅ Value-packed newsletters
✅ Short-form video ideas (TikTok/YouTube)

4/ Plus, we believe in privacy and digital freedom.
That's why all premium plans are activated natively with Bitcoin Mainnet. 
No credit card required. Pure on-chain verification. 

5/ Try the interactive live playground directly on our homepage! No registration needed.

👉 Test it here: https://contentflow-ai-juang26.web.app

We would love to know what you generate! 🚀`;

  const REDDIT_HN_COPY = `[Show HN] ContentFlow AI - Gemini-Powered Copywriting SaaS with Bitcoin Checkout

Hi everyone!

I wanted to share ContentFlow AI, a content generator SaaS built using Next.js 15, Google Gemini, and Firebase.

Link: https://contentflow-ai-juang26.web.app

Features:
- Instant generation of posts (LinkedIn, X threads, newsletters, emails) using gemini-2.5-flash.
- An interactive live sandbox demo on the landing page so users can test before creating an account.
- Privacy-focused: Accounts can be set up in seconds, and payments are validated on-chain directly via Bitcoin Mainnet (vía mempool.space API hooks). No credit card required.

Tech stack:
- Next.js (App Router)
- Firestore & Firebase Auth
- Google Generative AI SDK
- Resend for transaction and welcome emails

I'd love to hear your feedback on the landing page UX and the conversion flow!`;

  // Cold email outreach templates
  const EMAIL_CREATOR = `Subject: Quick question about your content flow, [Name]!

Hi [Name],

I've been following your posts on [Platform/LinkedIn/X] and love the insights you share about [Topic].

I noticed you publish consistently, which takes a lot of time. I recently built ContentFlow AI (https://contentflow-ai-juang26.web.app) to help creators generate viral-style posts, threads, and newsletters in seconds while maintaining a natural, human tone.

We just launched our Affiliate Program. I'd love to set you up with a free Pro Account to try it out, and offer you a 30% recurring commission on any subscriber you refer to us.

Would you be open to a quick look?

Best regards,

[Your Name]
Founder, ContentFlow AI`;

  const EMAIL_AGENCY = `Subject: Scaling content production at [Agency Name]

Hi [Name],

Managing content pipelines for multiple clients is always a bottleneck—either copywriters get backlogged or quality drops.

We built ContentFlow AI (https://contentflow-ai-juang26.web.app) specifically to solve this for digital agencies. It uses Gemini AI to generate custom LinkedIn posts, X threads, sales copy, and blog structures in 10 seconds.

Our platform has no subscription cards required—all client workspace upgrades are activated via secure Bitcoin transfers.

I would love to set you up with an agency demo account so your team can test it out. Do you have 2 minutes to check the interactive demo on our homepage?

Best,

[Your Name]
Founder, ContentFlow AI`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Megaphone className={styles.titleIcon} size={28} />
          <div>
            <h1>Growth & Marketing Center</h1>
            <p>Estrategias y recursos listos para promocionar ContentFlow AI a nivel global.</p>
          </div>
        </div>
        <div className={styles.badge}>
          <Sparkles size={14} />
          <span>Global Launch</span>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveSection("launch")}
          className={`${styles.tab} ${activeSection === "launch" ? styles.activeTab : ""}`}
        >
          <Share2 size={18} />
          <span>Kit de Lanzamiento</span>
        </button>
        <button
          onClick={() => setActiveSection("outreach")}
          className={`${styles.tab} ${activeSection === "outreach" ? styles.activeTab : ""}`}
        >
          <Send size={18} />
          <span>Emails en Frío</span>
        </button>
        <button
          onClick={() => setActiveSection("strategies")}
          className={`${styles.tab} ${activeSection === "strategies" ? styles.activeTab : ""}`}
        >
          <TrendingUp size={18} />
          <span>Estrategia de Crecimiento</span>
        </button>
      </div>

      {/* Content Panels */}
      <main className={styles.panel}>
        {activeSection === "launch" && (
          <div className={styles.grid}>
            {/* Product Hunt */}
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>😺 Product Hunt Launch Kit</h3>
                <span className={styles.platformTag}>Product Hunt</span>
              </div>
              <p className={styles.cardDesc}>Copys listos para listar tu app en Product Hunt y captar la atención de early adopters.</p>
              
              <div className={styles.field}>
                <label>Tagline (Línea descriptiva)</label>
                <div className={styles.copyArea}>
                  <code>{PH_TAGLINE}</code>
                  <button onClick={() => handleCopy("ph_tagline", PH_TAGLINE)} className={styles.copyBtn}>
                    {copiedId === "ph_tagline" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label>Descripción del Producto</label>
                <div className={styles.copyArea}>
                  <pre>{PH_DESCRIPTION}</pre>
                  <button onClick={() => handleCopy("ph_desc", PH_DESCRIPTION)} className={styles.copyBtn}>
                    {copiedId === "ph_desc" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label>Primer Comentario del Creador (Maker Comment)</label>
                <div className={styles.copyArea}>
                  <pre>{PH_COMMENT}</pre>
                  <button onClick={() => handleCopy("ph_comment", PH_COMMENT)} className={styles.copyBtn}>
                    {copiedId === "ph_comment" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Twitter/X Thread */}
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>🐦 Twitter/X Launch Thread</h3>
                <span className={styles.platformTag} style={{ background: "#000" }}>Twitter/X</span>
              </div>
              <p className={styles.cardDesc}>Secuencia de tweets altamente persuasiva para anunciar el lanzamiento y llevar tráfico al sandbox interactivo.</p>
              
              <div className={styles.field}>
                <label>Tweet Thread (Listo para publicar)</label>
                <div className={styles.copyArea}>
                  <pre>{TWEET_THREAD}</pre>
                  <button onClick={() => handleCopy("tweet_thread", TWEET_THREAD)} className={styles.copyBtn}>
                    {copiedId === "tweet_thread" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Hacker News / Reddit */}
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>🔥 Hacker News & Reddit (Show HN)</h3>
                <span className={styles.platformTag} style={{ background: "#ff4500" }}>Reddit/HN</span>
              </div>
              <p className={styles.cardDesc}>Posteado técnico para comunidades de programadores y creadores independientes (indie hackers).</p>
              
              <div className={styles.field}>
                <label>HN / Reddit Text (Formato Markdown)</label>
                <div className={styles.copyArea}>
                  <pre>{REDDIT_HN_COPY}</pre>
                  <button onClick={() => handleCopy("reddit_hn", REDDIT_HN_COPY)} className={styles.copyBtn}>
                    {copiedId === "reddit_hn" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "outreach" && (
          <div className={styles.grid}>
            {/* Cold Email: Influencer / Creator */}
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>📧 Creator Partnerships / Affiliation</h3>
                <span className={styles.platformTag}>Creators</span>
              </div>
              <p className={styles.cardDesc}>Escríbele a creadores medianos de LinkedIn o X. Ofréceles afiliación recurrente y cuenta Pro gratis a cambio de feedback o reviews.</p>
              
              <div className={styles.field}>
                <label>Email Template</label>
                <div className={styles.copyArea}>
                  <pre>{EMAIL_CREATOR}</pre>
                  <button onClick={() => handleCopy("email_creator", EMAIL_CREATOR)} className={styles.copyBtn}>
                    {copiedId === "email_creator" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Cold Email: Agency Pitch */}
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3>🏢 Agency Lead Generation</h3>
                <span className={styles.platformTag}>Agencies</span>
              </div>
              <p className={styles.cardDesc}>Dirígete a agencias boutique de marketing digital o social media. Ofréceles eficiencia y cuentas corporativas.</p>
              
              <div className={styles.field}>
                <label>Email Template</label>
                <div className={styles.copyArea}>
                  <pre>{EMAIL_AGENCY}</pre>
                  <button onClick={() => handleCopy("email_agency", EMAIL_AGENCY)} className={styles.copyBtn}>
                    {copiedId === "email_agency" ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "strategies" && (
          <div className={styles.strategiesContainer}>
            <div className={`glass-card ${styles.strategyCard}`}>
              <div className={styles.strategyTitle}>
                <Globe className={styles.strategyIcon} size={22} />
                <h3>1. Marketing de Contenidos & Programmatic SEO</h3>
              </div>
              <p>Crea páginas de aterrizaje específicas para keywords de cola larga (long-tail) de alta conversión.</p>
              <ul>
                <li>Ejemplos de páginas: <em>&quot;Generador de posts para LinkedIn con IA&quot;</em>, <em>&quot;Cómo escribir hilos de Twitter de tecnología&quot;</em>, <em>&quot;Plantillas de email de ventas con IA&quot;</em>.</li>
                <li>Habilita el Sandbox interactivo en cada una de estas landing pages con parámetros pre-cargados específicos para ese nicho.</li>
              </ul>
            </div>

            <div className={`glass-card ${styles.strategyCard}`}>
              <div className={styles.strategyTitle}>
                <Users className={styles.strategyIcon} size={22} />
                <h3>2. Bucles Virales de Referidos (Referral Loops)</h3>
              </div>
              <p>Convierte a tus usuarios en tu equipo de marketing premiando el compartir orgánico.</p>
              <ul>
                <li><strong>Compartir en Twitter para desbloquear:</strong> Ofrece 5 generaciones gratuitas adicionales si el usuario comparte un tweet pre-redactado sobre la aplicación.</li>
                <li><strong>Plan de Afiliados Bitcoin:</strong> Permite que los usuarios generen un enlace de referidos. Cuando alguien pague con BTC, el referente recibe el 30% del pago transferido directamente a su wallet BTC en lightning.</li>
              </ul>
            </div>

            <div className={`glass-card ${styles.strategyCard}`}>
              <div className={styles.strategyTitle}>
                <TrendingUp className={styles.strategyIcon} size={22} />
                <h3>3. Distribución en Comunidades y Build in Public</h3>
              </div>
              <p>La historia de cómo desarrollaste el SaaS y el por qué del checkout en Bitcoin tiene un alto valor orgánico.</p>
              <ul>
                <li>Publica en comunidades de desarrollo e inversión como <strong>Indie Hackers, Twitter Tech, Dev.to, y Subreddits de SaaS</strong>.</li>
                <li>Comparte estadísticas transparentes: <em>&quot;Cómo conseguimos 100 usuarios en 48h con un sandbox y pagos BTC&quot;</em>. El morbo técnico atrae a fundadores e inversores.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
