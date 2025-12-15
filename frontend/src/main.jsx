import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const STORAGE_KEY = "guest_house_stock_data";

/* =====================
   UNIT DETECTION
===================== */
const liquidItems = ["milk", "water", "oil", "juice"];
const weightItems = ["rice", "sugar", "flour", "dhal"];
const countItems = ["egg", "eggs", "soap", "bottle", "chair"];

function detectUnit(item, rawQty) {
  if (!rawQty) return { qty: "", unit: "" };

  const num = parseFloat(rawQty);
  const hasKg = rawQty.includes("kg");
  const hasG = rawQty.includes("g");
  const hasL = rawQty.includes("l");
  const hasMl = rawQty.includes("ml");

  if (hasKg) return { qty: num, unit: "packet" };

  if (weightItems.some(w => item.includes(w))) {
    if (num >= 1000) return { qty: num / 1000, unit: "kg" };
    return { qty: num, unit: "g" };
  }

  if (liquidItems.some(l => item.includes(l))) {
    if (num >= 1000) return { qty: num / 1000, unit: "L" };
    return { qty: num, unit: "ml" };
  }

  return { qty: num, unit: "count" };
}

function App() {
  const [showApp, setShowApp] = useState(false);
  const [command, setCommand] = useState("");

  const emptyRow = {
    item: "",
    unit: "",
    openDate: "",
    openQty: "",
    inDate: "",
    inQty: "",
    outDate: "",
    outQty: "",
    balDate: ""
  };

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{ ...emptyRow }];
  });

  /* =====================
     AUTO SAVE
  ===================== */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  /* =====================
     FORMULA
  ===================== */
  const balanceQty = (r) => {
    const o = parseFloat(r.openQty) || 0;
    const i = parseFloat(r.inQty) || 0;
    const out = parseFloat(r.outQty) || 0;
    if (!r.openQty && !r.inQty && !r.outQty) return "";
    return o + i - out;
  };

  const update = (i, key, val) => {
    const copy = [...rows];
    copy[i][key] = val;
    setRows(copy);
  };

  const addRow = () => setRows([...rows, { ...emptyRow }]);
  const deleteRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  /* =====================
     AI COMMAND
  ===================== */
  const runAI = () => {
    const parts = command.toLowerCase().split(" ");
    if (parts.length < 4) return alert("Example: add sugar in 1kg");

    const item = parts[1];
    const type = parts[2];
    const qtyRaw = parts[3];

    let idx = rows.findIndex(r => r.item.toLowerCase() === item);
    const copy = [...rows];

    if (idx === -1) {
      copy.push({ ...emptyRow, item });
      idx = copy.length - 1;
    }

    const { qty, unit } = detectUnit(item, qtyRaw);
    copy[idx].unit = unit;

    if (type === "opening") copy[idx].openQty = qty;
    if (type === "in") copy[idx].inQty = qty;
    if (type === "out") copy[idx].outQty = qty;

    setRows(copy);
    setCommand("");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      {!showApp ? (
        <div style={{ textAlign: "center", marginTop: 120 }}>
          <h1>🏨 Guest House Stock Manager</h1>
          <button onClick={() => setShowApp(true)}>Open App</button>
        </div>
      ) : (
        <>
          <h2>Guest House Stock Sheet</h2>

          <div style={{ marginBottom: 15 }}>
            <input
              style={{ width: "60%" }}
              placeholder="AI: add sugar in 1kg"
              value={command}
              onChange={e => setCommand(e.target.value)}
            />
            <button onClick={runAI} style={{ marginLeft: 10 }}>
              🤖 Run
            </button>
          </div>

          <button onClick={addRow}>➕ Add Item</button>

          <table border="1" cellPadding="6" style={{ marginTop: 15, width: "100%" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>S.No</th>
                <th>Item</th>
                <th>Unit</th>
                <th colSpan="2">Opening</th>
                <th colSpan="2">In</th>
                <th colSpan="2">Out</th>
                <th colSpan="2">Balance</th>
                <th>❌</th>
              </tr>
              <tr>
                <th></th><th></th><th></th>
                <th>Date</th><th>Qty</th>
                <th>Date</th><th>Qty</th>
                <th>Date</th><th>Qty</th>
                <th>Date</th><th>Qty</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><input value={r.item} onChange={e => update(i, "item", e.target.value)} /></td>
                  <td><input value={r.unit} onChange={e => update(i, "unit", e.target.value)} /></td>

                  <td><input value={r.openDate} onChange={e => update(i, "openDate", e.target.value)} /></td>
                  <td><input value={r.openQty} onChange={e => update(i, "openQty", e.target.value)} /></td>

                  <td><input value={r.inDate} onChange={e => update(i, "inDate", e.target.value)} /></td>
                  <td><input value={r.inQty} onChange={e => update(i, "inQty", e.target.value)} /></td>

                  <td><input value={r.outDate} onChange={e => update(i, "outDate", e.target.value)} /></td>
                  <td><input value={r.outQty} onChange={e => update(i, "outQty", e.target.value)} /></td>

                  <td><input value={r.balDate} onChange={e => update(i, "balDate", e.target.value)} /></td>

                  <td style={{ background: "#ffeaa7", fontWeight: "bold" }}>
                    {balanceQty(r)}
                  </td>

                  <td><button onClick={() => deleteRow(i)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);







