import { NextResponse } from "next/server";
import { sendWelcomeOnboardingEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing email or name" }, { status: 400 });
    }

    // Trigger email send asynchronously
    await sendWelcomeOnboardingEmail({
      userEmail: String(email).trim(),
      userName: String(name).trim(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Signup email route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
