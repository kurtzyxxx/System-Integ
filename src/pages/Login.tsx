import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // Remove old shared avatar key — each user loads their own via sp_avatar_{username}
        localStorage.removeItem("sp_avatar");
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={panel}>
        <div style={brandBar}>
          <img src="/logo.png" alt="logo" style={brandIcon} />
          <span style={brandName}>Study Planner</span>
        </div>
        <h2 style={tagline}>Plan smarter, study better.</h2>
        <p style={taglineSub}>Your all-in-one academic organizer.</p>
        <div style={decorLine} />
        <div style={decorDots}>
          {[...Array(4)].map((_, i) => <div key={i} style={decorDot} />)}
        </div>
        <div style={{ marginTop: 28 }}>
          <ThemeToggle variant="corner" />
        </div>
      </div>

      <div style={formWrap} className="fade-in">
        <h1 style={formTitle}>Welcome back</h1>
        <p style={formSub}>Sign in to your account to continue.</p>

        {error && <div style={errorBox}>{error}</div>}

        <div style={field}>
          <label style={label}>Email address</label>
          <input
            id="login-email"
            type="email"
            style={input}
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div style={field}>
          <label style={label}>Password</label>
          <input
            id="login-password"
            type="password"
            style={input}
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          id="login-btn"
          style={loading ? btnDisabled : btn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={footer}>
          Don't have an account?{" "}
          <Link to="/register" style={footerLink}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  display: "flex", minHeight: "100vh",
};

const panel: React.CSSProperties = {
  width: "420px", minWidth: "420px",
  background: "var(--sidebar)",
  display: "flex", flexDirection: "column",
  padding: "60px 48px",
  position: "relative", overflow: "hidden",
};

const brandBar: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, marginBottom: "60px",
};

const brandIcon: React.CSSProperties = {
  width: 36, height: 36, objectFit: "contain" as const, borderRadius: 6, flexShrink: 0,
};

const brandName: React.CSSProperties = {
  color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em",
};

const tagline: React.CSSProperties = {
  color: "#fff", fontSize: 32, fontWeight: 800,
  lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 14,
};

const taglineSub: React.CSSProperties = {
  color: "var(--text-sidebar)", fontSize: 15, lineHeight: 1.6,
};

const decorLine: React.CSSProperties = {
  width: 48, height: 3, background: "var(--accent)",
  borderRadius: 2, margin: "40px 0",
};

const decorDots: React.CSSProperties = {
  display: "flex", gap: 8, marginTop: "auto",
};

const decorDot: React.CSSProperties = {
  width: 8, height: 8, borderRadius: "50%",
  background: "rgba(255,255,255,0.15)",
};

const formWrap: React.CSSProperties = {
  flex: 1, display: "flex", flexDirection: "column",
  justifyContent: "center", padding: "60px 72px",
  background: "var(--bg)",
};

const formTitle: React.CSSProperties = {
  fontSize: 28, fontWeight: 800, color: "var(--text)",
  letterSpacing: "-0.02em", marginBottom: 6,
};

const formSub: React.CSSProperties = {
  fontSize: 14, color: "var(--text-muted)", marginBottom: 32,
};

const errorBox: React.CSSProperties = {
  background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)",
  color: "#f43f5e", padding: "10px 14px",
  borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 20,
};

const field: React.CSSProperties = { marginBottom: 18 };

const label: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "var(--text)", marginBottom: 7,
};

const input: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "var(--bg-white)", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)",
  fontSize: 14, transition: "all 0.18s", boxSizing: "border-box",
};

const btn: React.CSSProperties = {
  width: "100%", padding: "12px",
  background: "var(--accent-grad)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff",
  fontSize: 14, fontWeight: 700, letterSpacing: "0.01em",
  boxShadow: "0 4px 14px rgba(91,108,249,0.35)",
  marginTop: 8,
};

const btnDisabled: React.CSSProperties = {
  ...btn, opacity: 0.55, cursor: "not-allowed",
};

const footer: React.CSSProperties = {
  textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--text-muted)",
};

const footerLink: React.CSSProperties = {
  color: "var(--accent)", fontWeight: 600, textDecoration: "none",
};
