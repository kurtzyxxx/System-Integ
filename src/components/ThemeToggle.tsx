import React from "react";
import { useTheme } from "../context/ThemeContext";

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.5" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

interface Props {
  /** "sidebar" = full row with pill toggle, "corner" = compact button for auth pages */
  variant?: "sidebar" | "corner";
}

export default function ThemeToggle({ variant = "sidebar" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "corner") {
    return (
      <button
        id="theme-toggle-corner"
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "var(--radius-sm)",
          padding: "6px 10px",
          cursor: "pointer",
          color: "rgba(255,255,255,0.75)",
          fontSize: 12, fontWeight: 600,
          transition: "background 0.18s, color 0.18s",
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        {isDark ? "Light" : "Dark"}
      </button>
    );
  }

  // Sidebar variant — full row with animated pill switch
  return (
    <div
      id="theme-toggle-sidebar"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        color: "var(--text-sidebar)",
        marginBottom: 6,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isDark ? <MoonIcon /> : <SunIcon />}
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      </div>

      {/* Animated pill */}
      <div style={{
        width: 36, height: 20, borderRadius: 10, position: "relative",
        background: isDark ? "var(--accent)" : "rgba(255,255,255,0.18)",
        flexShrink: 0, transition: "background 0.3s",
      }}>
        <div style={{
          position: "absolute", top: 3, borderRadius: "50%",
          width: 14, height: 14, background: "#fff",
          left: isDark ? 19 : 3,
          transition: "left 0.28s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}
