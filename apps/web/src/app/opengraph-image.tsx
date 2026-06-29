import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";
export const alt = "App Open Graph Image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generates the default /opengraph-image used by layout.tsx metadata.
// Customise the JSX below to match your brand — colours, logo, typography.
export default function OgImage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "My App";
  const description =
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "A production-grade TypeScript React application";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        fontFamily: "system-ui, sans-serif",
        padding: "60px",
      }}
    >
      {/* Logo / Icon placeholder — replace with your own <img> */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          fontSize: 48,
          color: "#fff",
        }}
      >
        ✦
      </div>

      {/* App name */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-2px",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        {appName}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 28,
          color: "#94a3b8",
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>

      {/* Bottom badge */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(37, 99, 235, 0.2)",
          border: "1px solid rgba(37, 99, 235, 0.4)",
          borderRadius: 999,
          padding: "8px 20px",
          color: "#60a5fa",
          fontSize: 18,
        }}
      >
        Built with TypeScript · React · Next.js
      </div>
    </div>,
    { ...size },
  );
}
