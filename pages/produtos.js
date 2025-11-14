// client/pages/produtos.js
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Productos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API}/api/products`);
        setProducts(res.data || []);
      } catch (e) {
        console.error("Error al cargar los productos:", e);
        setErr(
          "No pudimos cargar los productos. Inténtalo nuevamente en unos instantes."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const buildImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;          // Cloudinary u otra URL completa
    if (image.startsWith("/uploads")) return `${API}${image}`; // legado
    return `${API}/uploads/${image}`;
  };

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ textAlign: "center", marginTop: 50 }}>
          Cargando productos...
        </p>
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ textAlign: "center", color: "#b00020" }}>{err}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, background: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>
        Nuestros Productos
      </h1>

      {products.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          ⚠️ No hay productos disponibles en este momento.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {products.map((p) => {
            // 👇 usa imageUrl primero, y cae a image si es un producto antiguo
            const src = buildImageUrl(p.imageUrl || p.image);

            return (
              <article
  key={p._id}
  style={{
    padding: 16,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    maxWidth: 260,        // 👈 largura máxima do card
    margin: "0 auto",     // 👈 centraliza quando só tem 1
  }}
>
  {src ? (
    <img
      src={src}
      alt={p.name}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      style={{
        width: "100%",
        aspectRatio: "1 / 1",  // 👈 quadrado
        objectFit: "cover",
        borderRadius: 12,
        marginBottom: 12,
        background: "#fafafa",
      }}
    />
  ) : null}

                <h3 style={{ marginBottom: 6 }}>{p.name}</h3>
                {p.description ? (
                  <p
                    style={{
                      color: "#555",
                      fontSize: 14,
                      margin: "0 0 10px",
                    }}
                  >
                    {p.description}
                  </p>
                ) : null}

                <p style={{ marginTop: "auto", fontSize: 16 }}>
                  <strong>€ {p.price}</strong>
                </p>

                {typeof p.stock === "number" ? (
                  <p style={{ color: "#777", marginTop: 4 }}>
                    Stock: {p.stock}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
