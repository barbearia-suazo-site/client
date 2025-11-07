// client/pages/servicios.js
import { useState } from "react";

export default function Servicios() {
  const [loading] = useState(false);

  // --- Lista de serviços com links já inseridos ---
  // Se quiser trocar os links, edite a propriedade `link` abaixo
  const servicios = [
    {
      nombre: "Corte clásico (sin degradado)",
      descripcion:
        "Corte tradicional con tijeras y máquina, con un acabado limpio y profesional.",
      precio: 15,
      duracion: 30,
      link: "https://calendar.app.google/HMhGdCRaXdMNjCCf9"
    },
    {
      nombre: "Corte y barba",
      descripcion: "Corte de cabello y arreglo completo de barba.",
      precio: 25,
      duracion: 45,
      link: "https://calendar.app.google/uEZNLkeRfBgPKrDy7"
    },
    {
      nombre: "Corte Fade (degradado)",
      descripcion:
        "Corte moderno con degradado suave y líneas precisas.",
      precio: 17,
      duracion: 30,
      link: "https://calendar.app.google/weAYrtqKqzKWxU8j8"
    },
    {
      nombre: "Corte, lavado y peinado (Hombre)",
      descripcion:
        "Corte completo con lavado, secado y peinado con producto de acabado.",
      precio: 20,
      duracion: 40,
      link: "https://calendar.app.google/gmi2zWDcZT1YLYNm6"
    },
    {
      nombre: "Barba",
      descripcion: "Arreglo de barba y acabado definido.",
      precio: 10,
      duracion: 20,
      link: "https://calendar.app.google/N62zCkiLCovv4dEu8"
    },
    {
      nombre: "Niños",
      descripcion:
        "Corte especial para niños hasta 12 años, con paciencia y estilo.",
      precio: 15,
      duracion: 30,
      link: "https://calendar.app.google/une16oY5taqxddMg8"
    },
    {
      nombre: "Jubilados",
      descripcion:
        "Corte clásico para hombres mayores con descuento especial.",
      precio: 13,
      duracion: 30,
      link: "https://calendar.app.google/MtkahktmAKnvrLvD8"
    },
    {
      nombre: "Mascarilla facial",
      descripcion:
        "Tratamiento facial purificante para revitalizar la piel.",
      precio: 10,
      duracion: 15,
      link: "https://calendar.app.google/AcGL8wgtzbgP3hwh8"
    },
    {
      nombre: "Coloración",
      descripcion:
        "Tinte completo o parcial para cabello o barba.",
      precio: 50,
      duracion: 60,
      link: "https://calendar.app.google/ffPjbmRC7mwc9gbRA"
    },
    {
      nombre: "Servicio VIP con Suazo",
      descripcion:
        "Atención exclusiva y personalizada por Suazo, con detalles premium.",
      precio: 30,
      duracion: 60,
      link: "https://calendar.app.google/GPTF2UdUpFYcKdUr7"
    },
  ];

  // Handler del botón: abre link si existe, si no redirige internamente a /agendar
  const onReservarClick = (servicio) => {
    if (servicio.link) {
      // Abre el enlace en una nueva pestaña sin prompts ni confirmaciones
      window.open(servicio.link, "_blank", "noopener,noreferrer");
    } else {
      // Si prefieres abrir en nueva pestaña: window.open('/agendar', '_blank')
      window.location.href = "/agendar";
    }
  };

  return (
    <main
      style={{
        padding: "40px 24px",
        background: "#f7f7f7",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: 32,
          fontSize: 32,
          color: "#333",
        }}
      >
        💈 Nuestros Servicios
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {servicios.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              padding: 20,
              textAlign: "center",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 3px 10px rgba(0,0,0,0.1)")
            }
          >
            <h3 style={{ marginBottom: 8, color: "#222" }}>{s.nombre}</h3>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 12 }}>
              {s.descripcion}
            </p>
            <p style={{ margin: "6px 0", fontWeight: "bold", fontSize: 16 }}>
              💶 {s.precio} €
            </p>
            <p style={{ color: "#777", fontSize: 14 }}>⏱ {s.duracion} min</p>

            <button
              onClick={() => onReservarClick(s)}
              style={{
                marginTop: 12,
                background: loading ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.2s ease",
              }}
              disabled={loading}
              onMouseEnter={(e) =>
                (e.target.style.background = loading ? "#ccc" : "#0056b3")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = loading ? "#ccc" : "#007bff")
              }
            >
              {loading ? "Procesando..." : "Reservar cita"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
