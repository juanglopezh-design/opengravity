import styles from "./Testimonials.module.css";

const testimonials = [
  {
    name: "María González",
    role: "Content Creator • 250K seguidores",
    avatar: "MG",
    color: "#8b5cf6",
    text: "ContentFlow AI cambió completamente mi flujo de trabajo. Antes pasaba 3 horas al día creando contenido. Ahora lo hago en 20 minutos. ¡Increíble!",
    stars: 5,
  },
  {
    name: "Carlos Rodríguez",
    role: "CEO • Agencia de Marketing Digital",
    avatar: "CR",
    color: "#3b82f6",
    text: "Manejo contenido para 15 clientes y esta herramienta es la razón por la que sigo siendo rentable. El ROI es brutal. La recomiendo 100%.",
    stars: 5,
  },
  {
    name: "Ana Martínez",
    role: "Emprendedora • E-commerce",
    avatar: "AM",
    color: "#06b6d4",
    text: "Mis ventas aumentaron 40% en el primer mes. El contenido que genera es tan bueno que mis clientes me preguntan quién es mi copywriter.",
    stars: 5,
  },
  {
    name: "David Pérez",
    role: "Coach de Negocios",
    avatar: "DP",
    color: "#f59e0b",
    text: "La calidad del contenido es impresionante. Genera exactamente lo que necesito para cada plataforma. La función de 12 idiomas es un plus enorme.",
    stars: 5,
  },
  {
    name: "Laura Sánchez",
    role: "Influencer de Lifestyle",
    avatar: "LS",
    color: "#ec4899",
    text: "Probé mil herramientas de IA y ninguna llegaba a este nivel. ContentFlow AI entiende el tono y la voz que busco. ¡Es como tener un asistente personal!",
    stars: 5,
  },
  {
    name: "Roberto Lima",
    role: "Fundador • SaaS B2B",
    avatar: "RL",
    color: "#10b981",
    text: "Usamos ContentFlow para todo: emails de ventas, posts de LinkedIn, blog posts. Ha reducido nuestros costos de marketing en un 60%.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section} id="testimonials">
      <div className="container">
        <div className={styles.header}>
          <div className="badge">❤️ Testimonios</div>
          <h2 className={styles.title}>
            Miles de creadores ya{" "}
            <span className="gradient-text">confían en nosotros</span>
          </h2>
          <p className={styles.subtitle}>
            No lo decimos nosotros, lo dicen los resultados reales de nuestra comunidad.
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
