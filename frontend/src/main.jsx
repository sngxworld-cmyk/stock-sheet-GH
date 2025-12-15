import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

  if (weightItems.some(w => item.includes(w))) {
    return num >= 1000
      ? { qty: num / 1000, unit: "kg" }
      : { qty: num, unit: "g" };
  }

  if (liquidItems.some(l => item.includes(l))) {
    return num >= 1000
      ? { qty: num / 1000, unit: "L" }
      : { qty: num, unit: "ml" };
  }

  return { qty: num, unit: "count" };
}

function App() {
  const emptyRow = {
    date: "",
    item: "",
    unit: "",
    openQty: "",
    inQty: "",
    outQty: ""
  };

  const [showApp, setShowApp] = useState(false);
  const [command, setCommand] = useState("");
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{ ...emptyRow }];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const balanceQty = (r) => {
    const o = parseFloat(r.openQty) || 0;
    const i = parseFloat(r.inQty) || 0;
    const out = parseFloat(r.outQty) || 0;
    if (!r.openQty && !r.inQty && !r.outQty) return "";
    return o + i - out;
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

  const deleteRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const runAI = () => {
    const words = command.toLowerCase().split(" ");
    let item = "", type = "", qtyText = "";

    words.forEach(w => {
      if (["opening", "in", "out"].includes(w)) type = w;
      if (/\d/.test(w)) qtyText = w;
    });

    item = words.find(w =>
      !["add", "opening", "in", "out"].includes(w) && !/\d/.test(w)
    );

    if (!item || !type || !qtyText) {
      alert("Example: add 2kg sugar opening");
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
    if (type === "opening") copy[idx].openQty = qty;
    if (type === "in") copy[idx].inQty = qty;
    if (type === "out") copy[idx].outQty = qty;

    setRows(copy);
    setCommand("");
  };

  const totalCountables = rows.reduce((s, r) =>
    r.unit === "count" ? s + (balanceQty(r) || 0) : s, 0);

  const totalUncountables = rows.reduce((s, r) =>
    ["g", "kg", "ml", "L", "packet"].includes(r.unit)
      ? s + (balanceQty(r) || 0)
      : s, 0);

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

          <input
            style={{ width: "60%" }}
            placeholder="AI: add 2kg sugar opening"
            value={command}
            onChange={e => setCommand(e.target.value)}
          />
          <button onClick={runAI} style={{ marginLeft: 10 }}>🤖 Run</button>
          <button onClick={addRow} style={{ marginLeft: 10 }}>➕ Add Row</button>

          <table border="1" cellPadding="6" width="100%" style={{ marginTop: 15 }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>S.No</th>
                <th>Date</th>
                <th>Item</th>
                <th>Unit</th>
                <th>Opening</th>
                <th>In</th>
                <th>Out</th>
                <th>Balance</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input type="date" value={r.date}
                      onChange={e => {
                        const c = [...rows];
                        c[i].date = e.target.value;
                        setRows(c);
                      }} />
                  </td>
                  <td>
                    <input value={r.item}
                      onChange={e => {
                        const c = [...rows];
                        c[i].item = e.target.value;
                        setRows(c);
                      }} />
                  </td>
                  <td style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                    {r.unit}
                  </td>
                  <td><input onChange={e => updateQty(i, "openQty", e.target.value)} /></td>
                  <td><input onChange={e => updateQty(i, "inQty", e.target.value)} /></td>
                  <td><input onChange={e => updateQty(i, "outQty", e.target.value)} /></td>
                  <td style={{ background: "#ffeaa7", fontWeight: "bold" }}>
                    {balanceQty(r)}
                  </td>
                  <td>
                    <button onClick={() => deleteRow(i)} disabled={rows.length === 1}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}

              <tr style={{ fontWeight: "bold", background: "#dfe6e9" }}>
                <td colSpan="8" align="right">Total Countables</td>
                <td>{totalCountables}</td>
              </tr>
              <tr style={{ fontWeight: "bold", background: "#dfe6e9" }}>
                <td colSpan="8" align="right">Total Uncountables</td>
                <td>{totalUncountables}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);







