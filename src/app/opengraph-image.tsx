import { ImageResponse } from "next/og";

export const alt = "DXB Creek Harbour — an independent buyer's guide to Dubai Creek Harbour";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview card shown when the site is shared on WhatsApp, LinkedIn, etc. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "linear-gradient(180deg, #0b1733 0%, #1d3560 70%, #8a6d39 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#e8c98a", textTransform: "uppercase" }}>
          Dubai Creek Harbour · Buyer&apos;s guide
        </div>
        <div style={{ fontSize: 76, marginTop: 20, lineHeight: 1.05 }}>Know the district before you choose the tower.</div>
        <div style={{ fontSize: 30, marginTop: 28, color: "rgba(255,255,255,0.75)" }}>dxbdubaicreekharbour.ae</div>
      </div>
    ),
    size
  );
}
