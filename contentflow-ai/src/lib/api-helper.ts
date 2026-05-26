import { apiBaseUrl } from "@/lib/config";

const FIREBASE_HOSTING_SUFFIXES = ["web.app", "firebaseapp.com"];

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const onFirebaseHosting = FIREBASE_HOSTING_SUFFIXES.some((suffix) =>
      hostname.endsWith(suffix)
    );
    if (onFirebaseHosting && apiBaseUrl) {
      return `${apiBaseUrl}${normalizedPath}`;
    }
  }

  return normalizedPath;
}
