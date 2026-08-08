import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { siteUrl } from "@/lib/config";
import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/status`, lastModified: now, changeFrequency: "daily", priority: 0.4 },
  ];

  try {
    const fetchWithTimeout = Promise.race([
      adminDb.collection("blog_posts").where("published", "==", true).get(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore sitemap timeout")), 3000)
      ),
    ]);

    const snapshot = await fetchWithTimeout;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      let lastModified = now;
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === "function") {
          lastModified = data.createdAt.toDate();
        } else if (data.createdAt._seconds !== undefined) {
          lastModified = new Date(data.createdAt._seconds * 1000);
        } else {
          lastModified = new Date(data.createdAt);
        }
      }

      routes.push({
        url: `${base}/blog/${slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  } catch {
    console.error("Error generating sitemap blog entries.");
    const fallbackSlugs = [
      "inteligencia-artificial-redefiniendo-copywriting",
      "5-estrategias-virales-crecer-linkedin-automatizado",
      "por-que-monetizar-saas-bitcoin-futuro"
    ];
    fallbackSlugs.forEach((slug) => {
      routes.push({
        url: `${base}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  }

  // Load SEO programmatic pages
  try {
    const seoDir = path.join(process.cwd(), 'src', 'content', 'seo');
    if (fs.existsSync(seoDir)) {
      const files = fs.readdirSync(seoDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const slug = file.replace('.json', '');
          routes.push({
            url: `${base}/tools/${slug}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    console.error("Error generating sitemap SEO entries.");
  }

  return routes;
}
