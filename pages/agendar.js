import { useState } from "react";

export default function Reservar() {
  const [selectedBarber, setSelectedBarber] = useState("suazo");

  // Lista de barberos (ambos activos)
  const barberos = [
    {
      id: "suazo",
      nombre: "Suazo",
      descripcion: "Especialista en cortes modernos y atención personalizada.",
      foto: "/images/suazo.jpg",
      calendario:
        "https://calendar.google.com/calendar/embed?src=c_6f15a4c08bbf8ef789060b0ea471a75c7bdaf1fbe6f5dcffa1beb86a68ca9942%40group.calendar.google.com&ctz=Europe%2FMadrid",
      activo: true,
    },
  ];

  const selected = barberos.find((b) => b.id === selectedBarber);

  return (
    <main
      style={{
        padding: "50px 24px",
        background: "#f7f7f7",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* === Título === */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          color: "#222",
          marginBottom: "40px",
        }}
      >
        💈 Reserva tu cita
      </h1>

      {/* === Lista de barberos === */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "60px",
        }}
      >
        {barberos.map((b) => (
          <div
            key={b.id}
            style={{
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              width: "260px",
              textAlign: "center",
              padding: "20px",
              transition: "transform 0.2s ease, box-shadow 0.3s ease",
              opacity: b.activo ? 1 : 0.6,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <img
              src={b.foto}
              alt={b.nombre}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "15px",
                border: "3px solid #007bff",
              }}
            />
            <h3 style={{ color: "#333", marginBottom: "8px" }}>{b.nombre}</h3>
            <p
              style={{
                color: "#555",
                fontSize: "0.9rem",
                minHeight: "40px",
                marginBottom: "12px",
              }}
            >
              {b.descripcion}
            </p>

            <button
              onClick={() => setSelectedBarber(b.id)}
              style={{
                background: selectedBarber === b.id ? "#28a745" : "#007bff",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background =
                  selectedBarber === b.id ? "#218838" : "#0056b3")
              }
              onMouseLeave={(e) =>
                (e.target.style.background =
                  selectedBarber === b.id ? "#28a745" : "#007bff")
              }
            >
              {selectedBarber === b.id ? "Seleccionado ✅" : "Ver servicios"}
            </button>
          </div>
        ))}
      </section>

      {/* === Calendario do barbeiro selecionado === */}
      {selected && selected.activo && (
        <section
          style={{
            textAlign: "center",
            background: "#fff",
            padding: "40px 20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "950px",
            margin: "0 auto",
          }}
        >
          <h2 style={{ color: "#222", marginBottom: "20px" }}>
            📆 Agenda de {selected.nombre}
          </h2>
          <p style={{ color: "#555", marginBottom: "20px" }}>
            Consulta la disponibilidad y agenda tu cita fácilmente.
          </p>

          <iframe
            src={`${selected.calendario}&mode=WEEK&showDate=1&showNav=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`}
            style={{
              border: "0",
              width: "100%",
              height: "650px",
              borderRadius: "10px",
              filter: "contrast(1.05) brightness(0.98)",
            }}
            frameBorder="0"
            scrolling="no"
            title={`Calendario de ${selected.nombre}`}
          ></iframe>

          <p
            style={{
              color: "#777",
              fontSize: "0.9rem",
              marginTop: "10px",
              fontStyle: "italic",
            }}
          >
            🕒 Horario de atención: Lunes a Viernes 10:00–20:00 | Sábado 11:00–19:00
          </p>
        </section>
      )}
    </main>
  );
}
