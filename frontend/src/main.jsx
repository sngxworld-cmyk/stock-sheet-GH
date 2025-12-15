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

  if (text.includes("kg")) return { qty: num, unit: "kg" };
  if (text.includes("g")) return { qty: num / 1000, unit: "kg" };
  if (text.includes("ml")) return { qty: num / 1000, unit: "L" };
  if (text.includes("l")) return { qty: num, unit: "L" };

  if (weightItems.some(w => item.includes(w)))
    return { qty: num, unit: "kg" };

  if (liquidItems.some(l => item.includes(l)))
    return { qty: num, unit: "L" };

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
    return o + i - o1 - o2;
  };

  /* 🔢 TOTALS */
  const totals = rows.reduce(
    (acc, r) => {
      const bal = balanceQty(r);
      if (!bal) return acc;

      if (r.unit === "count") acc.count += bal;
      if (r.unit === "kg") acc.kg += bal;
      if (r.unit === "L") acc.l += bal;

      return acc;
    },
    { count: 0, kg: 0, l: 0 }
  );

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
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>

      {page === "app" && (
        <div style={{ padding: 20 }}>

          {/* 🔢 TOTAL DASHBOARD */}
          <div style={{
            display: "flex",
            gap: 20,
            marginBottom: 20
          }}>
            <div style={card}>
              <h4>Total Countables</h4>
              <strong>{totals.count}</strong>
            </div>

            <div style={card}>
              <h4>Total Kg</h4>
              <strong>{totals.kg.toFixed(2)} kg</strong>
            </div>

            <div style={card}>
              <h4>Total Litres</h4>
              <strong>{totals.l.toFixed(2)} L</strong>
            </div>
          </div>

          {/* AI */}
          <input
            style={{ width: "60%" }}
            placeholder="AI: add 2kg sugar 2025/01/01 opening"
            value={command}
            onChange={e => setCommand(e.target.value)}
          />
          <button onClick={runAI}>🤖 Run</button>
          <button onClick={addRow}>➕ Row</button>

          {/* TABLE */}
          <table width="100%" cellPadding="6" style={{ marginTop: 15 }}>
            <thead>
              <tr>
                <th>#</th><th>Item</th><th>Unit</th>
                <th>Open Date</th><th>Open Qty</th>
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
                  <td><input type="date" value={r.openDate} /></td>
                  <td><input onChange={e => updateQty(i, "openQty", e.target.value)} /></td>
                  <td><input type="date" /></td>
                  <td><input onChange={e => updateQty(i, "outQty1", e.target.value)} /></td>
                  <td><input type="date" /></td>
                  <td><input onChange={e => updateQty(i, "inQty", e.target.value)} /></td>
                  <td><input type="date" /></td>
                  <td><input onChange={e => updateQty(i, "outQty2", e.target.value)} /></td>
                  <td><b>{balanceQty(r)}</b></td>
                  <td><button onClick={() => deleteRow(i)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const card = {
  background: "white",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
  minWidth: 160,
  textAlign: "center"
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
