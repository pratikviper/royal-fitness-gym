import { NextResponse } from "next/server";
import { isSerialAllowed, secretMatches } from "@/lib/server/biometric";

export const dynamic = "force-dynamic";

/**
 * Command acknowledgement — the device reports the result of a command it was
 * given. Nothing is queued (see getrequest), so this only needs to accept and
 * acknowledge; without it the firmware logs a server error and can back off
 * from uploading attendance.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ secret: string }> }
) {
  const { secret } = await params;
  const serial = new URL(request.url).searchParams.get("SN");

  if (!secretMatches(secret) || !isSerialAllowed(serial)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = await request.text();
  if (body.trim()) console.info(`[iclock] ${serial} command result:`, body.slice(0, 500));

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
