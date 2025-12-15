import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const STORAGE_KEY = "guest_house_stock_data";

const weightItems = ["rice", "sugar", "flour", "dhal"];
const liquidItems = ["milk", "water", "oil", "juice"];
const countItems = ["egg", "eggs", "soap", "bottle", "chair"];

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

  const runAI = () => {
    const words = command.toLowerCase().split(" ");
    let item = "";
    let type = "";
    let qtyText = "";

    words.forEach(w => {
      if (["opening", "in", "out"].includes(w)) type = w;
      if (/\d/.test(w)) qtyText = w;
    });

    item = words.find(w =>
      !["add", "opening", "in", "out"].includes(w) &&
      !/\d/.test(w)
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
              placeholder="AI: add 2kg sugar opening"
              value={command}
              onChange={e => setCommand(e.target.value)}
            />
            <button onClick={runAI} style={{ marginLeft: 10 }}>
              🤖 Run
            </button>
          </div>

          <table border="1" cellPadding="6" width="100%">
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>S.No</th>
                <th>Item</th>
                <th>Unit</th>
                <th>Opening Qty</th>
                <th>In Qty</th>
                <th>Out Qty</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input
                      value={r.item}
                      onChange={e => {
                        const copy = [...rows];
                        copy[i].item = e.target.value;
                        setRows(copy);
                      }}
                    />
                  </td>
                  <td style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                    {r.unit}
                  </td>
                  <td>
                    <input onChange={e => updateQty(i, "openQty", e.target.value)} />
                  </td>
                  <td>
                    <input onChange={e => updateQty(i, "inQty", e.target.value)} />
                  </td>
                  <td>
                    <input onChange={e => updateQty(i, "outQty", e.target.value)} />
                  </td>
                  <td style={{ background: "#ffeaa7", fontWeight: "bold" }}>
                    {balanceQty(r)}
                  </td>
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







