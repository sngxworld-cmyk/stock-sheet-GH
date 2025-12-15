import React, { useState } from "react";
import ReactDOM from "react-dom/client";

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

  const [rows, setRows] = useState([ { ...emptyRow } ]);

  /* =====================
     ROW FUNCTIONS
  ===================== */
  const addRow = () => setRows([...rows, { ...emptyRow }]);
  const deleteRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const update = (i, key, val) => {
    const copy = [...rows];
    copy[i][key] = val;
    setRows(copy);
  };

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

  /* =====================
     SIMPLE AI COMMAND
     format:
     add <item> <opening|in|out> <qty>
  ===================== */
  const runAI = () => {
    const parts = command.toLowerCase().split(" ");
    if (parts.length < 4) return alert("Invalid command");

    const item = parts[1];
    const type = parts[2];
    const qty = parts[3];

    let idx = rows.findIndex(r => r.item.toLowerCase() === item);
    if (idx === -1) {
      rows.push({ ...emptyRow, item });
      idx = rows.length - 1;
    }

    const copy = [...rows];

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

          {/* AI INPUT */}
          <div style={{ marginBottom: 15 }}>
            <input
              style={{ width: "60%" }}
              placeholder="AI command: add sugar opening 5"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
            <button onClick={runAI} style={{ marginLeft: 10 }}>
              🤖 Run
            </button>
          </div>

          <button onClick={addRow}>➕ Add Item</button>

          <table
            border="1"
            cellPadding="6"
            style={{
              marginTop: 15,
              borderCollapse: "collapse",
              width: "100%"
            }}
          >
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
              <tr style={{ background: "#f9f9f9" }}>
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

                  <td>
                    <input value={r.item}
                      onChange={e => update(i, "item", e.target.value)} />
                  </td>

                  <td>
                    <input value={r.unit}
                      onChange={e => update(i, "unit", e.target.value)} />
                  </td>

                  <td><input value={r.openDate}
                      onChange={e => update(i, "openDate", e.target.value)} /></td>
                  <td><input value={r.openQty}
                      onChange={e => update(i, "openQty", e.target.value)} /></td>

                  <td><input value={r.inDate}
                      onChange={e => update(i, "inDate", e.target.value)} /></td>
                  <td><input value={r.inQty}
                      onChange={e => update(i, "inQty", e.target.value)} /></td>

                  <td><input value={r.outDate}
                      onChange={e => update(i, "outDate", e.target.value)} /></td>
                  <td><input value={r.outQty}
                      onChange={e => update(i, "outQty", e.target.value)} /></td>

                  <td><input value={r.balDate}
                      onChange={e => update(i, "balDate", e.target.value)} /></td>

                  <td style={{
                    background: "#ffeaa7",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}>
                    {balanceQty(r)}
                  </td>

                  <td>
                    <button onClick={() => deleteRow(i)}>🗑</button>
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








