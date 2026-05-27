"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserPlanData = {
  plan?: string;
  generationsUsed?: number;
  generationsLimit?: number;
  name?: string;
  email?: string;
};

type UserDataContextValue = {
  userData: UserPlanData | null;
  refreshUserData: () => Promise<void>;
  applyUsageFromServer: (partial: Partial<UserPlanData>) => void;
};

const UserDataContext = createContext<UserDataContextValue | null>(null);

export function UserDataProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [userData, setUserData] = useState<UserPlanData | null>(null);

  const loadUserData = useCallback(async (uid: string) => {
    let data: UserPlanData | null = null;
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        data = docSnap.data() as UserPlanData;
      }
    } catch (e) {
      console.warn("Could not fetch user doc from Firestore:", e);
    }

    setUserData(data);
  }, []);

  useEffect(() => {
    loadUserData(userId);
  }, [userId, loadUserData]);

  const refreshUserData = useCallback(async () => {
    await loadUserData(userId);
  }, [userId, loadUserData]);

  const applyUsageFromServer = useCallback((partial: Partial<UserPlanData>) => {
    setUserData((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <UserDataContext.Provider value={{ userData, refreshUserData, applyUsageFromServer }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) {
    throw new Error("useUserData debe usarse dentro de UserDataProvider");
  }
  return ctx;
}
