export default function Footer() {
  return (
    <footer
      style={{
        background: "#111",
        color: "#fff",
        textAlign: "center",
        padding: "20px 10px",
        fontSize: "0.95rem",
        lineHeight: "1.6",
        borderTop: "2px solid #333",
      }}
    >
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} Suazo Barber | Todos los derechos reservados.
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "0.85rem",
          color: "#aaa",
          transition: "color 0.3s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.target.style.color = "#d4af37")}
        onMouseLeave={(e) => (e.target.style.color = "#aaa")}
      >
        By: <strong>Sr. Mendes</strong>
      </p>
    </footer>
  );
}
