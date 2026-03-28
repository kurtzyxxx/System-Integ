import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const subjects = [
    { id: 1, name: "System Integration", code: "IT342", tasks: 3 },
    { id: 2, name: "Web Development", code: "IT321", tasks: 5 },
  ];

  return (
    <div style={layout}>
      {}
      <aside style={sidebar}>
        <h2 style={logoText}>Study Planner</h2>
        <nav style={navLinks}>
          <div style={activeLink}>Dashboard</div>
          <div style={navItem}>Subjects</div>
          <div style={navItem}>Tasks</div>
          <div style={navItem} onClick={() => navigate("/profile")}>Profile</div>
        </nav>
        <button style={logoutBtn} onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
        }}>
          Logout
        </button>
      </aside>

      {}
      <main style={mainContent}>
        <header style={welcomeHeader}>
          <h1>Welcome Back, User!</h1>
          <p style={{ color: "#666" }}>Here is what's happening with your studies today.</p>
        </header>

        <section style={dashboardGrid}>
          {}
          <div style={contentCard}>
            <div style={cardHeader}>
              <h3>Your Subjects</h3>
              <button style={addBtn}>+ Add New</button>
            </div>
            {subjects.map((sub) => (
              <div key={sub.id} style={subjectItem}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{sub.name}</div>
                  <div style={{ fontSize: "12px", color: "#AAA" }}>{sub.code}</div>
                </div>
                <span style={badge}>{sub.tasks} Tasks</span>
              </div>
            ))}
          </div>

          {}
          <div style={contentCard}>
            <h3>Quick Stats</h3>
            <div style={statsBox}>
              <div style={statCard}>
                <div style={statValue}>12</div>
                <div style={statLabel}>Total Tasks</div>
              </div>
              <div style={statCard}>
                <div style={statValue}>3</div>
                <div style={statLabel}>Due Today</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const layout: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  fontFamily: "Arial, sans-serif",
};

const sidebar: React.CSSProperties = {
  width: "260px",
  backgroundColor: "#333",
  color: "#EEE",
  display: "flex",
  flexDirection: "column",
  padding: "30px 20px",
};

const logoText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  marginBottom: "40px",
  textAlign: "center",
  borderBottom: "1px solid #444",
  paddingBottom: "20px",
};

const navLinks: React.CSSProperties = {
  flex: 1,
};

const navItem: React.CSSProperties = {
  padding: "12px 15px",
  cursor: "pointer",
  borderRadius: "8px",
  marginBottom: "5px",
  transition: "0.3s",
};

const activeLink: React.CSSProperties = {
  ...navItem,
  backgroundColor: "#444",
  fontWeight: "bold",
};

const mainContent: React.CSSProperties = {
  flex: 1,
  padding: "40px",
  overflowY: "auto",
};

const welcomeHeader: React.CSSProperties = {
  marginBottom: "30px",
};

const dashboardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "25px",
};

const contentCard: React.CSSProperties = {
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

const subjectItem: React.CSSProperties = {
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
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
};

const statsBox: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginTop: "10px",
};

const statCard: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#444",
  padding: "15px",
  borderRadius: "8px",
  textAlign: "center",
};

const statValue: React.CSSProperties = { fontSize: "24px", fontWeight: "bold" };
const statLabel: React.CSSProperties = { fontSize: "12px", color: "#AAA" };

const addBtn: React.CSSProperties = {
  backgroundColor: "#EEE",
  color: "#333",
  border: "none",
  padding: "5px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const logoutBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #666",
  color: "#AAA",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Home;
