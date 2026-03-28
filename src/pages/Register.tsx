import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// 1. Import the register function from your api service
import { register } from "../services/api"; 

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { fullName, email, username, password, confirmPassword } = formData;
    
    if (!fullName || !email || !username || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      const res = await register({
        fullName,
        username,
        email,
        password
      });

      if (res.status === 200 || res.status === 201) {
        alert("Registration Successful!");
        navigate("/login"); 
      }
    } catch (err: any) {
 
      alert(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={logo}>Study Planner</h1>
        <h2 style={title}>Register</h2>

        <input
          name="fullName"
          placeholder="Full Name"
          style={input}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          style={input}
          onChange={handleChange}
        />
        <input
          name="username"
          placeholder="Username"
          style={input}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          style={input}
          onChange={handleChange}
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          style={input}
          onChange={handleChange}
        />

        <button style={button} onClick={handleRegister}>
          Register
        </button>

        <p style={smallText}>
          Already have an account?{" "}
          <Link to="/login" style={link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}


const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f3f4f6",
};

const card: React.CSSProperties = {
  width: 380,
  padding: 35,
  backgroundColor: "#333",
  borderRadius: 12,
  textAlign: "center",
  color: "#EEE",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
};

const logo: React.CSSProperties = { marginBottom: 10 };
const title: React.CSSProperties = { marginBottom: 20 };

const input: React.CSSProperties = {
  width: "100%",
  height: 45,
  padding: "0 12px",
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #555",
  backgroundColor: "#444",
  color: "#EEE",
};

const button: React.CSSProperties = {
  width: "100%",
  height: 45,
  borderRadius: 6,
  border: "none",
  backgroundColor: "#000",
  color: "#EEE",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallText: React.CSSProperties = { fontSize: 13, marginTop: 12 };
const link: React.CSSProperties = { color: "#EEE", textDecoration: "underline" };

export default Register;