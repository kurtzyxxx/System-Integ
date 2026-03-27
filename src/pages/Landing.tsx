import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const upcomingTasks = [
    { id: 1, title: "Database ERD", subject: "System Integration", dueDate: "2026-02-25" },
    { id: 2, title: "React Auth Pages", subject: "Web Development", dueDate: "2026-02-27" },
  ];

  return (
    <div style={pageContainer}>
      <nav style={navbar}>
        <h1 style={{ margin: 0 }}>Study Planner</h1>
        <button 
          style={logoutBtn} 
          onClick={() => navigate("/login")}
        >
          Logout
        </button>
      </nav>

      <main style={content}>
        <header style={headerSection}>
          <h2>Welcome back, Student!</h2>
          <p>You have {upcomingTasks.length} upcoming deadlines.</p>
        </header>

        <section style={dashboardGrid}>
          <div style={dashboardCard}>
            <h3>Upcoming Tasks</h3>
            {upcomingTasks.map(task => (
              <div key={task.id} style={taskItem}>
                <div>
                  <strong>{task.title}</strong>
                  <div style={{ fontSize: '12px', color: '#AAA' }}>{task.subject}</div>
                </div>
                <span style={{ color: '#EF4444' }}>{task.dueDate}</span>
              </div>
            ))}
          </div>

          <div style={dashboardCard}>
            <h3>Quick Actions</h3>
            <button style={actionBtn}>+ Add Subject</button>
            <button style={actionBtn}>+ Add Task</button>
          </div>
        </section>
      </main>
    </div>
  );
}

const pageContainer: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  color: "#333",
};

const navbar: React.CSSProperties = {
  backgroundColor: "#333",
  color: "#EEE",
  padding: "15px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const content: React.CSSProperties = {
  padding: "40px",
  maxWidth: "1000px",
  margin: "0 auto",
};

const headerSection: React.CSSProperties = {
  marginBottom: "30px",
};

const dashboardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "20px",
};

const dashboardCard: React.CSSProperties = {
  backgroundColor: "#333",
  color: "#EEE",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const taskItem: React.CSSProperties = {
  backgroundColor: "#444",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const actionBtn: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#000",
  color: "#EEE",
  fontWeight: "bold",
  cursor: "pointer",
};

const logoutBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #EEE",
  color: "#EEE",
  padding: "5px 15px",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Landing;