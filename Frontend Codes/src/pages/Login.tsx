import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={page}>
      {/* Decorative blobs */}
      <div style={blob1} />
      <div style={blob2} />

      <div style={card} className="fade-in">
        <div style={logoWrap}>
          <div style={logoIcon}>📚</div>
          <h1 style={logoText}>Study Planner</h1>
          <p style={logoSub}>Your academic companion</p>
        </div>

        <h2 style={heading}>Welcome back! 👋</h2>
        <p style={subheading}>Sign in to continue your study journey</p>

        {error && <div style={errorBox}>{error}</div>}

        <div style={fieldGroup}>
          <label style={labelStyle}>Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="yourname@email.com"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          id="login-btn"
          style={loading ? btnDisabled : btn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <p style={footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={linkStyle}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
  position: "relative",
  overflow: "hidden",
  padding: "20px",
};

const blob1: React.CSSProperties = {
  position: "fixed",
  top: "-120px",
  left: "-120px",
  width: "400px",
  height: "400px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,92,252,0.25) 0%, transparent 70%)",
  pointerEvents: "none",
};

const blob2: React.CSSProperties = {
  position: "fixed",
  bottom: "-100px",
  right: "-100px",
  width: "350px",
  height: "350px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(252,92,125,0.2) 0%, transparent 70%)",
  pointerEvents: "none",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "40px 36px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  position: "relative",
  zIndex: 1,
};

const logoWrap: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "28px",
};

const logoIcon: React.CSSProperties = {
  fontSize: "40px",
  display: "block",
  marginBottom: "8px",
  animation: "float 3s ease-in-out infinite",
};

const logoText: React.CSSProperties = {
  fontFamily: "var(--font-alt)",
  fontSize: "22px",
  fontWeight: "700",
  background: "var(--accent-grad)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const logoSub: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--text-muted)",
  marginTop: "2px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "var(--text)",
  marginBottom: "6px",
};

const subheading: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--text-dim)",
  marginBottom: "24px",
};

const errorBox: React.CSSProperties = {
  background: "rgba(252,92,125,0.1)",
  border: "1px solid rgba(252,92,125,0.3)",
  color: "#fc8fa3",
  padding: "10px 14px",
  borderRadius: "var(--radius-sm)",
  fontSize: "13px",
  marginBottom: "18px",
};

const fieldGroup: React.CSSProperties = { marginBottom: "18px" };

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-dim)",
  marginBottom: "7px",
  letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text)",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  background: "var(--accent-grad)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
  letterSpacing: "0.02em",
  boxShadow: "var(--shadow-accent)",
  transition: "opacity 0.2s, transform 0.2s",
  marginTop: "6px",
};

const btnDisabled: React.CSSProperties = {
  ...btn,
  opacity: 0.6,
  cursor: "not-allowed",
};

const footerText: React.CSSProperties = {
  textAlign: "center",
  marginTop: "22px",
  fontSize: "13px",
  color: "var(--text-muted)",
};

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: "600",
  textDecoration: "none",
};

export default Login;
