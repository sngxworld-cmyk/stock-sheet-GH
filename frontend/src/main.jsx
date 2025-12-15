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
  const deleteRow = (i) => rows.length > 1 && setRows(rows.filter((_, x) => x !== i));

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
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>Guest House Stock Sheet</h2>

      <input
        style={{ width: "60%" }}
        placeholder="AI: add 2kg sugar 2025/01/01 opening"
        value={command}
        onChange={e => setCommand(e.target.value)}
      />
      <button onClick={runAI} style={{ marginLeft: 10 }}>🤖 Run</button>
      <button onClick={addRow} style={{ marginLeft: 10 }}>➕ Add Row</button>

      <table border="1" cellPadding="6" width="100%" style={{ marginTop: 15 }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>S.No</th>
            <th>Item</th>
            <th>Unit</th>
            <th>Opening Date</th>
            <th>Opening Qty</th>
            <th>Out Date</th>
            <th>Out Qty</th>
            <th>In Date</th>
            <th>In Qty</th>
            <th>Out Date</th>
            <th>Out Qty</th>
            <th>Balance</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td><input value={r.item} onChange={e => {
                const c = [...rows]; c[i].item = e.target.value; setRows(c);
              }} /></td>
              <td style={{ background: "#f0f0f0", fontWeight: "bold" }}>{r.unit}</td>

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

              <td style={{ background: "#ffeaa7", fontWeight: "bold" }}>
                {balanceQty(r)}
              </td>

              <td>
                <button onClick={() => deleteRow(i)} disabled={rows.length === 1}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);








