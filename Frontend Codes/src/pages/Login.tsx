import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Use your axios instance to ensure the correct BaseURL (port 8080) is used
import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    setError(""); 
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (err: any) {
      // 3. Set the error message if the backend sends a 401
      setError("Incorrect email or password. Please try again.");
      console.error("Login detail:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={logo}>Study Planner</h1>
        <h2 style={title}>Login</h2>

        {error && <div style={errorBanner}>{error}</div>}

        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          style={loading ? disabledButton : buttonStyle} 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Login"}
        </button>

        <p style={smallText}>
          Don't have an account?{" "}
          <Link to="/register" style={link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

// --- KEEPING YOUR UI STYLES EXACTLY AS THEY WERE ---
const container: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f3f4f6",
  margin: 0,
  padding: 0,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "380px",
  padding: "40px",
  backgroundColor: "#333",
  borderRadius: "12px",
  textAlign: "center",
  color: "#EEE",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  boxSizing: "border-box",
};

const errorBanner: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#dc2626",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "15px",
  fontSize: "14px",
  border: "1px solid #f87171",
};

const logo: React.CSSProperties = { marginBottom: "10px", fontSize: "28px" };
const title: React.CSSProperties = { marginBottom: "25px", fontSize: "20px" };

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "45px",
  padding: "0 15px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #555",
  backgroundColor: "#444",
  color: "#EEE",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  height: "45px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#000",
  color: "#EEE",
  fontWeight: "bold",
  cursor: "pointer",
};

const disabledButton: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#555",
  cursor: "not-allowed",
};

const smallText: React.CSSProperties = { fontSize: "14px", marginTop: "20px" };
const link: React.CSSProperties = { color: "#3b82f6", textDecoration: "none", fontWeight: "bold" };

export default Login;
