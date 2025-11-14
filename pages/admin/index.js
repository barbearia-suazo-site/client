// client/pages/admin/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminPanel() {
  const router = useRouter();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [products, setProducts] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: null, // File
  });

  // 🔐 Verifica token y perfil admin antes de cargar datos
  useEffect(() => {
    let intervalId;

    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const resp = await axios.get(`${API}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          !resp.data?.valid ||
          resp.data?.role !== "admin" ||
          !resp.data?.isAdminAllowed
        ) {
          alert("Acceso restringido: solo administradores autorizados.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        await loadData(token);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error al verificar credenciales:",
          err?.response?.data || err.message
        );
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    init();
    return () => intervalId && clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 Cargar ventas + productos
  const loadData = async (token) => {
    try {
      const [sales, prod] = await Promise.all([
        axios.get(`${API}/api/sales`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSalesData(sales.data || []);
      setProducts(prod.data || []);
    } catch (err) {
      console.error(
        "Error al cargar datos:",
        err?.response?.data || err.message
      );
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // ➕ Añadir nuevo producto (sube imagen y luego crea)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      let imageUrl = "";

      // 1) Subir imagen si existe
      if (newProduct.image) {
        const form = new FormData();
        // El backend espera el campo "file"
        form.append("file", newProduct.image);

        const up = await axios.post(`${API}/api/upload`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            // No fijar Content-Type aquí, axios lo hace automáticamente
          },
        });

        imageUrl = up?.data?.url || "";
      }

      // 2) Crear el producto (JSON simple)
      const payload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        description: newProduct.description,
        imageUrl, // campo usado en el backend
      };

      await axios.post(`${API}/api/products`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await loadData(token);
      setNewProduct({ name: "", price: "", description: "", image: null });
      alert("¡Producto añadido con éxito!");
    } catch (err) {
      console.error(
        "Error al añadir producto:",
        err?.response?.data || err.message
      );
      alert(
        "Error al añadir producto. Revisa los datos e inténtalo de nuevo."
      );
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // ✏️ Editar producto (abre modal)
  const handleEdit = (item) => setEditingItem(item);

  // 💾 Guardar edición
  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      await axios.put(`${API}/api/products/${editingItem._id}`, editingItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData(token);
      setEditingItem(null);
    } catch (err) {
      console.error(
        "Error al guardar edición:",
        err?.response?.data || err.message
      );
      alert("Error al guardar los cambios.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // 🗑️ Eliminar producto
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      await axios.delete(`${API}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData(token);
    } catch (err) {
      console.error(
        "Error al eliminar producto:",
        err?.response?.data || err.message
      );
      alert("Error al eliminar el producto.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // 🔎 Buscar facturación por fechas
  const handleSearchByDate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (!startDate || !endDate)
      return alert("Selecciona ambas fechas, por favor.");

    try {
      const res = await axios.get(
        `${API}/api/sales?start=${startDate}&end=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFilteredSales(res.data || []);
    } catch (err) {
      console.error(
        "Error al buscar por fechas:",
        err?.response?.data || err.message
      );
      alert("Error al buscar la facturación.");
    }
  };

  // 🖨️ Imprimir sección
  const handlePrint = () => {
    const el = document.getElementById("printable-section");
    if (!el) return;
    const w = window.open("", "", "width=800,height=600");
    w.document.write(el.innerHTML);
    w.document.close();
    w.print();
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Totales
  const totalMensual = salesData.reduce((acc, v) => acc + (v.total || 0), 0);
  const totalFiltrado = filteredSales.reduce(
    (acc, v) => acc + (v.total || 0),
    0
  );

  const blueButton = {
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  };

  if (loading) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        <p>Verificando credenciales de administrador...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>👋 Bienvenido al Panel Administrativo</h1>
        <button style={blueButton} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      {/* === FACTURACIÓN TOTAL === */}
      <section
        style={{
          marginTop: 30,
          background: "#f0f4ff",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2>📊 Facturación Total</h2>
        <p style={{ fontSize: 18, fontWeight: "bold", color: "#0070f3" }}>
          Total: € {totalMensual.toFixed(2)}
        </p>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData.map((s) => ({
                month: new Date(s.createdAt).toLocaleDateString(),
                totalSales: s.total,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSales" fill="#0070f3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* === FACTURACIÓN POR FECHAS === */}
      <section style={{ marginTop: 40 }} id="printable-section">
        <h2>📅 Facturación por Fechas</h2>
        <form
          onSubmit={handleSearchByDate}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label>Desde:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>Hasta:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button type="submit" style={blueButton}>
            Buscar
          </button>
        </form>

        {filteredSales.length > 0 && (
          <>
            <p>
              <strong>Total del período:</strong> € {totalFiltrado.toFixed(2)}
            </p>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredSales.map((s) => ({
                    date: new Date(s.createdAt).toLocaleDateString(),
                    totalSales: s.total,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalSales" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              onClick={handlePrint}
              style={{ ...blueButton, marginTop: 10 }}
            >
              🖨️ Imprimir facturación seleccionada
            </button>
          </>
        )}
      </section>

      {/* === AGENDA EN TIEMPO REAL === */}
      <section
        style={{
          marginTop: 50,
          background: "#fff7e6",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2>🗓️ Agenda en Tiempo Real</h2>
        <p style={{ color: "#555", marginBottom: 10 }}>
          Consulta la disponibilidad y reservas de cada barbero en tiempo real:
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <iframe
            src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FMadrid&mode=WEEK&src=c3Vhem9Ac3Vhem9iYXJiZXIuY29t&color=%23000000"
            style={{
              border: "0",
              width: "100%",
              maxWidth: "900px",
              height: "600px",
              borderRadius: "10px",
            }}
            frameBorder="0"
            scrolling="no"
          ></iframe>
        </div>
      </section>

      {/* === PRODUCTOS === */}
      <section style={{ marginTop: 40 }}>
        <h2>🧴 Productos</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((p) => {
            const img = p.imageUrl || p.image || "";
            const src = img
              ? img.startsWith("http")
                ? img
                : `${API}${img}`
              : "/fallback.png";

            return (
             <div
  key={p._id}
  style={{
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: 260,        // 👈 card mais compacto
    margin: "0 auto",     // 👈 centralizado quando só tem 1
  }}
>
  <img
    src={src}
    alt={p.name}
    style={{
      width: "100%",
      aspectRatio: "1 / 1", // 👈 quadrado
      objectFit: "cover",
      borderRadius: 8,
    }}
    onError={(e) => {
      e.currentTarget.src = "/fallback.png";
    }}
  />
                <h3>{p.name}</h3>
                <p>
                  <strong>€ {p.price}</strong>
                </p>
                <p>{p.description}</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <button style={blueButton} onClick={() => handleEdit(p)}>
                    ✏️ Editar
                  </button>
                  <button
                    style={{ ...blueButton, backgroundColor: "#e53e3e" }}
                    onClick={() => handleDelete(p._id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulario nuevo producto */}
        <form
          onSubmit={handleAddProduct}
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 400,
          }}
        >
          <input
            placeholder="Nombre del producto"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            required
          />
          <input
            placeholder="Descripción"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                image: e.target.files?.[0] || null,
              })
            }
          />
          <button type="submit" style={blueButton}>
            Añadir producto
          </button>
        </form>
      </section>

      {/* === MODAL DE EDICIÓN === */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3>Editar producto</h3>
            <input
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <input
              type="number"
              value={editingItem.price}
              onChange={(e) =>
                setEditingItem({ ...editingItem, price: e.target.value })
              }
            />
            <textarea
              value={editingItem.description}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  description: e.target.value,
                })
              }
            />
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button style={blueButton} onClick={handleSaveEdit}>
                Guardar
              </button>
              <button
                style={{ ...blueButton, backgroundColor: "gray" }}
                onClick={() => setEditingItem(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
