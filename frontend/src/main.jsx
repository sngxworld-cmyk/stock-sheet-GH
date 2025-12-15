import React, { useState } from "react";
import ReactDOM from "react-dom/client";

/* =======================
   APP COMPONENT
======================= */
function App() {
  const [showApp, setShowApp] = useState(false);

  // dummy placeholders (safe for build)
  const exportExcel = () => alert("Excel export coming soon");
  const exportPDF = () => alert("PDF export coming soon");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily: "Arial, sans-serif"
      }}
    >
      {/* ===== OPENING PAGE ===== */}
      {!showApp && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center"
          }}
        >
          <h1 style={{ fontSize: 36 }}>🏨 Guest House Stock Manager</h1>
          <p style={{ fontSize: 18, color: "#555", maxWidth: 500 }}>
            Smart inventory management for your guest house.
          </p>

          <button
            style={{
              marginTop: 30,
              padding: "12px 30px",
              fontSize: 18,
              borderRadius: 8,
              border: "none",
              background: "#1976d2",
              color: "white",
              cursor: "pointer"
            }}
            onClick={() => setShowApp(true)}
          >
            Open Stock Sheet
          </button>
        </div>
      )}

      {/* ===== MAIN APP PAGE ===== */}
      {showApp && (
        <div style={{ padding: 20 }}>
          <h2>🏨 Guest House Stock Sheet</h2>

          {/* EXPORT BUTTONS */}
          <div style={{ marginBottom: 15 }}>
            <button onClick={exportExcel}>📤 Export Excel</button>
            <button onClick={exportPDF} style={{ marginLeft: 10 }}>
              📄 Export PDF
            </button>
          </div>

          {/* PLACEHOLDER TABLE */}
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              boxShadow: "0 0 5px rgba(0,0,0,0.1)"
            }}
          >
            <p>
              Production app scaffold ready.
            </p>
            <p>
              Main spreadsheet, AI bot, and logic engines will run here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================
   RENDER APP
======================= */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);







