import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const STORAGE_KEY = "guest_house_stock_data";
const PIN_CODE = "GH1982";

const weightItems = ["rice", "sugar", "flour", "dhal"];
const liquidItems = ["milk", "water", "oil", "juice"];

function normalizeUnit(qtyText, item) {
  if (!qtyText) return { qty: "", unit: "" };
  const text = qtyText.toLowerCase();
  const num = parseFloat(text);
  if (isNaN(num)) return { qty: "", unit: "" };

  if (text.includes("kg")) return { qty: num, unit: "kg" };
  if (text.includes("g")) return { qty: num, unit: "g" };
  if (text.includes("l")) return { qty: num, unit: "L" };
  if (text.includes("ml")) return { qty: num, unit: "ml" };

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
  const [page, setPage] = useState("lock");
  const [pin, setPin] = useState("");

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
    <div style={{ minHeight: "100vh", fontFamily: "Inter, Arial", background: "#f5f6fa" }}>

      {/* 🔒 PIN LOCK PAGE */}
      {page === "lock" && (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg,#4facfe,#6a11cb)"
        }}>
          <div style={{
            background: "white",
            padding: 40,
            borderRadius: 18,
            width: 360,
            textAlign: "center"
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
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ width: "100%", padding: 12, marginTop: 10 }}
            />
            <button
              onClick={() => pin === PIN_CODE ? setPage("app") : alert("Wrong PIN")}
              style={{
                marginTop: 20,
                width: "100%",
                padding: 12,
                background: "#6a11cb",
                color: "white",
                border: "none",
                borderRadius: 10
              }}
            >
              Unlock →
            </button>
          </div>
        </div>
      )}

      {/* 📊 MAIN APP */}
      {page === "app" && (
        <div style={{ padding: 20 }}>
          <h2>Guest House Stock Sheet</h2>

          <input
            style={{ width: "60%", padding: 10 }}
            placeholder="AI: add 2kg sugar 2025/01/01 opening"
            value={command}
            onChange={e => setCommand(e.target.value)}
          />
          <button onClick={runAI} style={{ marginLeft: 10 }}>🤖 Run</button>
          <button onClick={addRow} style={{ marginLeft: 10 }}>➕ Row</button>

          <table style={{ width: "100%", marginTop: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f3f6" }}>
                {["S.No","Item","Unit","Open Date","Open Qty","Out Date","Out Qty","In Date","In Qty","Out Date","Out Qty","Balance","❌"]
                  .map(h => (
                    <th key={h} style={{ border: "1px solid #999", padding: 8 }}>{h}</th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>{i + 1}</td>
                  <td style={{ border: "1px solid #ccc" }}>
                    <input value={r.item} onChange={e => {
                      const c = [...rows]; c[i].item = e.target.value; setRows(c);
                    }} />
                  </td>
                  <td style={{ border: "1px solid #ccc", fontWeight: "bold" }}>{r.unit}</td>

                  {["openDate","openQty","outDate1","outQty1","inDate","inQty","outDate2","outQty2"].map((k, idx) => (
                    <td key={k} style={{ border: "1px solid #ccc" }}>
                      <input
                        type={k.includes("Date") ? "date" : "text"}
                        value={r[k]}
                        onChange={e =>
                          k.includes("Qty")
                            ? updateQty(i, k, e.target.value)
                            : (() => {
                                const c = [...rows];
                                c[i][k] = e.target.value;
                                setRows(c);
                              })()
                        }
                      />
                    </td>
                  ))}

                  <td style={{ border: "1px solid #999", background: "#ffeaa7", fontWeight: "bold" }}>
                    {balanceQty(r)}
                  </td>

                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    <button onClick={() => deleteRow(i)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

