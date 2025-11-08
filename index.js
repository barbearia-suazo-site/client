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
    image: null,
  });

  // Helper para base da API (sempre da env)
  const API = process.env.NEXT_PUBLIC_API_URL;

  // 🔐 Verificar token + role admin antes de carregar dados
  useEffect(() => {
    let intervalId;

    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/login");
          return;
        }

        // verifica token no backend
        const resp = await axios.get(`${API}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // precisa ser admin e estar na allowlist
        if (!resp.data?.valid || resp.data?.role !== "admin" || !resp.data?.isAdminAllowed) {
          alert("Acesso restrito: apenas administradores autorizados.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        await loadData(token);
        // polling leve para manter dados atualizados
        intervalId = setInterval(() => loadData(token), 10000);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao verificar credenciais:", err?.response?.data || err.message);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    init();
    return () => intervalId && clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 Carregar dados (vendas e produtos)
  const loadData = async (token) => {
    try {
      const [sales, prod] = await Promise.all([
        axios.get(`${API}/api/sales`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSalesData(sales.data || []);
      setProducts(prod.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err?.response?.data || err.message);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // ➕ Añadir nuevo producto (com upload)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // 1) se sua API tem rota /api/upload, envie a imagem primeiro e pegue o caminho
      let imagePath = null;
      if (newProduct.image) {
        const up = await axios.post(`${API}/api/upload`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        imagePath = up.data?.filePath || null;
      }

      // 2) cria o produto
      const payload = {
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        image: imagePath || newProduct.image?.name || "",
      };

      await axios.post(`${API}/api/products`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      const updated = await axios.get(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(updated.data || []);
      setNewProduct({ name: "", price: "", description: "", image: null });
    } catch (err) {
      console.error("Erro ao adicionar produto:", err?.response?.data || err.message);
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
      await axios.put(`${API}/api/products/${editingItem._id}`, editingItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData(token);
      setEditingItem(null);
    } catch (err) {
      console.error("Erro ao salvar edição:", err?.response?.data || err.message);
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
      await axios.delete(`${API}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData(token);
    } catch (err) {
      console.error("Erro ao deletar produto:", err?.response?.data || err.message);
      alert("Erro ao deletar o produto.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // 🔎 Buscar faturação por datas
  const handleSearchByDate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (!startDate || !endDate) return alert("Selecciona ambas fechas");

    try {
      const res = await axios.get(`${API}/api/sales?start=${startDate}&end=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredSales(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar por fechas:", err?.response?.data || err.message);
      alert("Erro al buscar facturación.");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  // 🖨️ Imprimir
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

  // 💰 Totais
  const totalMensual = salesData.reduce((acc, val) => acc + (val.total || 0), 0);
  const totalFiltrado = filteredSales.reduce((acc, val) => acc + (val.total || 0), 0);

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
        <form onSubmit={handleSearchByDate} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label>Desde:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label>Hasta:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button type="submit" style={blueButton}>Buscar</button>
        </form>

        {filteredSales.length > 0 && (
          <>
            <p><strong>Total del período:</strong> € {totalFiltrado.toFixed(2)}</p>
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
            <button onClick={handlePrint} style={{ ...blueButton, marginTop: 10 }}>
              🖨️ Imprimir Facturación Seleccionada
            </button>
          </>
        )}
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
                src={`${API}/uploads/${p.image}`}
                alt={p.name}
                width="100%"
                height="150"
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
              <h3>{p.name}</h3>
              <p><strong>€ {p.price}</strong></p>
              <p>{p.description}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <button style={blueButton} onClick={() => handleEdit(p)}>✏️ Editar</button>
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
          style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}
        >
          <input
            placeholder="Nome do produto"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Preço"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
          />
          <input
            placeholder="Descrição"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <input
            type="file"
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files?.[0] || null })}
          />
          <button type="submit" style={blueButton}>Adicionar Produto</button>
        </form>
      </section>

      {/* === MODAL DE EDIÇÃO === */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex",
            justifyContent: "center", alignItems: "center",
          }}
        >
          <div style={{ background: "white", padding: 20, borderRadius: 8, maxWidth: 400 }}>
            <h3>Editar Produto</h3>
            <input
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />
            <input
              type="number"
              value={editingItem.price}
              onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
            />
            <textarea
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            />
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button style={blueButton} onClick={handleSaveEdit}>Guardar</button>
              <button style={{ ...blueButton, backgroundColor: "gray" }} onClick={() => setEditingItem(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
