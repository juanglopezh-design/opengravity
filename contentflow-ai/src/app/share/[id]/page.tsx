import { Metadata } from "next";
import Link from "next/link";
import SocialPostPreview from "@/components/SocialPostPreview";
import { siteUrl } from "@/lib/config";

interface SharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ c?: string; t?: string; a?: string }>;
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const sParams = await searchParams;
  const rawContent = sParams.c ? decodeURIComponent(atob(sParams.c)) : "Contenido generado con Inteligencia Artificial.";
  const type = sParams.t || "LinkedIn";
  const author = sParams.a || "Creador VIP";

  const title = `${type} por ${author} | ContentFlow AI`;
  const description = rawContent.slice(0, 160) + "...";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/share`,
      siteName: "ContentFlow AI",
      images: [
        {
          url: `${siteUrl}/api/og?title=${encodeURIComponent(title)}`,
          width: 1200,
          height: 630,
          alt: "ContentFlow AI Post Preview",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@ContentFlowAI",
    },
  };
}

export default async function PublicSharePage({ searchParams }: SharePageProps) {
  const sParams = await searchParams;
  let content = "Contenido no disponible o enlace expirado.";
  if (sParams.c) {
    try {
      content = decodeURIComponent(atob(sParams.c));
    } catch {
      content = "Contenido compartido con ContentFlow AI.";
    }
  }

  const type = sParams.t || "linkedin";
  const author = sParams.a || "Creador Destacado";

  return (
    <div className="min-h-screen bg-[#080B14] text-gray-100 flex flex-col justify-between">
      {/* Sticky Banner Viral Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b border-purple-500/30 px-4 py-3 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <p className="text-xs font-bold text-white">
                Este contenido fue creado en 10 segundos con <span className="text-purple-300">ContentFlow AI</span>
              </p>
              <p className="text-[11px] text-gray-300 hidden sm:block">
                Genera publicaciones virales para LinkedIn, X, TikTok y Email sin esfuerzo.
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF9D] text-black hover:bg-[#00CC7D] transition-all shadow-lg shadow-green-500/20 whitespace-nowrap"
          >
            Pruébalo Gratis Ahora &rarr;
          </Link>
        </div>
      </div>

      {/* Main Content Render */}
      <main className="max-w-3xl mx-auto w-full px-4 py-12 space-y-8 flex-1">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            Publicación Compartida • {type.toUpperCase()}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Contenido Creado por {author}
          </h1>
        </div>

        {/* Live Social Post Preview */}
        <SocialPostPreview
          content={content}
          authorName={author}
          defaultPlatform={type.toLowerCase() === "twitter" ? "twitter" : type.toLowerCase() === "email" ? "email" : "linkedin"}
        />

        {/* Conversion Card */}
        <div className="bg-gradient-to-br from-[#0D1224] to-[#121829] border border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-2xl mb-1">
            🚀
          </div>
          <h2 className="text-xl font-bold text-white">
            ¿Quieres crear publicaciones virales como esta para tu marca?
          </h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            ContentFlow AI utiliza Gemini 2.0 para transformar tus ideas en publicaciones de alto impacto en segundos. Sin tarjetas de crédito requeridas.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all shadow-xl shadow-purple-500/25"
            >
              <span>✨</span> Crear Mi Primer Contenido Gratis
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ContentFlow AI • Potenciado con Inteligencia Artificial
      </footer>
    </div>
  );
}
