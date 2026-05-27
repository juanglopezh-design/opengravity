/**
 * NOWPayments webhook — not implemented.
 * This file exists as a placeholder. The app currently uses Bitcoin direct
 * payments via /api/webhooks/crypto-verify.
 *
 * If you want to add NOWPayments support in the future, implement the
 * webhook handler here following the NOWPayments IPN documentation:
 * https://documenter.getpostman.com/view/7907941/2s93JqTRWN
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
