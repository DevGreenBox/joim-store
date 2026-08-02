import { ImageResponse } from "next/og";

export const alt = "JOIM — пусковые устройства и автопылесосы";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Превью для соцсетей. Собирается из примитивов — без картинок и без
 * подгрузки шрифтов: подписи латиницей, чтобы хватило встроенного шрифта.
 */
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
          padding: 80,
          background:
            "radial-gradient(120% 90% at 50% -10%, #1a1508 0%, #08090b 55%)",
          color: "#f2f4f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              border: "2px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            J
          </div>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 10,
              fontWeight: 700,
            }}
          >
            JOIM STORE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            Jump starters
          </div>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -3,
              color: "#98a1af",
            }}
          >
            that never fail
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontSize: 24,
            color: "#98a1af",
            borderTop: "2px solid rgba(255,255,255,0.12)",
            paddingTop: 32,
          }}
        >
          <span style={{ color: "#8cc53f" }}>ES-19</span>
          <span>ES-29</span>
          <span>PVC-1</span>
          <span>Own production since 2019</span>
        </div>
      </div>
    ),
    size,
  );
}
