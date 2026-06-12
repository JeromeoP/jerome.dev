import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/site";

export const alt = "Jerome Planken — Developer, Stockholm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#ECEAE5",
          padding: 56,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 4,
            color: "#7B7973",
          }}
        >
          <span>PORTFOLIO ©2026</span>
          <span>STOCKHOLM, SE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.9,
            }}
          >
            JEROME
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 30, color: "#FF4D00", fontStyle: "italic" }}>
              (developer)
            </div>
            <div
              style={{
                fontSize: 150,
                fontWeight: 800,
                letterSpacing: -4,
                lineHeight: 0.9,
              }}
            >
              PLANKEN
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 2,
            color: "#7B7973",
          }}
        >
          <span>{SITE_DESCRIPTION}</span>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#FF4D00",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
