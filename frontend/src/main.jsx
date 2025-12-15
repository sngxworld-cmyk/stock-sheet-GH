import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const STORAGE_KEY = "guest_house_stock_data";

const weightItems = ["rice", "sugar", "flour", "dhal"];
const liquidItems = ["milk", "water", "oil", "juice"];

function normalizeUnit(qtyText, item) {
  if (!qtyText) return { qty: "", unit: "" };
  const text = qtyText.toLowerCase();
  const num = parseFloat(text);
  if (isNaN(num)) return { qty: "", unit: "" };

  if (text.includes("kg")) return { qty: num, unit: "packet" };
  if (text.includes("g")) return { qty: num, unit: "g" };
  if (text.includes("ml")) return { qty: num, unit: "ml" };
  if (text.includes("l")) return { qty: num, unit: "L" };

  if (weightItems.some(w => item.includes(w)))
    return num >= 1000 ? { qty: num / 1000, unit: "kg" } : { qty: num, unit: "g" };

  if (liquidItems.some(l => item.includes(l)))
    return num >= 1000 ? { qty: num / 1000, unit: "L" } : { qty: num, unit: "ml" };

  return { qty: num, unit: "count" };
}

function App() {
  const emptyRow = {
    item: "",
    unit: "",
    openDate: "",
    openQty: "",
    outDate1: "",
    outQty1: "",
    inDate: "",
    inQty: "",
    outDate2: "",
    outQty2: ""
  };

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{ ...emptyRow }];
  });

  const [command, setCommand] = useState("");
  const [page, setPage] = useState("home");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const balanceQty = (r) => {
    const o = parseFloat(r.openQty) || 0;
    const i = parseFloat(r.inQty) || 0;
    const o1 = parseFloat(r.outQty1) || 0;
    const o2 = parseFloat(r.outQty2) || 0;
    if (!o && !i && !o1 && !o2) return "";
    return o + i - o1 - o2;
  };

  const updateQty = (i, key, val) => {
    const copy = [...rows];
    const item = copy[i].item.toLowerCase();
    const { qty, unit } = normalizeUnit(val, item);
    copy[i][key] = qty;
    copy[i].unit = unit;
    setRows(copy);
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);
  const deleteRow = (i) =>
    rows.length > 1 && setRows(rows.filter((_, x) => x !== i));

  const runAI = () => {
    const words = command.toLowerCase().split(" ");
    let item = "", qtyText = "", type = "", date = "";

    words.forEach(w => {
      if (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(w)) date = w.replaceAll("/", "-");
      if (/\d/.test(w)) qtyText = w;
      if (["opening", "in", "out"].includes(w)) type = w;
    });

    item = words.find(w =>
      !["add", "opening", "in", "out"].includes(w) &&
      !/\d/.test(w)
    );

    if (!item || !qtyText || !type) {
      alert("Example: add 2kg sugar 2025/01/01 opening");
      return;
    }

    const copy = [...rows];
    let idx = copy.findIndex(r => r.item.toLowerCase() === item);
    if (idx === -1) {
      copy.push({ ...emptyRow, item });
      idx = copy.length - 1;
    }

    const { qty, unit } = normalizeUnit(qtyText, item);
    copy[idx].unit = unit;

    if (type === "opening") {
      copy[idx].openQty = qty;
      if (date) copy[idx].openDate = date;
    }
    if (type === "in") {
      copy[idx].inQty = qty;
      if (date) copy[idx].inDate = date;
    }
    if (type === "out") {
      if (!copy[idx].outQty1) {
        copy[idx].outQty1 = qty;
        if (date) copy[idx].outDate1 = date;
      } else {
        copy[idx].outQty2 = qty;
        if (date) copy[idx].outDate2 = date;
      }
    }

    setRows(copy);
    setCommand("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: "Inter, Arial" }}>

      {/* HOME PAGE */}
      {page === "home" && (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#4facfe,#6a11cb)"
        }}>
          <div style={{
            background: "white",
            padding: 40,
            borderRadius: 16,
            width: 380,
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: "#6a11cb",
              color: "white",
              fontSize: 36,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              GH
            </div>
            <h2>Guest House Stock</h2>
            <p style={{ color: "#555" }}>
              Smart inventory system with AI-powered stock entry.
            </p>
            <button
              onClick={() => setPage("app")}
              style={{
                marginTop: 20,
                padding: "12px 26px",
                borderRadius: 10,
                border: "none",
                background: "#6a11cb",
                color: "white",
                fontSize: 15,
                cursor: "pointer"
              }}
            >
              Enter App →
            </button>
          </div>
        </div>
      )}

      {/* MAIN APP */}
      {page === "app" && (
        <>
          {/* Header */}
          <div style={{
            background: "white",
            padding: "14px 20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <strong>Guest House Stock Sheet</strong>
            <button onClick={() => setPage("home")} style={{ border: "none", background: "none", cursor: "pointer" }}>
              ⬅ Home
            </button>
          </div>

          <div style={{ padding: 20 }}>
            {/* AI Card */}
            <div style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              marginBottom: 20
            }}>
              <input
                style={{ width: "65%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                placeholder="AI: add 2kg sugar 2025/01/01 opening"
                value={command}
                onChange={e => setCommand(e.target.value)}
              />
              <button onClick={runAI} style={{ marginLeft: 10 }}>🤖 Run</button>
              <button onClick={addRow} style={{ marginLeft: 10 }}>➕ Row</button>
            </div>

            {/* Table Card */}
            <div style={{
              background: "white",
              borderRadius: 12,
              overflowX: "auto",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
            }}>
              <table width="100%" cellPadding="6">
                <thead style={{ background: "#f0f2f5" }}>
                  <tr>
                    <th>S.No</th><th>Item</th><th>Unit</th>
                    <th>Opening Date</th><th>Opening Qty</th>
                    <th>Out Date</th><th>Out Qty</th>
                    <th>In Date</th><th>In Qty</th>
                    <th>Out Date</th><th>Out Qty</th>
                    <th>Balance</th><th>❌</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><input value={r.item} onChange={e => {
                        const c = [...rows]; c[i].item = e.target.value; setRows(c);
                      }} /></td>
                      <td><b>{r.unit}</b></td>
                      <td><input type="date" value={r.openDate} onChange={e => {
                        const c = [...rows]; c[i].openDate = e.target.value; setRows(c);
                      }} /></td>
                      <td><input onChange={e => updateQty(i, "openQty", e.target.value)} /></td>
                      <td><input type="date" value={r.outDate1} onChange={e => {
                        const c = [...rows]; c[i].outDate1 = e.target.value; setRows(c);
                      }} /></td>
                      <td><input onChange={e => updateQty(i, "outQty1", e.target.value)} /></td>
                      <td><input type="date" value={r.inDate} onChange={e => {
                        const c = [...rows]; c[i].inDate = e.target.value; setRows(c);
                      }} /></td>
                      <td><input onChange={e => updateQty(i, "inQty", e.target.value)} /></td>
                      <td><input type="date" value={r.outDate2} onChange={e => {
                        const c = [...rows]; c[i].outDate2 = e.target.value; setRows(c);
                      }} /></td>
                      <td><input onChange={e => updateQty(i, "outQty2", e.target.value)} /></td>
                      <td style={{ background: "#ffeaa7", fontWeight: "bold" }}>{balanceQty(r)}</td>
                      <td><button onClick={() => deleteRow(i)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);




