import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.response?.data?.message || "Incorrect email or password. Please try again.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={page}>
      <div style={blob1} />
      <div style={blob2} />

      <div style={card} className="fade-in">
        <div style={logoWrap}>
          <img src="/logo.png" alt="Study Planner" style={logoImage} />
          <h1 style={logoText}>Study Planner</h1>
          <p style={logoSub}>Your academic companion</p>
        </div>

        <h2 style={heading}>Welcome back</h2>
        <p style={subheading}>Sign in to continue your study journey</p>

        {error && <div style={errorBox} className="scale-in">{error}</div>}

        <div className="stagger">
          <div style={fieldGroup} className="fade-in-up">
            <label style={labelStyle} htmlFor="login-email">Email</label>
            <input id="login-email" type="email" placeholder="yourname@email.com" style={inputStyle}
              value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} autoComplete="email" />
          </div>

          <div style={fieldGroup} className="fade-in-up">
            <label style={labelStyle} htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} autoComplete="current-password" />
              <button type="button" style={eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button id="login-btn" style={loading ? btnDisabled : btn} onClick={handleLogin} disabled={loading} className="fade-in-up">
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={spinner} /> Signing in...</span> : "Sign In"}
          </button>
        </div>

        <p style={footerText}>
          Don't have an account? <Link to="/register" style={linkStyle}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", position: "relative", overflow: "hidden", padding: 20 };
const blob1: React.CSSProperties = { position: "fixed", top: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.25) 0%, transparent 70%)", pointerEvents: "none" };
const blob2: React.CSSProperties = { position: "fixed", bottom: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,92,125,0.2) 0%, transparent 70%)", pointerEvents: "none" };

const card: React.CSSProperties = {
  width: "100%", maxWidth: 420, background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "40px 36px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,92,252,0.05)",
  position: "relative", zIndex: 1,
};

const logoWrap: React.CSSProperties = { textAlign: "center", marginBottom: 28 };
const logoImage: React.CSSProperties = {
  width: 72, height: 72, borderRadius: 16, objectFit: "contain",
  margin: "0 auto 10px", display: "block",
  animation: "float 3s ease-in-out infinite",
  filter: "drop-shadow(0 0 20px rgba(124,92,252,0.35))",
};
const logoText: React.CSSProperties = { fontFamily: "var(--font-alt)", fontSize: 22, fontWeight: 700, background: "var(--accent-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const logoSub: React.CSSProperties = { fontSize: 13, color: "var(--text-muted)", marginTop: 2 };

const heading: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 };
const subheading: React.CSSProperties = { fontSize: 14, color: "var(--text-dim)", marginBottom: 24 };

const errorBox: React.CSSProperties = { background: "rgba(252,92,125,0.1)", border: "1px solid rgba(252,92,125,0.3)", color: "#fc8fa3", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 18 };

const fieldGroup: React.CSSProperties = { marginBottom: 18 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-dim)", marginBottom: 7, letterSpacing: "0.02em" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: 14, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" };

const eyeBtn: React.CSSProperties = { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", padding: "4px 6px", fontWeight: 600 };

const btn: React.CSSProperties = { width: "100%", padding: 13, background: "var(--accent-grad)", border: "none", borderRadius: "var(--radius-sm)", color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", boxShadow: "var(--shadow-accent)", marginTop: 6 };
const btnDisabled: React.CSSProperties = { ...btn, opacity: 0.6, cursor: "not-allowed" };
const spinner: React.CSSProperties = { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" };

const footerText: React.CSSProperties = { textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--text-muted)" };
const linkStyle: React.CSSProperties = { color: "var(--accent)", fontWeight: 600, textDecoration: "none" };

export default Login;
