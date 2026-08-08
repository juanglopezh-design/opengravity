import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ToolInteractiveGenerator from '@/components/ToolInteractiveGenerator';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'src', 'content', 'seo', `${slug}.json`);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return {
      title: `${data.title} | ContentFlow AI`,
      description: data.metaDescription,
    };
  } catch {
    return {
      title: 'Tool Not Found',
    };
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'src', 'content', 'seo', `${slug}.json`);
  
  let data;
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    data = JSON.parse(fileContent);
  } catch {
    notFound();
  }

  // Very simple markdown rendering for h2 and links
  const renderContent = (markdown: string) => {
    const html = markdown
      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-white">$1</h2>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#00FF9D] hover:underline">$1</a>')
      .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": data.h1,
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1280",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `¿Cómo funciona ${data.h1}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Introduce tu tema o idea y nuestra IA potenciada por Gemini creará publicaciones optimizadas en 10 segundos.",
            },
          },
          {
            "@type": "Question",
            "name": "¿Es gratis probar ContentFlow AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí, puedes realizar pruebas gratuitas instantáneas sin necesidad de ingresar tarjeta de crédito.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-300 py-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#00FF9D] hover:underline mb-8 inline-block">
          &larr; Back to ContentFlow AI
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {data.h1}
        </h1>

        <ToolInteractiveGenerator toolTitle={data.h1} />
        
        <div className="prose prose-invert prose-lg max-w-none text-gray-300">
          {renderContent(data.contentMarkdown)}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-br from-[#1A1A1D] to-[#0A0A0B] rounded-2xl border border-gray-800 shadow-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to automate your content?</h3>
          <p className="text-gray-400 mb-6">Stop wasting hours. Generate ready-to-publish posts in 10 seconds.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-[#00FF9D] hover:bg-[#00CC7D] transition-colors shadow-[0_0_15px_rgba(0,255,157,0.4)]">
            Try ContentFlow AI Free
          </Link>
        </div>
      </div>
    </div>
  );
}
