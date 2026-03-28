import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", username: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    const { fullName, email, username, password, confirmPassword } = form;
    setError("");
    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields."); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      const res = await register({ fullName, username, email, password });
      if (res.status === 200 || res.status === 201) navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName",        label: "Full Name",        type: "text",     placeholder: "John Santos" },
    { name: "email",           label: "Email Address",    type: "email",    placeholder: "john@email.com" },
    { name: "username",        label: "Username",         type: "text",     placeholder: "johnsantos" },
    { name: "password",        label: "Password",         type: "password", placeholder: "Min. 6 characters" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat password" },
  ];

  return (
    <div style={page}>
      <div style={panel}>
        <div style={brandBar}>
          <img src="/logo.png" alt="logo" style={brandIcon} />
          <span style={brandName}>Study Planner</span>
        </div>
        <h2 style={tagline}>Start your academic journey.</h2>
        <p style={taglineSub}>Create your account and take control of your studies.</p>
        <div style={decorLine} />
        <div style={steps}>
          {["Create account", "Set up profile", "Add your subjects", "Track your tasks"].map((s, i) => (
            <div key={i} style={step}>
              <div style={{ ...stepNum, background: i === 0 ? "var(--accent)" : "transparent", border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                {i + 1}
              </div>
              <span style={{ color: i === 0 ? "#fff" : "var(--text-sidebar)", fontSize: 13 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <ThemeToggle variant="corner" />
        </div>
      </div>

      <div style={formWrap} className="fade-in">
        <h1 style={formTitle}>Create your account</h1>
        <p style={formSub}>Fill in the details below to get started.</p>

        {error && <div style={errorBox}>{error}</div>}

        {fields.map(f => (
          <div key={f.name} style={field}>
            <label style={label}>{f.label}</label>
            <input
              id={`register-${f.name}`}
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              style={input}
              onChange={onChange}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
            />
          </div>
        ))}

        <button
          id="register-btn"
          style={loading ? btnDisabled : btn}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p style={footer}>
          Already have an account?{" "}
          <Link to="/login" style={footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const page: React.CSSProperties = { display: "flex", minHeight: "100vh" };

const panel: React.CSSProperties = {
  width: "420px", minWidth: "420px",
  background: "var(--sidebar)",
  display: "flex", flexDirection: "column",
  padding: "60px 48px", position: "relative",
};

const brandBar: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: "48px" };
const brandIcon: React.CSSProperties = { width: 36, height: 36, objectFit: "contain" as const, borderRadius: 6, flexShrink: 0 };
const brandName: React.CSSProperties = { color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" };
const tagline: React.CSSProperties = { color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 12 };
const taglineSub: React.CSSProperties = { color: "var(--text-sidebar)", fontSize: 14, lineHeight: 1.6 };
const decorLine: React.CSSProperties = { width: 40, height: 3, background: "var(--accent)", borderRadius: 2, margin: "32px 0" };

const steps: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 14 };
const step: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const stepNum: React.CSSProperties = {
  width: 24, height: 24, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
};

const formWrap: React.CSSProperties = {
  flex: 1, display: "flex", flexDirection: "column",
  justifyContent: "center", padding: "52px 64px",
  background: "var(--bg)", overflowY: "auto",
};

const formTitle: React.CSSProperties = { fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6 };
const formSub: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)", marginBottom: 28 };

const errorBox: React.CSSProperties = {
  background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)",
  color: "#f43f5e", padding: "10px 14px",
  borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 18,
};

const field: React.CSSProperties = { marginBottom: 14 };
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 };
const input: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "var(--bg-white)", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: 14,
  transition: "all 0.18s", boxSizing: "border-box",
};
const btn: React.CSSProperties = {
  width: "100%", padding: "12px",
  background: "var(--accent-grad)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff",
  fontSize: 14, fontWeight: 700,
  boxShadow: "0 4px 14px rgba(91,108,249,0.35)", marginTop: 10,
};
const btnDisabled: React.CSSProperties = { ...btn, opacity: 0.55, cursor: "not-allowed" };
const footer: React.CSSProperties = { textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" };
const footerLink: React.CSSProperties = { color: "var(--accent)", fontWeight: 600, textDecoration: "none" };
