import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Paro FC League Standings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Red top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #DC2626, #B91C1C)",
          }}
        />

        {/* Diagonal grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 40px, white 40px, white 41px)",
          }}
        />

        {/* Glow circle */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 80px",
            justifyContent: "space-between",
          }}
        >
          {/* Top row: logo + site name */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://parofc.com/assets/paro.png"
              width={56}
              height={56}
              alt="Paro FC"
              style={{ objectFit: "contain" }}
            />
            <span
              style={{
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Paro FC
            </span>
            {/* Live pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.4)",
                borderRadius: "999px",
                padding: "4px 14px",
                marginLeft: "8px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#EF4444",
                }}
              />
              <span
                style={{
                  color: "#EF4444",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Live
              </span>
            </div>
          </div>

          {/* Center: headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span
              style={{
                color: "#DC2626",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              Standings
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "96px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                }}
              >
                League
              </span>
              <span
                style={{
                  color: "#D4A017",
                  fontSize: "96px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                }}
              >
                Tables
              </span>
            </div>
          </div>

          {/* Bottom: url */}
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            parofc.com/standings
          </span>
        </div>

        {/* Right side decorative column */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            opacity: 0.08,
          }}
        >
          {["#", "Club", "P", "W", "D", "L", "GD", "Pts"].map((h) => (
            <div
              key={h}
              style={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {h}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
