import { NextResponse } from "next/server";
import { isSerialAllowed, secretMatches } from "@/lib/server/biometric";

export const dynamic = "force-dynamic";

/**
 * Command polling. The device asks, on a loop, whether the server has anything
 * for it (reboot, sync users, clear logs).
 *
 * Nothing is queued here — enrolment stays on the device itself — but the
 * endpoint must exist and answer "OK". Firmware treats a 404 as a broken server
 * and many models then stop uploading attendance altogether.
 */
export async function GET(
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

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
