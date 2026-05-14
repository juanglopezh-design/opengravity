import styles from "./Features.module.css";

const features = [
  {
    icon: "⚡",
    title: "Generación instantánea",
    desc: "Contenido listo en menos de 10 segundos. Sin esperas, sin frustraciones. Solo resultados.",
  },
  {
    icon: "🎯",
    title: "50+ tipos de contenido",
    desc: "Posts de Instagram, threads de X, emails, blogs, captions de TikTok, anuncios y mucho más.",
  },
  {
    icon: "🌍",
    title: "12 idiomas",
    desc: "Genera en español, inglés, portugués, francés, alemán y más. Llega a audiencias globales.",
  },
  {
    icon: "🤖",
    title: "Gemini AI de Google",
    desc: "Powered by la IA más avanzada de Google. Resultados que suenan humanos, no robóticos.",
  },
  {
    icon: "📊",
    title: "Historial completo",
    desc: "Guarda todo el contenido generado. Búscalo, edítalo y reutilízalo cuando quieras.",
  },
  {
    icon: "🔒",
    title: "100% privado y seguro",
    desc: "Tu contenido es tuyo. Nunca lo usamos para entrenar modelos ni lo compartimos con terceros.",
  },
];

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">🛠️ Características</div>
          <h2 className={styles.title}>
            Todo lo que necesitas para{" "}
            <span className="gradient-text">dominar el contenido</span>
          </h2>
          <p className={styles.subtitle}>
            Una plataforma completa diseñada para creadores, marketers y negocios
            que quieren crecer sin perder horas creando contenido.
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
