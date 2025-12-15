import React from "react";
import ReactDOM from "react-dom/client";
import { useState, useEffect } from "react";

/* ---------- ITEM LOGIC ---------- */
const COUNTABLE = ["soap", "bed", "chair", "packet", "bottle", "plate"];
const WEIGHT = ["rice", "sugar", "flour", "dal"];
const LIQUID = ["oil", "milk", "water"];

function getItemType(item) {
  const name = item.toLowerCase();
  if (COUNTABLE.some(x => name.includes(x))) return "count";
  if (LIQUID.some(x => name.includes(x))) return "liquid";
  if (WEIGHT.some(x => name.includes(x))) return "weight";
  return "";
}

function getUnit(type) {
  if (type === "count") return "Nos";
  if (type === "weight") return "g / kg";
  if (type === "liquid") return "ml / L";
  return "";
}

function formatQty(qty, type) {
  if (!qty) return "";
  if (type === "count") return qty;
  if (type === "weight") return qty >= 1000 ? (qty / 1000) + " kg" : qty + " g";
  if (type === "liquid") return qty >= 1000 ? (qty / 1000) + " L" : qty + " ml";
  return qty;
}

/* ---------- AI PARSER ---------- */
function parseCommand(text) {
  text = text.toLowerCase();

  const qtyMatch = text.match(/(\d+(\.\d+)?)/);
  const qty = qtyMatch ? Number(qtyMatch[1]) : 1;

  let unit = "";
  if (text.includes("kg")) unit = "kg";
  else if (text.includes("g")) unit = "g";
  else if (text.includes("ml")) unit = "ml";
  else if (text.includes("l")) unit = "l";

  const words = text.split(" ");
  const item = words[words.length - 1];

  return { qty, unit, item };
}

/* ---------- APP ---------- */
function App() {
  const [rows, setRows] = useState([]);
  const [command, setCommand] = useState("");

  useEffect(() => {
    const updated = rows.map(r => {
      const type = getItemType(r.item);
      const open = Number(r.openQty) || 0;
      const in1 = Number(r.inQty1) || 0;
      const in2 = Number(r.inQty2) || 0;
      const out1 = Number(r.outQty1) || 0;
      const out2 = Number(r.outQty2) || 0;

      return {
        ...r,
        type,
        unit: getUnit(type),
        close: open + in1 + in2 - out1 - out2 || ""
      };
    });
    setRows(updated);
    // eslint-disable-next-line
  }, [rows.map(r => JSON.stringify(r)).join()]);

  const runCommand = () => {
    if (!command) return;

    const { qty, unit, item } = parseCommand(command);
    const type = getItemType(item);

    let finalQty = qty;
    if (unit === "kg") finalQty = qty * 1000;
    if (unit === "l") finalQty = qty * 1000;

    const today = new Date().toISOString().split("T")[0];

    const index = rows.findIndex(r => r.item === item);

    if (index >= 0) {
      const copy = [...rows];
      copy[index].inDate1 = today;
      copy[index].inQty1 = finalQty;
      setRows(copy);
    } else {
      setRows([...rows, {
        item,
        type,
        unit: getUnit(type),
        openDate: "",
        openQty: "",
        inDate1: today,
        inQty1: finalQty,
        outDate1: "",
        outQty1: "",
        inDate2: "",
        inQty2: "",
        outDate2: "",
        outQty2: "",
        close: "",
        remarks: "Added via AI"
      }]);
    }

    setCommand("");
  };

  const deleteRow = (i) => {
    setRows(rows.filter((_, index) => index !== i));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Guest House Stock Sheet</h2>

      {/* AI BOT */}
      <div style={{ marginBottom: 15 }}>
        <input
          style={{ width: "70%" }}
          placeholder="AI command (eg: add 2kg sugar today)"
          value={command}
          onChange={e => setCommand(e.target.value)}
        />
        <button onClick={runCommand}>🤖 Run</button>
      </div>

      <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#eee" }}>
          <tr>
            <th>S.No</th>
            <th>Item</th>
            <th>Unit</th>
            <th>Opening Qty</th>
            <th>In Qty</th>
            <th>Out Qty</th>
            <th>Closing</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.item}</td>
              <td>{r.unit}</td>
              <td>{formatQty(r.openQty, r.type)}</td>
              <td>{formatQty(r.inQty1, r.type)}</td>
              <td>{formatQty(r.outQty1, r.type)}</td>
              <td style={{ background: "#d4f7d4", fontWeight: "bold" }}>
                {formatQty(r.close, r.type)}
              </td>
              <td>
                <button onClick={() => deleteRow(i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);





