import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={wrap}>
      <div style={card}>
        <div style={code}>404</div>
        <h1 style={title}>Page Not Found</h1>
        <p style={sub}>The page you're looking for doesn't exist or has been moved.</p>
        <button style={btn} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh", display: "flex",
  alignItems: "center", justifyContent: "center",
  background: "var(--bg)",
};
const card: React.CSSProperties = {
  textAlign: "center", padding: "60px 48px",
  background: "var(--bg-white)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow)",
  maxWidth: 420, width: "100%",
};
const code: React.CSSProperties = {
  fontSize: 72, fontWeight: 800,
  background: "var(--accent-grad)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  lineHeight: 1, marginBottom: 16,
};
const title: React.CSSProperties = {
  fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 10,
};
const sub: React.CSSProperties = {
  fontSize: 14, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6,
};
const btn: React.CSSProperties = {
  background: "var(--accent-grad)", color: "#fff", border: "none",
  padding: "11px 24px", borderRadius: "var(--radius-sm)",
  fontSize: 14, fontWeight: 700,
  boxShadow: "0 4px 14px rgba(91,108,249,0.3)",
};
