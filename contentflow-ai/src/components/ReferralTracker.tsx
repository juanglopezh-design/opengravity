"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const ref = searchParams.get("ref");
      if (ref) {
        window.localStorage.setItem("referredBy", ref.trim());
        console.log("[ReferralTracker] Saved referral code:", ref.trim());
      }
    } catch (err) {
      console.error("[ReferralTracker] Error writing referredBy to localStorage:", err);
    }
  }, [searchParams]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
