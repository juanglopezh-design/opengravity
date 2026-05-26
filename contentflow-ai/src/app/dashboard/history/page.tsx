"use client";
import { useEffect, useState, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import styles from "./history.module.css";
import { History as HistoryIcon, Copy, Check, ChevronDown } from "lucide-react";

const PAGE_SIZE = 20;

type HistoryItem = {
  id: string;
  prompt: string;
  type: string;
  content: string;
  createdAt: { toDate: () => Date } | null;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const baseQuery = query(
        collection(db, "users", user.uid, "history"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      const paginatedQuery = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
      const snapshot = await getDocs(paginatedQuery);

      const data: HistoryItem[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          prompt: typeof d.prompt === "string" ? d.prompt : "",
          type: typeof d.type === "string" ? d.type : "",
          content: typeof d.content === "string" ? d.content : "",
          createdAt: d.createdAt ?? null,
        };
      });

      setHistory((prev) => (cursor ? [...prev, ...data] : data));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

  useEffect(() => {
    fetchHistory().finally(() => setLoading(false));
  }, [fetchHistory]);

  const handleLoadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    await fetchHistory(lastDoc);
    setLoadingMore(false);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historial de Generaciones</h1>
        <p className={styles.subtitle}>Todo tu contenido guardado en un solo lugar.</p>
      </header>

      {loading ? (
        <div className={styles.loading}>Cargando historial...</div>
      ) : history.length === 0 ? (
        <div className={styles.emptyState}>
          <HistoryIcon size={48} className={styles.emptyIcon} />
          <h3>Aún no tienes historial</h3>
          <p>Tus generaciones aparecerán aquí para que las reutilices cuando quieras.</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {history.map((item) => (
              <div key={item.id} className={`glass-card ${styles.card}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.type}>{item.type}</span>
                    <span className={styles.date}>
                      {item.createdAt?.toDate
                        ? format(item.createdAt.toDate(), "dd MMM yyyy, HH:mm", { locale: es })
                        : "Reciente"}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.id, item.content)}
                    className={styles.copyBtn}
                    title="Copiar contenido"
                  >
                    {copiedId === item.id ? (
                      <Check size={16} color="#10b981" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <div className={styles.prompt}>
                  <strong>Prompt:</strong> {item.prompt}
                </div>
                <div className={styles.content}>{item.content}</div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
              <button
                onClick={handleLoadMore}
                className="btn-secondary"
                disabled={loadingMore}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                {loadingMore ? (
                  "Cargando..."
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Cargar más
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
