import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { fullName, email, username, password, confirmPassword } = formData;
    setError("");
    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields"); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      const res = await register({ fullName, username, email, password });
      if (res.status === 200 || res.status === 201) {
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName",        placeholder: "John Santos",           label: "Full Name",        type: "text" },
    { name: "email",           placeholder: "john@email.com",        label: "Email Address",    type: "email" },
    { name: "username",        placeholder: "johnsantos",            label: "Username",         type: "text" },
    { name: "password",        placeholder: "Min. 6 characters",     label: "Password",         type: "password" },
    { name: "confirmPassword", placeholder: "Repeat your password",  label: "Confirm Password", type: "password" },
  ];

  return (
    <div style={page}>
      <div style={blob1} />
      <div style={blob2} />

      <div style={card} className="fade-in">
        <div style={logoWrap}>
          <div style={logoIcon}>🎓</div>
          <h1 style={logoText}>Study Planner</h1>
          <p style={logoSub}>Join thousands of students</p>
        </div>

        <h2 style={heading}>Create your account ✨</h2>
        <p style={subheading}>Start organizing your academic life today</p>

        {error && <div style={errorBox}>{error}</div>}

        {fields.map((f) => (
          <div key={f.name} style={fieldGroup}>
            <label style={labelStyle}>{f.label}</label>
            <input
              id={`register-${f.name}`}
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              style={inputStyle}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>
        ))}

        <button
          id="register-btn"
          style={loading ? btnDisabled : btn}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <p style={footerText}>
          Already have an account?{" "}
          <Link to="/login" style={linkStyle}>Sign in</Link>
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
  position: "fixed", top: "-150px", right: "-100px",
  width: "420px", height: "420px", borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)",
  pointerEvents: "none",
};
const blob2: React.CSSProperties = {
  position: "fixed", bottom: "-100px", left: "-80px",
  width: "350px", height: "350px", borderRadius: "50%",
  background: "radial-gradient(circle, rgba(252,92,125,0.18) 0%, transparent 70%)",
  pointerEvents: "none",
};

const card: React.CSSProperties = {
  width: "100%", maxWidth: "430px",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "38px 34px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  position: "relative", zIndex: 1,
};

const logoWrap: React.CSSProperties = { textAlign: "center", marginBottom: "24px" };
const logoIcon: React.CSSProperties = { fontSize: "38px", display: "block", marginBottom: "8px", animation: "float 3s ease-in-out infinite" };
const logoText: React.CSSProperties = {
  fontFamily: "var(--font-alt)", fontSize: "21px", fontWeight: "700",
  background: "var(--accent-grad)", WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent", backgroundClip: "text",
};
const logoSub: React.CSSProperties = { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" };
const heading: React.CSSProperties = { fontSize: "21px", fontWeight: "700", color: "var(--text)", marginBottom: "5px" };
const subheading: React.CSSProperties = { fontSize: "13px", color: "var(--text-dim)", marginBottom: "22px" };

const errorBox: React.CSSProperties = {
  background: "rgba(252,92,125,0.1)", border: "1px solid rgba(252,92,125,0.3)",
  color: "#fc8fa3", padding: "10px 14px", borderRadius: "var(--radius-sm)",
  fontSize: "13px", marginBottom: "16px",
};

const fieldGroup: React.CSSProperties = { marginBottom: "14px" };
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: "600",
  color: "var(--text-dim)", marginBottom: "6px", letterSpacing: "0.02em",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px",
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: "14px",
  outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
};
const btn: React.CSSProperties = {
  width: "100%", padding: "13px",
  background: "var(--accent-grad)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff",
  fontSize: "15px", fontWeight: "700", letterSpacing: "0.02em",
  boxShadow: "var(--shadow-accent)", marginTop: "8px",
};
const btnDisabled: React.CSSProperties = { ...btn, opacity: 0.6, cursor: "not-allowed" };
const footerText: React.CSSProperties = { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" };
const linkStyle: React.CSSProperties = { color: "var(--accent)", fontWeight: "600", textDecoration: "none" };

export default Register;
