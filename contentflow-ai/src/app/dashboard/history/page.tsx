"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import styles from "./history.module.css";
import { History as HistoryIcon, Copy, Check } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "users", user.uid, "history"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
        <div className={styles.grid}>
          {history.map((item) => (
            <div key={item.id} className={`glass-card ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.type}>{item.type}</span>
                  <span className={styles.date}>
                    {item.createdAt?.toDate ? format(item.createdAt.toDate(), "dd MMM yyyy, HH:mm", { locale: es }) : "Reciente"}
                  </span>
                </div>
                <button 
                  onClick={() => copyToClipboard(item.id, item.content)}
                  className={styles.copyBtn}
                  title="Copiar contenido"
                >
                  {copiedId === item.id ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>
              <div className={styles.prompt}>
                <strong>Prompt:</strong> {item.prompt}
              </div>
              <div className={styles.content}>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
