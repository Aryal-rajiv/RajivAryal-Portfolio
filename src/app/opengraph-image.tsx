import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0d1117", color: "#e8eaed", fontFamily: "serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#2dd4bf", color: "#062320", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, fontFamily: "sans-serif" }}>RA</div>
          <div style={{ fontSize: 28, color: "#8b929d", fontFamily: "sans-serif" }}>aryalrajiv.com.np</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ fontSize: 38, color: "#2dd4bf", marginTop: 18, fontFamily: "sans-serif" }}>{site.role}</div>
        </div>
        <div style={{ fontSize: 26, color: "#b6bcc6", fontFamily: "sans-serif" }}>Web systems · Usable security · Digital infrastructure · Responsible AI</div>
      </div>
    ),
    size,
  );
}
