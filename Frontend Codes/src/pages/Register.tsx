import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", email: "", username: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: "Weak", color: "#fc5c7d" };
    if (score <= 2) return { score: 2, label: "Fair", color: "#f59e0b" };
    if (score <= 3) return { score: 3, label: "Good", color: "#3b82f6" };
    return { score: 4, label: "Strong", color: "#10b981" };
  }, [formData.password]);

  const handleRegister = async () => {
    const { fullName, email, username, password, confirmPassword } = formData;
    setError(""); setSuccess("");
    if (!fullName || !email || !username || !password || !confirmPassword) { setError("Please fill in all fields"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await register({ fullName, username, email, password });
      if (res.status === 200 || res.status === 201) {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  const fields = [
    { name: "fullName", placeholder: "John Santos", label: "Full Name", type: "text" },
    { name: "email", placeholder: "john@email.com", label: "Email Address", type: "email" },
    { name: "username", placeholder: "johnsantos", label: "Username", type: "text" },
    { name: "password", placeholder: "Min. 6 characters", label: "Password", type: "password" },
    { name: "confirmPassword", placeholder: "Repeat your password", label: "Confirm Password", type: "password" },
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

        <h2 style={heading}>Create your account</h2>
        <p style={subheading}>Start organizing your academic life today</p>

        {error && <div style={errorBox} className="scale-in">{error}</div>}
        {success && <div style={successBox} className="scale-in">{success}</div>}

        <div className="stagger">
          {fields.map((f) => (
            <div key={f.name} style={fieldGroup} className="fade-in-up">
              <label style={labelStyle} htmlFor={`register-${f.name}`}>{f.label}</label>
              <div style={{ position: "relative" }}>
                <input id={`register-${f.name}`} name={f.name}
                  type={f.type === "password" ? (showPassword ? "text" : "password") : f.type}
                  placeholder={f.placeholder} style={inputStyle} onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  autoComplete={f.type === "password" ? "new-password" : f.name === "email" ? "email" : "off"} />
                {f.type === "password" && f.name === "password" && (
                  <button type="button" style={eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
              {f.name === "password" && formData.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={strengthBarBg}>
                    <div style={{ ...strengthBarFill, width: `${(passwordStrength.score / 4) * 100}%`, background: passwordStrength.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.label}</span>
                </div>
              )}
            </div>
          ))}

          <button id="register-btn" style={loading ? btnDisabled : btn} onClick={handleRegister} disabled={loading} className="fade-in-up">
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={spinner} /> Creating account...</span> : "Create Account"}
          </button>
        </div>

        <p style={footerText}>Already have an account? <Link to="/login" style={linkStyle}>Sign in</Link></p>
      </div>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", position: "relative", overflow: "hidden", padding: 20 };
const blob1: React.CSSProperties = { position: "fixed", top: -150, right: -100, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)", pointerEvents: "none" };
const blob2: React.CSSProperties = { position: "fixed", bottom: -100, left: -80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,92,125,0.18) 0%, transparent 70%)", pointerEvents: "none" };

const card: React.CSSProperties = { width: "100%", maxWidth: 430, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "38px 34px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", position: "relative", zIndex: 1 };
const logoWrap: React.CSSProperties = { textAlign: "center", marginBottom: 24 };
const logoIcon: React.CSSProperties = { fontSize: 42, display: "block", marginBottom: 8, animation: "float 3s ease-in-out infinite" };
const logoText: React.CSSProperties = { fontFamily: "var(--font-alt)", fontSize: 21, fontWeight: 700, background: "var(--accent-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const logoSub: React.CSSProperties = { fontSize: 12, color: "var(--text-muted)", marginTop: 2 };
const heading: React.CSSProperties = { fontSize: 21, fontWeight: 700, color: "var(--text)", marginBottom: 5 };
const subheading: React.CSSProperties = { fontSize: 13, color: "var(--text-dim)", marginBottom: 22 };

const errorBox: React.CSSProperties = { background: "rgba(252,92,125,0.1)", border: "1px solid rgba(252,92,125,0.3)", color: "#fc8fa3", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 16 };
const successBox: React.CSSProperties = { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 16 };

const fieldGroup: React.CSSProperties = { marginBottom: 14 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 6, letterSpacing: "0.02em" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 13px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: 14, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" };
const eyeBtn: React.CSSProperties = { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", padding: "4px 6px", fontWeight: 600 };

const strengthBarBg: React.CSSProperties = { height: 3, background: "var(--bg-surface)", borderRadius: 2, marginBottom: 2, overflow: "hidden" };
const strengthBarFill: React.CSSProperties = { height: "100%", borderRadius: 2, transition: "width 0.3s ease, background 0.3s ease" };

const btn: React.CSSProperties = { width: "100%", padding: 13, background: "var(--accent-grad)", border: "none", borderRadius: "var(--radius-sm)", color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", boxShadow: "var(--shadow-accent)", marginTop: 8 };
const btnDisabled: React.CSSProperties = { ...btn, opacity: 0.6, cursor: "not-allowed" };
const spinner: React.CSSProperties = { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" };
const footerText: React.CSSProperties = { textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" };
const linkStyle: React.CSSProperties = { color: "var(--accent)", fontWeight: 600, textDecoration: "none" };

export default Register;
