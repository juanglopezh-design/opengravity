import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { adminDb } from "@/lib/firebase-admin";
import MarkdownIt from "markdown-it";
import styles from "../blog.module.css";
import { Metadata } from "next";

interface BlogPost {
  title: string;
  slug: string;
  description: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  published: boolean;
}

export const dynamic = "force-dynamic";


// Mock articles data as fallback for local dev or missing Firestore data
const mockArticles: Record<string, BlogPost> = {
  "inteligencia-artificial-redefiniendo-copywriting": {
    title: "Cómo la Inteligencia Artificial está Redefiniendo el Copywriting en 2026",
    slug: "inteligencia-artificial-redefiniendo-copywriting",
    description: "Descubre cómo las herramientas de IA generativa como Gemini están ayudando a creadores y copywriters a multiplicar su productividad por 10 sin perder autenticidad.",
    tags: ["Inteligencia Artificial", "Copywriting", "Productividad"],
    createdAt: new Date(),
    published: true,
    content: `
# Cómo la Inteligencia Artificial está Redefiniendo el Copywriting en 2026

La creación de contenido y la redacción publicitaria han experimentado la mayor revolución en una década. En 2026, la inteligencia artificial ya no es solo una herramienta de borrador; se ha convertido en un co-creador cognitivo esencial para cualquier copywriter o comercializador.

## 1. El mito del fin del copywriter humano
Muchos temían que la IA erradicaría la necesidad de escritores. Sin embargo, lo que ha ocurrido es una **simbiosis evolutiva**. La IA hace el trabajo pesado: estructuración de datos, lluvias de ideas, redacción de borradores y adaptación de formatos.

El humano se enfoca en lo que la máquina aún no domina:
* **Empatía emocional profunda**: Comprender el dolor humano real en contextos únicos.
* **Curación y tono**: Ajustar los pequeños detalles que diferencian una marca mediocre de una marca premium.
* **Estrategia y orquestación**: Saber qué contenido publicar, a quién y en qué momento exacto.

> "La IA no te reemplazará. El copywriter que usa IA reemplazará al que no la usa." — Filosofía ContentFlow AI.

## 2. Multiplica tu productividad por 10
Imagina este flujo tradicional:
1. Buscar ideas en Google (2 horas).
2. Estructurar el artículo (1 hora).
3. Redactar el contenido de 1500 palabras (4 horas).
4. Adaptar el post para LinkedIn, Twitter e Instagram (2 horas).
5. Revisión ortográfica y SEO (1 hora).

**Total: 10 horas.**

Con una plataforma integrada de IA y base de datos como [ContentFlow AI](https://contentflow-ai-juang26.web.app):
1. Pides una idea de tendencia en segundos.
2. Generas el artículo completo optimizado para SEO con un prompt guiado.
3. Generas automáticamente los hilos de Twitter y los posts de LinkedIn correspondientes.

**Total: 10 minutos.**

## 3. Las mejores prácticas para redactar con Gemini en 2026
Cuando uses motores avanzados de IA (como Gemini 2.5 Flash), aplica estas reglas:
* **Especifica el rol**: Comienza diciéndole "Actúa como un experto en copywriting con especialidad en embudos de conversión...".
* **Añade ejemplos (Few-shot prompting)**: Si quieres un estilo específico, dale 2 o 3 ejemplos reales de tus mejores textos.
* **Instrucciones de formato claras**: Pídele que use viñetas, bloques de código, negritas y citas para que la lectura sea ligera y visualmente atractiva.

El futuro del contenido ya está aquí, y es completamente fluido. ¿Estás listo para dar el salto?
`
  },
  "5-estrategias-virales-crecer-linkedin-automatizado": {
    title: "5 Estrategias Virales para Crecer en LinkedIn Usando Contenido Automatizado",
    slug: "5-estrategias-virales-crecer-linkedin-automatizado",
    description: "Aprende a estructurar tus publicaciones profesionales para activar el algoritmo de LinkedIn de manera orgánica y autónoma.",
    tags: ["LinkedIn", "Marketing", "Estrategia"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2),
    published: true,
    content: `
# 5 Estrategias Virales para Crecer en LinkedIn Usando Contenido Automatizado

LinkedIn es la red social B2B más potente para captar leads, conseguir clientes y posicionarse profesionalmente. No obstante, publicar a diario requiere un tiempo que la mayoría de fundadores o desarrolladores no tienen.

Aquí te mostramos cómo optimizar tu estrategia usando automatización inteligente.

## 1. El gancho inicial es el 90% del éxito
En LinkedIn, los usuarios escanean rápidamente el feed. Tu publicación se truncará tras las primeras 3 líneas. Tu "Gancho" debe obligar al usuario a hacer clic en "ver más".

* **Mal gancho**: "Hoy quiero hablarles de las APIs..."
* **Buen gancho**: "Construí un robot de IA que genera $50/día mientras duermo. Aquí está el código exacto y mi peor error en el proceso 👇"

## 2. La estructura del "Acordeón"
El algoritmo de LinkedIn premia el **Dwell Time** (el tiempo de permanencia de lectura en el post). 

Escribe párrafos cortos de 1 a 2 líneas separados por espacios en blanco. Esto crea un efecto visual ligero que fomenta que el lector se desplace hacia abajo.

## 3. Carruseles y documentos interactivos
Los PDFs subidos como diapositivas o carruseles tienen hasta 4 veces más tracción orgánica que los textos planos. Puedes usar IAs de generación de imágenes para crear diagramas de flujo y empaquetarlos en un PDF que aporte valor inmediato.

## 4. No coloques links en el post principal
Colocar un enlace externo en tu publicación principal reduce el alcance de forma drástica, ya que LinkedIn no quiere que los usuarios abandonen su plataforma.
* **Estrategia**: Escribe el post y añade: *"Te dejo el enlace directo en el primer comentario"* o automatiza el envío del link por mensaje privado a quienes comenten el post.

## 5. Orquesta tu publicación de forma autónoma
Usa un motor de publicación que diseñe el contenido y te lo envíe directo a tu canal de comunicación de preferencia. De esta forma, solo tienes que aprobar y programar.
`
  },
  "por-que-monetizar-saas-bitcoin-futuro": {
    title: "Por Qué Monetizar tu SaaS con Bitcoin es el Futuro de la Economía Digital",
    slug: "por-que-monetizar-saas-bitcoin-futuro",
    description: "Analizamos las ventajas de integrar micropagos de Bitcoin y validación on-chain en tu SaaS: menos comisiones, alcance global instantáneo y soberanía financiera.",
    tags: ["Bitcoin", "SaaS", "Monetización"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5),
    published: true,
    content: `
# Por Qué Monetizar tu SaaS con Bitcoin es el Futuro de la Economía Digital

Tradicionalmente, lanzar un SaaS significaba configurar cuentas en procesadores de pagos centralizados, lidiar con restricciones de países, tarifas de cambio elevadas y devoluciones fraudulentas (chargebacks). 

Integrar pagos en Bitcoin soluciona estos dolores de cabeza de raíz.

## 1. Alcance verdaderamente mundial y sin fricciones
Si tu SaaS ofrece servicios de IA o creación de contenido a nivel global, restringirte a tarjetas de crédito tradicionales deja fuera a millones de usuarios en economías emergentes. Con Bitcoin, cualquiera en cualquier rincón del mundo con conexión a internet puede comprar tu suscripción al instante.

## 2. Sin devoluciones ni disputas (Chargebacks)
En el negocio de SaaS, los chargebacks fraudulentos pueden costar miles de dólares al año en multas y tarifas. Las transacciones de Bitcoin son irreversibles y finales. Una vez confirmadas en la blockchain, los fondos te pertenecen con total seguridad.

## 3. Validación de pagos autónoma (On-Chain)
Integrar pagos de Bitcoin no requiere un intermediario caro. Puedes usar APIs abiertas de exploradores de bloques como mempool.space para verificar de forma autónoma si una dirección temporal ha recibido los fondos solicitados y activar la suscripción del usuario de manera programática en tu base de datos.

Es la estrategia exacta que implementamos en **ContentFlow AI**, combinando tecnología de vanguardia y soberanía económica.
`
  }
};

async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const snapshot = await adminDb
      .collection("blog_posts")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Look in mock data as fallback
      return mockArticles[slug] || null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    let createdAtDate = new Date();
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === "function") {
        createdAtDate = data.createdAt.toDate();
      } else if (data.createdAt._seconds !== undefined) {
        createdAtDate = new Date(data.createdAt._seconds * 1000);
      } else {
        createdAtDate = new Date(data.createdAt);
      }
    }

    return {
      title: data.title || "Artículo sin título",
      slug: data.slug || doc.id,
      description: data.description || "Sin descripción disponible.",
      content: data.content || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: createdAtDate,
      published: !!data.published,
    };
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    // Fallback to mock data
    return mockArticles[slug] || null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Artículo no encontrado | ContentFlow AI",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Parse markdown content to HTML safely
  const md = new MarkdownIt({
    html: false, // Disallow raw HTML in AI content to avoid XSS injections
    linkify: true,
    typographer: true,
  });
  
  const parsedContentHtml = md.render(post.content);

  return (
    <>
      <Navbar />
      <main className={styles.articleContainer}>
        {/* Background Decorative Orbs */}
        <div className="orb orb-purple" style={{ top: "15%", left: "-10%" }}></div>
        <div className="orb orb-blue" style={{ top: "50%", right: "-10%" }}></div>

        <Link href="/blog" className={styles.backBtn}>
          &larr; Volver al Blog
        </Link>

        <article>
          <header className={styles.articleHeader}>
            <div className={styles.articleMeta}>
              <time>
                {post.createdAt.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>
            
            <h1 className={styles.articleTitle}>{post.title}</h1>
            
            <div className={styles.tags}>
              {post.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className={idx % 2 === 0 ? styles.tagPill : styles.tagPillBlue}
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: parsedContentHtml }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
