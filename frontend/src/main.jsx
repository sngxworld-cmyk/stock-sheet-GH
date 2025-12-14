import React from "react";
import ReactDOM from "react-dom/client";
import { useState, useEffect } from "react";

function getUnit(item) {
  const countable = ["soap", "bed", "chair", "packet", "bottle"];
  const weight = ["rice", "sugar", "flour"];
  const liquid = ["oil", "milk", "water"];

  const name = item.toLowerCase();

  if (countable.some(x => name.includes(x))) return "Nos";
  if (liquid.some(x => name.includes(x))) return "L";
  if (weight.some(x => name.includes(x))) return "Kg";
  return "";
}

function App() {
  const [rows, setRows] = useState([
    {
      item: "",
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

  useEffect(() => {
    const updated = rows.map(r => {
      const open = Number(r.openQty) || 0;
      const in1 = Number(r.inQty1) || 0;
      const in2 = Number(r.inQty2) || 0;
      const out1 = Number(r.outQty1) || 0;
      const out2 = Number(r.outQty2) || 0;

      return {
        ...r,
        unit: getUnit(r.item),
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

  const addRow = () => {
    setRows([...rows, {
      item: "", unit: "", openDate: "", openQty: "",
      inDate1: "", inQty1: "", outDate1: "", outQty1: "",
      inDate2: "", inQty2: "", outDate2: "", outQty2: "",
      close: "", remarks: ""
    }]);
  };

  const deleteRow = (i) => {
    setRows(rows.filter((_, index) => index !== i));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Guest House Stock Sheet</h2>

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
                {r.close}
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



