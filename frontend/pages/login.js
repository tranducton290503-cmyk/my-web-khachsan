import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        router.push("/dashboard");
      } else {
        setError(data.message || "Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decor - Tạo các vòng tròn mờ ảo phía sau */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>

      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.header}>
          <div style={styles.logo}>🏨</div>
          <h2 style={styles.title}>Grand Hotel</h2>
          <p style={styles.subtitle}>Hệ thống quản lý lưu trú thông minh</p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="name@hotel.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: loading ? "#94a3b8" : "#2563eb",
            transform: loading ? "none" : "scale(1)",
          }}
        >
          {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
        </button>

        {error && <div style={styles.errorBox}>{error}</div>}

        <p style={styles.footerText}>
          Quên mật khẩu? Liên hệ <span style={{ color: "#2563eb", cursor: "pointer" }}>Admin</span>
        </p>
      </form>
    </div>
  );
}

// --- HỆ THỐNG STYLES SIÊU ĐẸP ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "rgba(37, 99, 235, 0.1)",
    borderRadius: "50%",
    top: "-100px",
    right: "-100px",
    zIndex: 0,
  },
  circle2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(37, 99, 235, 0.05)",
    borderRadius: "50%",
    bottom: "-50px",
    left: "-50px",
    zIndex: 0,
  },
  form: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    zIndex: 1,
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "8px",
    marginLeft: "4px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    transition: "all 0.2s ease",
    outline: "none",
    boxSizing: "border-box",
    "&:focus": {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.1)",
    },
  },
  button: {
    width: "100%",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
  },
  errorBox: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginTop: "20px",
    textAlign: "center",
    border: "1px solid #fee2e2",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "24px",
  },
};
