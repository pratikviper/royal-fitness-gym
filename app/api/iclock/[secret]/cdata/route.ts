import { NextResponse } from "next/server";
import {
  ingestPunches,
  isSerialAllowed,
  parseAttlog,
  secretMatches,
} from "@/lib/server/biometric";

export const dynamic = "force-dynamic";

/**
 * eSSL / ZKTeco ADMS endpoint — device handshake and attendance upload.
 *
 * The terminal calls this on its own schedule; the shapes below are dictated by
 * the device firmware, not chosen here:
 *
 *   GET  .../cdata?SN=<serial>&options=all   -> plain-text config block
 *   POST .../cdata?SN=<serial>&table=ATTLOG  -> tab-separated punch records
 *
 * Replies must be plain text. Firmware parses them literally and will retry
 * forever against JSON or an HTML error page, so every response here — including
 * rejections — is text/plain.
 */

/** Devices treat any non-2xx as "retry later", so refusals still return 200. */
function textOk(body: string) {
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function unauthorized() {
  // Deliberately terse: the device ignores it, and a probe learns nothing.
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Handshake: the device asks how it should behave. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ secret: string }> }
) {
  const { secret } = await params;
  const serial = new URL(request.url).searchParams.get("SN");

  if (!secretMatches(secret) || !isSerialAllowed(serial)) {
    console.warn("[iclock] Rejected handshake from serial:", serial);
    return unauthorized();
  }

  // Realtime=1 makes the device post each punch as it happens rather than
  // batching. TransFlag lists what it may upload; only AttLog is consumed here.
  const config = [
    `GET OPTION FROM: ${serial}`,
    "Stamp=9999",
    "OpStamp=9999",
    "ErrorDelay=30",
    "Delay=10",
    "TransTimes=00:00;14:05",
    "TransInterval=1",
    "TransFlag=TransData AttLog OpLog",
    "Realtime=1",
    "Encrypt=0",
  ].join("\n");

  return textOk(config + "\n");
}

/** Attendance upload. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ secret: string }> }
) {
  const { secret } = await params;
  const url = new URL(request.url);
  const serial = url.searchParams.get("SN");
  const table = url.searchParams.get("table");

  if (!secretMatches(secret) || !isSerialAllowed(serial)) {
    console.warn("[iclock] Rejected upload from serial:", serial);
    return unauthorized();
  }

  const body = await request.text();

  // Devices also push operation logs and user edits; acknowledge and ignore
  // them, otherwise the firmware retries the same payload indefinitely.
  if (table && table.toUpperCase() !== "ATTLOG") {
    return textOk("OK");
  }

  const punches = parseAttlog(body);

  try {
    const result = await ingestPunches(serial as string, punches);
    console.info(
      `[iclock] ${serial}: received ${result.received}, recorded ${result.recorded}, ` +
        `duplicates ${result.duplicates}, unmatched ${result.unmatched}`
    );
    // The device expects "OK: <count>"; it re-sends the batch on anything else.
    return textOk(`OK: ${result.recorded}`);
  } catch (e) {
    console.error("[iclock] Ingest failed:", e);
    // Non-200 tells the device to hold the batch and retry, so nothing is lost.
    return new NextResponse("ERROR", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
