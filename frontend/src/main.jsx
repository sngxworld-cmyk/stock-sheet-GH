import React from "react";
import ReactDOM from "react-dom/client";
import { useState, useEffect } from "react";

function getUnit(item) {
  const countable = ["soap", "bottle", "chair", "bed", "packet"];
  const weight = ["rice", "sugar", "flour"];
  const liquid = ["oil", "milk", "water"];

  const name = item.toLowerCase();

  if (countable.some((x) => name.includes(x))) return "Nos";
  if (liquid.some((x) => name.includes(x))) return "L";
  if (weight.some((x) => name.includes(x))) return "Kg";

  return "";
}

function App() {
  const [rows, setRows] = useState([
    {
      date: "",
      item: "",
      open: 0,
      inQty: "",
      outQty: "",
      unit: "",
      close: 0,
      remarks: ""
    }
  ]);

  useEffect(() => {
    const updated = rows.map((r) => {
      const open = Number(r.open) || 0;
      const inQ = Number(r.inQty) || 0;
      const outQ = Number(r.outQty) || 0;

      return {
        ...r,
        unit: getUnit(r.item),
        close: open + inQ - outQ
      };
    });
    setRows(updated);
    // eslint-disable-next-line
  }, [rows.map(r => `${r.item}${r.inQty}${r.outQty}`).join()]);

  const updateRow = (i, key, value) => {
    const copy = [...rows];
    copy[i][key] = value;
    setRows(copy);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { date: "", item: "", open: 0, inQty: "", outQty: "", unit: "", close: 0, remarks: "" }
    ]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Guest House Stock Sheet</h2>

      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#eee" }}>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Item Name</th>
            <th>Opening</th>
            <th>In</th>
            <th>Out</th>
            <th>Unit</th>
            <th>Closing</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>

              <td>
                <input type="date" value={r.date}
                  onChange={(e) => updateRow(i, "date", e.target.value)} />
              </td>

              <td>
                <input value={r.item}
                  onChange={(e) => updateRow(i, "item", e.target.value)} />
              </td>

              <td>{r.open || ""}</td>

              <td>
                <input type="number" value={r.inQty}
                  onChange={(e) => updateRow(i, "inQty", e.target.value)} />
              </td>

              <td>
                <input type="number" value={r.outQty}
                  onChange={(e) => updateRow(i, "outQty", e.target.value)} />
              </td>

              <td>{r.unit}</td>
              <td>{r.close || ""}</td>

              <td>
                <input value={r.remarks}
                  onChange={(e) => updateRow(i, "remarks", e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <button onClick={addRow}>➕ Add Row</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

