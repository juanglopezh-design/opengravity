export function getApiUrl(path: string): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Si la app está cargada desde Firebase Hosting, forzamos las llamadas API al backend real de Render
    if (hostname.includes("web.app") || hostname.includes("firebaseapp.com")) {
      return `https://contentflow-ai-ex6w.onrender.com${path}`;
    }
  }
  return path;
}
