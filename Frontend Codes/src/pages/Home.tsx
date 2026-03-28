import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const subjects = [
    { id: 1, name: "System Integration", code: "IT342", taskCount: 3 },
    { id: 2, name: "Web Development", code: "IT321", taskCount: 5 },
  ];

  return (
    <div style={layout}>
      {}
      <aside style={sidebar}>
        <h2 style={logo}>Study Planner</h2>
        <div style={navGroup}>
          <div style={activeNavItem}>Dashboard</div>
          <div style={navItem}>Subjects</div>
          <div style={navItem}>Tasks</div>
          <div style={navItem}>Settings</div>
        </div>
        <button style={logoutBtn} onClick={() => navigate("/login")}>
          Logout
        </button>
      </aside>

      {}
      <main style={mainContent}>
        <header style={header}>
          <h1 style={{ margin: 0, color: "#333" }}>Dashboard</h1>
          <p style={{ color: "#666" }}>Welcome back! Here is your study progress.</p>
        </header>

        <div style={grid}>
          {}
          <div style={card}>
            <div style={cardHeader}>
              <h3 style={{ margin: 0 }}>My Subjects</h3>
              <button style={addButton}>+ Add</button>
            </div>
            {subjects.map((sub) => (
              <div key={sub.id} style={itemRow}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{sub.name}</div>
                  <div style={{ fontSize: "12px", color: "#AAA" }}>{sub.code}</div>
                </div>
                <span style={badge}>{sub.taskCount} Tasks</span>
              </div>
            ))}
          </div>

          {}
          <div style={card}>
            <h3 style={{ margin: 0, marginBottom: "20px" }}>Quick Stats</h3>
            <div style={statsContainer}>
              <div style={statBox}>
                <div style={statNum}>08</div>
                <div style={statLabel}>Pending</div>
              </div>
              <div style={statBox}>
                <div style={statNum}>12</div>
                <div style={statLabel}>Completed</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


const layout: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
};

const sidebar: React.CSSProperties = {
  width: "250px",
  backgroundColor: "#333",
  color: "#EEE",
  display: "flex",
  flexDirection: "column",
  padding: "25px",
};

const logo: React.CSSProperties = {
  fontSize: "22px",
  marginBottom: "40px",
  textAlign: "center",
  borderBottom: "1px solid #555",
  paddingBottom: "15px",
};

const navGroup: React.CSSProperties = { flex: 1 };

const navItem: React.CSSProperties = {
  padding: "12px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "10px",
  color: "#AAA",
};

const activeNavItem: React.CSSProperties = {
  ...navItem,
  backgroundColor: "#444",
  color: "#EEE",
  fontWeight: "bold",
};

const mainContent: React.CSSProperties = {
  flex: 1,
  padding: "40px",
};

const header: React.CSSProperties = { marginBottom: "30px" };

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "25px",
};

const card: React.CSSProperties = {
  backgroundColor: "#333",
  color: "#EEE",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const itemRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#444",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "10px",
};

const badge: React.CSSProperties = {
  backgroundColor: "#000",
  fontSize: "12px",
  padding: "4px 10px",
  borderRadius: "20px",
};

const statsContainer: React.CSSProperties = { display: "flex", gap: "10px" };

const statBox: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#444",
  padding: "15px",
  borderRadius: "8px",
  textAlign: "center",
};

const statNum: React.CSSProperties = { fontSize: "24px", fontWeight: "bold" };
const statLabel: React.CSSProperties = { fontSize: "12px", color: "#AAA" };

const addButton: React.CSSProperties = {
  backgroundColor: "#EEE",
  border: "none",
  borderRadius: "4px",
  padding: "5px 10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const logoutBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #666",
  color: "#AAA",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Home;
