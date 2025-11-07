import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Recarrega o script do Instagram ao montar a página
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main style={{ padding: 0, margin: 0 }}>
      {/* === Hero com imagem de fundo === */}
      <section
        style={{
          position: "relative",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          backgroundImage: "url('/images/barber-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Capa semitransparente */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.55)",
            zIndex: 1,
          }}
        ></div>

        {/* Texto principal */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: "3rem", marginBottom: 20 }}>
            Bienvenido a Suazo Barber
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: 30,
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Estilo, precisión y atención personalizada. En Suazo Barber
            encontrarás un ambiente moderno y profesional.
          </p>
          <a
            href="/servicos"
            style={{
              backgroundColor: "#0066cc",
              padding: "12px 24px",
              borderRadius: 6,
              color: "white",
              fontWeight: "bold",
              textDecoration: "none",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#0055aa")}
            onMouseOut={(e) => (e.target.style.background = "#0066cc")}
          >
            💈 Marcar una cita
          </a>
        </div>
      </section>

      {/* === Feed de Instagram === */}
      <section
        style={{
          background: "#fff",
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: "30px",
            fontSize: "2rem",
            color: "#333",
            textAlign: "center",
          }}
        >
          🧔 Síguenos en Instagram
        </h2>

        <p style={{ marginBottom: "20px", color: "#555", textAlign: "center" }}>
          Mira nuestros últimos estilos y cortes en{" "}
          <a
            href="https://www.instagram.com/suazo_barber/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#0095f6", // Azul estilo Instagram
              color: "#fff",
              padding: "8px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#007acc")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#0095f6")}
          >
            @suazo_barber
          </a>
        </p>

        {/* Publicación real de Instagram embebida (perfil Suazo) */}
        <section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/suazo_barber/"
            data-instgrm-version="14"
            style={{
              background: "#fff",
              border: 0,
              margin: "0 auto",
              maxWidth: "540px",
              width: "100%",
              minWidth: "326px",
              padding: 0,
              display: "flex",
              justifyContent: "center",
            }}
          ></blockquote>
        </section>
      </section>

      {/* === Sección de ubicación === */}
      <section
        style={{
          textAlign: "center",
          padding: "60px 24px",
          background: "#f9f9f9",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Nuestra ubicación</h2>
        <p style={{ marginBottom: 16 }}>
          Visítanos en nuestro local en Barcelona:
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5986.913964178672!2d2.1401436848266018!3d41.385881122102255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a3f049b1ffb5%3A0xa70c96848064def3!2sSuazo%20Barber!5e0!3m2!1ses!2ses!4v1761577240401!5m2!1ses!2ses"
            width="800"
            height="250"
            style={{ border: 0, borderRadius: 12, maxWidth: 800 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </main>
  );
}
