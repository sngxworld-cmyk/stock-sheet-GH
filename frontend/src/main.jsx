import React from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
  if (qty === "" || qty === null) return "";
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
  const [rows, setRows] = useState([
    {
      item: "",
      type: "",
      unit: "",
      openDate: "",
      openQty: "",
      inDate1: "",
      inQty1: "",
      outDate1: "",
      outQty1: "",
      inDate2: "",
      inQty2: "",
      outDate2: "",
      outQty2: "",
      close: "",
      remarks: ""
    }
  ]);

  const [command, setCommand] = useState("");

  /* ---------- FORMULA ENGINE ---------- */
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

  const update = (i, k, v) => {
    const copy = [...rows];
    copy[i][k] = v;
    setRows(copy);
  };

  /* ---------- AI ACTION ---------- */
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
      update(index, "inDate1", today);
      update(index, "inQty1", finalQty);
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

  const addRow = () => {
    setRows([...rows, {
      item: "", type: "", unit: "",
      openDate: "", openQty: "",
      inDate1: "", inQty1: "",
      outDate1: "", outQty1: "",
      inDate2: "", inQty2: "",
      outDate2: "", outQty2: "",
      close: "", remarks: ""
    }]);
  };

  const deleteRow = (i) => {
    setRows(rows.filter((_, index) => index !== i));
  };
  const exportExcel = () => {
  const data = rows.map((r, i) => ({
    "S.No": i + 1,
    "Item": r.item,
    "Unit": r.unit,
    "Opening Qty": formatQty(r.openQty, r.type),
    "In Qty": formatQty(r.inQty1, r.type),
    "Out Qty": formatQty(r.outQty1, r.type),
    "Closing": formatQty(r.close, r.type),
    "Remarks": r.remarks
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Sheet");
  XLSX.writeFile(wb, "Guest_House_Stock.xlsx");
};

const exportPDF = () => {
  const doc = new jsPDF();

  const tableData = rows.map((r, i) => ([
    i + 1,
    r.item,
    r.unit,
    formatQty(r.openQty, r.type),
    formatQty(r.inQty1, r.type),
    formatQty(r.outQty1, r.type),
    formatQty(r.close, r.type),
    r.remarks
  ]));

  doc.text("Guest House Stock Sheet", 14, 15);

  doc.autoTable({
    startY: 20,
    head: [[
      "S.No", "Item", "Unit",
      "Opening", "In", "Out",
      "Closing", "Remarks"
    ]],
    body: tableData
  });

  doc.save("Guest_House_Stock.pdf");
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

      {/* MANUAL TABLE */}
      <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#eee" }}>
          <tr>
            <th rowSpan="2">S.No</th>
            <th rowSpan="2">Item Name</th>
            <th rowSpan="2">Unit</th>
            <th colSpan="2">Opening</th>
            <th colSpan="2">In</th>
            <th colSpan="2">Out</th>
            <th colSpan="2">In</th>
            <th colSpan="2">Out</th>
            <th rowSpan="2">Closing</th>
            <th rowSpan="2">Remarks</th>
            <th rowSpan="2">Action</th>
          </tr>
          <tr>
            <th>Date</th><th>Qty</th>
            <th>Date</th><th>Qty</th>
            <th>Date</th><th>Qty</th>
            <th>Date</th><th>Qty</th>
            <th>Date</th><th>Qty</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>

              <td>
                <input value={r.item}
                  onChange={e => update(i,"item",e.target.value)} />
              </td>

              <td>{r.unit}</td>

              <td><input type="date" value={r.openDate}
                onChange={e => update(i,"openDate",e.target.value)} /></td>
              <td><input type="number" value={r.openQty}
                onChange={e => update(i,"openQty",e.target.value)} /></td>

              <td><input type="date" value={r.inDate1}
                onChange={e => update(i,"inDate1",e.target.value)} /></td>
              <td><input type="number" value={r.inQty1}
                onChange={e => update(i,"inQty1",e.target.value)} /></td>

              <td><input type="date" value={r.outDate1}
                onChange={e => update(i,"outDate1",e.target.value)} /></td>
              <td><input type="number" value={r.outQty1}
                onChange={e => update(i,"outQty1",e.target.value)} /></td>

              <td><input type="date" value={r.inDate2}
                onChange={e => update(i,"inDate2",e.target.value)} /></td>
              <td><input type="number" value={r.inQty2}
                onChange={e => update(i,"inQty2",e.target.value)} /></td>

              <td><input type="date" value={r.outDate2}
                onChange={e => update(i,"outDate2",e.target.value)} /></td>
              <td><input type="number" value={r.outQty2}
                onChange={e => update(i,"outQty2",e.target.value)} /></td>

              <td style={{ background: "#d4f7d4", fontWeight: "bold", textAlign: "center" }}>
                {formatQty(r.close, r.type)}
              </td>

              <td>
                <input value={r.remarks}
                  onChange={e => update(i,"remarks",e.target.value)} />
              </td>

              <td>
                <button onClick={() => deleteRow(i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <button onClick={addRow}>➕ Add Item</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);






