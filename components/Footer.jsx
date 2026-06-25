import Head from 'next/head';

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
      {/* Estilos CSS injetados para animações complexas de barbearia */}
      <style jsx global>{`
        @keyframes barberPole {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        .barber-link {
          display: inline-block;
          text-decoration: none;
          color: #aaa;
          transition: all 0.3s ease;
          padding: 2px 6px;
          border-radius: 4px;
          position: relative;
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' style='font-size:16px'><text y='14'>✂️</text></svg>"), pointer;
        }
        .barber-link:hover {
          color: #fff !important;
          transform: skewX(-8deg) scale(1.05); /* Efeito inclinação tipo navalha */
          text-shadow: 1px 1px 2px #000;
          /* Efeito Barber Pole Clássico no fundo do texto */
          background-image: linear-gradient(
            45deg,
            #ff2a2a 25%, 
            #ffffff 25%, #ffffff 50%, 
            #2a75ff 50%, #2a75ff 75%, 
            #ffffff 75%, #ffffff
          );
          background-size: 40px 40px;
          animation: barberPole 1s linear infinite;
        }
      `}</style>

      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} Suazo Barber | Todos los derechos reservados.
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "0.85rem",
          color: "#aaa",
        }}
      >
        By:{" "}
        <a
          href="https://www.linkedin.com/in/sr-mendes/"
          target="_blank"
          rel="noopener noreferrer"
          className="barber-link"
        >
          <strong>Sr. Mendes</strong>
        </a>
      </p>
    </footer>
  );
}
