import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NeedItz — Tell Us What You Need";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "88px", fontWeight: 900, color: "#050505", letterSpacing: "-3px" }}>
              NeedItz
            </span>
            <div style={{ width: "80px", height: "6px", backgroundColor: "#FFC400", borderRadius: "3px", marginTop: "4px" }} />
          </div>
          <p style={{ fontSize: "28px", color: "#5E6168", textAlign: "center", maxWidth: "680px", marginTop: "16px", lineHeight: "1.4" }}>
            Tell us what you need. We&apos;ll review whether we can help source it.
          </p>
          <div style={{ marginTop: "32px", padding: "16px 40px", backgroundColor: "#050505", borderRadius: "16px", color: "#ffffff", fontSize: "22px", fontWeight: 700 }}>
            Free to submit
          </div>
        </div>
      </div>
    ),
    size
  );
}
