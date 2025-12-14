import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";

const HEADERS = [
  "S.No",
  "Date",
  "Item Name",
  "Quantity",
  "Unit",
  "Remarks"
];

function App() {
  const [rows, setRows] = useState([
    { date: "", item: "", qty: "", unit: "", remarks: "" }
  ]);

  const addRow = () => {
    setRows([...rows, { date: "", item: "", qty: "", unit: "", remarks: "" }]);
  };

  const updateRow = (index, key, value) => {
    const updated = [...rows];
    updated[index][key] = value;
    setRows(updated);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Guest House Stock Sheet</h2>

      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ background: "#eee" }}>
          <tr>
            {HEADERS.map((h) => (
              <th key={h}>{h}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{i + 1}</td>

              <td>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => updateRow(i, "date", e.target.value)}
                />
              </td>

              <td>
                <input
                  value={row.item}
                  onChange={(e) => updateRow(i, "item", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) => updateRow(i, "qty", e.target.value)}
                />
              </td>

              <td>
                <input
                  value={row.unit}
                  onChange={(e) => updateRow(i, "unit", e.target.value)}
                />
              </td>

              <td>
                <input
                  value={row.remarks}
                  onChange={(e) => updateRow(i, "remarks", e.target.value)}
                />
              </td>

              <td>
                <button onClick={() => deleteRow(i)}>❌</button>
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

