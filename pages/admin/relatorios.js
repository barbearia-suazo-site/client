import { useState } from "react";

export default function Reportes() {
  const [start, setStart] = useState("2025-10-01");
  const [end, setEnd] = useState("2025-10-25");
  const [data, setData] = useState(null);

  const fetchReport = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `/api/reports/balance?startDate=${start}&endDate=${end}`,
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );

    if (res.ok) {
      setData(await res.json());
    } else {
      const t = await res.json();
      alert(t.error || "Error al generar el informe");
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>📊 Informes / Balance</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>
          Desde:{" "}
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>

        <label>
          Hasta:{" "}
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>

        <button
          onClick={fetchReport}
          style={{
            marginLeft: 10,
            padding: "6px 12px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Generar informe
        </button>
      </div>

      {data && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <p>
            <strong>Total de ventas:</strong> € {data.totalSales}
          </p>
          <p>
            <strong>Pedidos:</strong> {data.ordersCount}
          </p>
          <p>
            <strong>Citas completadas:</strong> {data.appointmentsCount}
          </p>

          <h3 style={{ marginTop: 20 }}>Ventas por empleado:</h3>
          <pre
            style={{
              background: "#f4f4f4",
              padding: 10,
              borderRadius: 6,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(data.salesByEmployee, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
