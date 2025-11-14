// client/pages/login.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Solo estos correos pueden ir al /admin
const ADMIN_ALLOWLIST = new Set(["admin@suazo.com", "admin@hiago.com"]);

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // intentos fallidos guardados en localStorage
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    // si ya hay sesión, redirige por rol
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        // refuerzo en frontend: si role=admin pero email no está en allowlist, lo mandamos a /barber
        if (user?.role === "admin" && ADMIN_ALLOWLIST.has(user?.email)) {
          router.replace("/admin");
        } else if (user?.role === "barber") {
          router.replace("/barber");
        } else {
          router.replace("/");
        }
      }
    } catch {
      // ignora
    }

    const stored = Number(localStorage.getItem("login_attempts") || 0);
    setAttempts(stored);
  }, []);

  useEffect(() => {
    // si supera el límite, aviso + redirección a Home
    if (attempts >= MAX_ATTEMPTS) {
      const t = setTimeout(() => router.replace("/"), 3000);
      return () => clearTimeout(t);
    }
  }, [attempts, router]);

  const scaryNotice = attempts > 0 && attempts < MAX_ATTEMPTS;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (attempts >= MAX_ATTEMPTS) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data || {};
      if (!token || !user) throw new Error("Respuesta inválida del servidor");

      // guarda sesión
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email);
      localStorage.setItem("user", JSON.stringify(user));

      // limpia intentos fallidos
      localStorage.removeItem("login_attempts");

      // redirección con allowlist para admin
      if (user.role === "admin") {
        if (ADMIN_ALLOWLIST.has(user.email)) {
          router.push("/admin");
        } else {
          // si alguien intenta hacerse pasar por admin sin estar en la lista,
          // lo tratamos como barbero por seguridad
          router.push("/barber");
        }
      } else if (user.role === "barber") {
        router.push("/barber");
      } else {
        router.push("/");
      }
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      localStorage.setItem("login_attempts", String(next));

      if (next >= MAX_ATTEMPTS) {
        alert(
          "⚠️ Acceso bloqueado temporalmente por múltiples intentos fallidos. Serás redirigido a la página principal."
        );
      } else {
        alert(
          "❌ Credenciales incorrectas. Este intento ha sido registrado. Tu IP y tu agente de navegador pueden ser auditados."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(17,17,17,0.9), rgba(34,34,34,0.9)), url('/images/barber-bg.jpg') center/cover no-repeat",
        padding: "24px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 420,         // 👈 quadrado branco mais largo
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          padding: "32px 26px 26px",
          boxSizing: "border-box", // 👈 inputs não passam para fora
        }}
      >
        <h1
          style={{
            marginBottom: 6,
            fontSize: "1.8rem",
            color: "#111",
            textAlign: "center",
          }}
        >
          🔐 Iniciar sesión
        </h1>
        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#666",
            fontSize: ".95rem",
            marginBottom: 20,
          }}
        >
          Acceso exclusivo para personal autorizado.
        </p>

        {/* Aviso “asustador” si hay fallos */}
        {scaryNotice && (
          <div
            style={{
              background: "#fff4e5",
              border: "1px solid #ffd19b",
              color: "#7a3700",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 14,
              fontSize: ".9rem",
            }}
          >
            <strong>Advertencia:</strong> intento fallido registrado (
            {attempts}/{MAX_ATTEMPTS}). Accesos no autorizados serán
            investigados. La IP y el agente del navegador pueden ser
            auditados.
          </div>
        )}

        {attempts >= MAX_ATTEMPTS && (
          <div
            style={{
              background: "#fde8e8",
              border: "1px solid #f5b5b5",
              color: "#7a0000",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 14,
              fontSize: ".9rem",
            }}
          >
            <strong>Bloqueado temporalmente:</strong> demasiados intentos
            fallidos. Serás redirigido a la página principal.
          </div>
        )}

        <label
          htmlFor="email"
          style={{ display: "block", fontSize: ".9rem", color: "#333" }}
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={attempts >= MAX_ATTEMPTS}
          placeholder="tu@correo.com"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            marginTop: 6,
            marginBottom: 12,
            outline: "none",
            boxSizing: "border-box", // 👈 garante que cabe no card
          }}
        />

        <label
          htmlFor="password"
          style={{ display: "block", fontSize: ".9rem", color: "#333" }}
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={attempts >= MAX_ATTEMPTS}
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            marginTop: 6,
            marginBottom: 18,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={loading || attempts >= MAX_ATTEMPTS}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: loading || attempts >= MAX_ATTEMPTS ? "#bbb" : "#111",
            color: "#fff",
            fontWeight: 600,
            cursor:
              loading || attempts >= MAX_ATTEMPTS ? "not-allowed" : "pointer",
            transition: "transform .08s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {loading ? "Verificando..." : "Entrar"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: ".8rem",
            color: "#999",
            marginTop: 12,
          }}
        >
          Intentos: {attempts}/{MAX_ATTEMPTS}
        </p>
      </form>
    </main>
  );
}
