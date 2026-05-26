import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export type AuthSuccess = { ok: true; uid: string };
export type AuthFailure = { ok: false; response: NextResponse };

export async function requireAuth(req: Request): Promise<AuthSuccess | AuthFailure> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    return { ok: true, uid: decoded.uid };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token inválido" }, { status: 401 }),
    };
  }
}
