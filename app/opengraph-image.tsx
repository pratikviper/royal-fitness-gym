import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

// Generated OG image (no static /og.jpg needed). Prerendered at build time.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 80% at 50% 0%, #2a0810 0%, #050505 60%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 18,
              height: 60,
              background: "#e11d3a",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              fontSize: 30,
              letterSpacing: 12,
              textTransform: "uppercase",
              color: "#bdbdbd",
            }}
          >
            Royal Fitness
          </div>
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            lineHeight: 1,
            textAlign: "center",
            background: "linear-gradient(180deg,#ffffff,#8f8f8f)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          TRAIN LIKE ROYALTY
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#9a9a9a" }}>
          Elite Coaching · Luxury Facilities · Real Results
        </div>
      </div>
    ),
    { ...size },
  );
}
