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

export default function AdminPanel() {
  const router = useRouter();

  const [loading, setLoading] = useState(true); // novo: enquanto verifica admin
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
    image: null,
  });

  // 🔐 Verificar token + role admin antes de carregar dados
  useEffect(() => {
    let intervalId;

    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // chama endpoint que verifica o token e retorna role (backend precisa ter /api/auth/verify)
        const resp = await axios.get("http://localhost:5000/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // se não for admin, limpa token e redireciona para home
        if (!resp.data || resp.data.role !== "admin") {
          alert("Acesso restrito: apenas administradores podem entrar aqui.");
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        // ok — carrega dados e começa o polling
        await loadData(token);
        intervalId = setInterval(() => loadData(token), 10000);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao verificar credenciais:", err);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 Carregar dados (vendas e produtos)
  const loadData = async (token) => {
    try {
      const [sales, prod] = await Promise.all([
        axios.get("http://localhost:5000/api/sales", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSalesData(sales.data);
      setProducts(prod.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      // Se token inválido/expirado, remove e redireciona
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // ➕ Añadir nuevo producto
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(updated.data);
      setNewProduct({ name: "", price: "", description: "", image: null });
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
      alert("Erro ao adicionar produto. Verifique os dados e tente novamente.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // ✏️ Editar produto
  const handleEdit = (item) => setEditingItem(item);

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingItem._id}`,
        editingItem,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      loadData(token);
      setEditingItem(null);
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      alert("Erro ao salvar cambios.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // 🗑️ Eliminar produto
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData(token);
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
      alert("Erro ao deletar o produto.");
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
    if (!startDate || !endDate) return alert("Selecciona ambas fechas");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/sales?start=${startDate}&end=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFilteredSales(res.data);
    } catch (err) {
      console.error("Erro ao buscar por fechas:", err);
      alert("Erro al buscar facturación.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // 🖨️ Imprimir facturación
  const handlePrint = () => {
    const printContents = document.getElementById("printable-section").innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(printContents);
    printWindow.document.close();
    printWindow.print();
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 💰 Totais
  const totalMensual = salesData.reduce((acc, val) => acc + (val.total || 0), 0);
  const totalFiltrado = filteredSales.reduce(
    (acc, val) => acc + (val.total || 0),
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
        <p>Verificando credenciais de administrador...</p>
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
        <p
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#0070f3",
          }}
        >
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
          style={{ display: "flex", gap: 10, alignItems: "center" }}
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
              🖨️ Imprimir Facturación Seleccionada
            </button>
          </>
        )}
      </section>

      {/* === 🗓️ AGENDA EN TIEMPO REAL === */}
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
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                background: "#fff",
                padding: 15,
                borderRadius: 10,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.name}
                width="100%"
                height="150"
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
              <h3>{p.name}</h3>
              <p>
                <strong>€ {p.price}</strong>
              </p>
              <p>{p.description}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <button style={blueButton} onClick={() => handleEdit(p)}>
                  ✏️ Editar
                </button>
                <button
                  style={{ ...blueButton, backgroundColor: "#e53e3e" }}
                  onClick={() => handleDelete(p._id)}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário novo produto */}
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
            placeholder="Nome do produto"
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Preço"
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            required
          />
          <input
            placeholder="Descrição"
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
          <input
            type="file"
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.files[0] })
            }
          />
          <button type="submit" style={blueButton}>
            Adicionar Produto
          </button>
        </form>
      </section>

      {/* === MODAL DE EDIÇÃO === */}
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
            }}
          >
            <h3>Editar Produto</h3>
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
                setEditingItem({ ...editingItem, description: e.target.value })
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
