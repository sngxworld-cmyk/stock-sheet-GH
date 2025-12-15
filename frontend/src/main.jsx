import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [showApp, setShowApp] = useState(false);

  const [rows, setRows] = useState([
    {
      item: "",
      unit: "",
      d1_open: "",
      d1_in: "",
      d1_out: "",
      d2_open: "",
      d2_in: "",
      d2_out: "",
      d3_open: "",
      d3_in: "",
      d3_out: "",
      d4_open: "",
      d4_in: "",
      d4_out: ""
    }
  ]);

  const addRow = () => {
    setRows([...rows, { ...rows[0], item: "", unit: "" }]);
  };

  const deleteRow = (i) => {
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const update = (i, key, val) => {
    const copy = [...rows];
    copy[i][key] = val;
    setRows(copy);
  };

  const closing = (r) => {
    const totalIn =
      (+r.d1_in || 0) + (+r.d2_in || 0) + (+r.d3_in || 0) + (+r.d4_in || 0);
    const totalOut =
      (+r.d1_out || 0) + (+r.d2_out || 0) + (+r.d3_out || 0) + (+r.d4_out || 0);
    const opening = +r.d1_open || 0;
    return opening + totalIn - totalOut;
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      {!showApp ? (
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h1>🏨 Guest House Stock Manager</h1>
          <button onClick={() => setShowApp(true)}>Open App</button>
        </div>
      ) : (
        <>
          <h2>Guest House Stock Sheet</h2>

          <button onClick={addRow}>➕ Add Item</button>

          <table border="1" cellPadding="5" style={{ marginTop: 15 }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item</th>
                <th>Unit</th>

                <th colSpan="3">Date 1</th>
                <th colSpan="3">Date 2</th>
                <th colSpan="3">Date 3</th>
                <th colSpan="3">Date 4</th>

                <th>Closing</th>
                <th>❌</th>
              </tr>
              <tr>
                <th></th><th></th><th></th>
                {Array(4).fill(0).map((_, i) => (
                  <React.Fragment key={i}>
                    <th>Open</th>
                    <th>In</th>
                    <th>Out</th>
                  </React.Fragment>
                ))}
                <th></th><th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input value={r.item} onChange={e => update(i, "item", e.target.value)} />
                  </td>
                  <td>
                    <input value={r.unit} onChange={e => update(i, "unit", e.target.value)} />
                  </td>

                  {["d1", "d2", "d3", "d4"].map(d => (
                    <React.Fragment key={d}>
                      <td><input onChange={e => update(i, `${d}_open`, e.target.value)} /></td>
                      <td><input onChange={e => update(i, `${d}_in`, e.target.value)} /></td>
                      <td><input onChange={e => update(i, `${d}_out`, e.target.value)} /></td>
                    </React.Fragment>
                  ))}

                  <td style={{ background: "#ffeaa7", fontWeight: "bold" }}>
                    {closing(r)}
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








