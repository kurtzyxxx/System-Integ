import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Subject {
  id: number;
  name: string;
  code: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

const SUBJECT_COLORS = ["#7c5cfc", "#fc5c7d", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState<"dashboard" | "subjects" | "tasks">("dashboard");

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("sp_subjects");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "System Integration", code: "IT342", color: "#7c5cfc" },
      { id: 2, name: "Web Development",    code: "IT321", color: "#fc5c7d" },
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("sp_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Database ERD",      subject: "System Integration", dueDate: "2026-04-05", done: false, priority: "high" },
      { id: 2, title: "React Auth Pages",  subject: "Web Development",    dueDate: "2026-04-07", done: false, priority: "medium" },
      { id: 3, title: "API Integration",   subject: "System Integration", dueDate: "2026-04-10", done: true,  priority: "low" },
    ];
  });

  // Subject modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName]     = useState("");
  const [newSubjectCode, setNewSubjectCode]     = useState("");

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle,    setNewTaskTitle]    = useState("");
  const [newTaskSubject,  setNewTaskSubject]  = useState("");
  const [newTaskDue,      setNewTaskDue]      = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => { localStorage.setItem("sp_subjects", JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem("sp_tasks",    JSON.stringify(tasks));    }, [tasks]);

  const addSubject = () => {
    if (!newSubjectName || !newSubjectCode) return;
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    setSubjects([...subjects, { id: Date.now(), name: newSubjectName, code: newSubjectCode, color }]);
    setNewSubjectName(""); setNewSubjectCode("");
    setShowSubjectModal(false);
  };

  const removeSubject = (id: number) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const addTask = () => {
    if (!newTaskTitle || !newTaskSubject) return;
    setTasks([...tasks, {
      id: Date.now(), title: newTaskTitle, subject: newTaskSubject,
      dueDate: newTaskDue, done: false, priority: newTaskPriority,
    }]);
    setNewTaskTitle(""); setNewTaskSubject(""); setNewTaskDue(""); setNewTaskPriority("medium");
    setShowTaskModal(false);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pendingTasks   = tasks.filter(t => !t.done);
  const completedTasks = tasks.filter(t => t.done);
  const todayStr       = new Date().toISOString().split("T")[0];
  const dueTodayCount  = pendingTasks.filter(t => t.dueDate === todayStr).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);

  const priorityColor: Record<string, string> = {
    high: "#fc5c7d", medium: "#f59e0b", low: "#10b981",
  };

  // Sidebar nav items
  const navItems = [
    { key: "dashboard", label: "Dashboard",  icon: "🏠" },
    { key: "subjects",  label: "Subjects",   icon: "📖" },
    { key: "tasks",     label: "Tasks",      icon: "✅" },
  ];

  const getSubjectColor = (name: string) => {
    const s = subjects.find(sub => sub.name === name);
    return s ? s.color : "#7c5cfc";
  };

  const firstName = user?.fullName?.split(" ")[0] || user?.username || "Student";

  return (
    <div style={layout}>
      {/* ── Sidebar ── */}
      <aside style={sidebar}>
        <div>
          <div style={sidebarLogo}>
            <span style={{ fontSize: 24 }}>📚</span>
            <span style={sidebarLogoText}>Study Planner</span>
          </div>

          {/* User chip */}
          <div style={userChip}>
            <div style={avatarChip}>{firstName.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{firstName}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user?.email}</div>
            </div>
          </div>

          <nav>
            {navItems.map(item => (
              <div
                key={item.key}
                style={activePage === item.key ? navActive : navLink}
                onClick={() => setActivePage(item.key as any)}
              >
                <span style={{ marginRight: 10 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
            <div style={navLink} onClick={() => navigate("/profile")}>
              <span style={{ marginRight: 10 }}>👤</span>Profile
            </div>
          </nav>
        </div>

        <button style={logoutBtn} onClick={logout}>
          <span style={{ marginRight: 8 }}>🚪</span>Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={main}>

        {/* ══ DASHBOARD VIEW ══ */}
        {activePage === "dashboard" && (
          <div className="fade-in">
            <div style={pageHeader}>
              <div>
                <h1 style={pageTitle}>Good {getGreeting()}, {firstName}! 🌟</h1>
                <p style={pageSubtitle}>Here's what's happening with your studies today.</p>
              </div>
              <div style={dateChip}>{formatDate(new Date())}</div>
            </div>

            {/* Stats row */}
            <div style={statsRow}>
              {[
                { label: "Pending Tasks",   value: pendingTasks.length,   icon: "⏳", color: "#fc5c7d" },
                { label: "Completed",       value: completedTasks.length, icon: "✅", color: "#10b981" },
                { label: "Subjects",        value: subjects.length,       icon: "📖", color: "#7c5cfc" },
                { label: "Due Today",       value: dueTodayCount,         icon: "📅", color: "#f59e0b" },
              ].map(stat => (
                <div key={stat.label} style={statCard}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ ...statValue, color: stat.color }}>{stat.value}</div>
                  <div style={statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Progress card */}
            <div style={progressCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Overall Completion Rate</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#10b981" }}>{completionRate}%</span>
              </div>
              <div style={progressBar}>
                <div style={{ ...progressFill, width: `${completionRate}%` }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                {completedTasks.length} of {tasks.length} tasks completed
              </p>
            </div>

            {/* Bottom grid */}
            <div style={dashGrid}>
              {/* Recent tasks */}
              <div style={dashCard}>
                <div style={cardHead}>
                  <span style={cardTitle}>📝 Upcoming Tasks</span>
                  <button style={miniBtn} onClick={() => setActivePage("tasks")}>View All</button>
                </div>
                {pendingTasks.length === 0 && <p style={emptyMsg}>🎉 No pending tasks!</p>}
                {pendingTasks.slice(0, 4).map(task => (
                  <div key={task.id} style={taskRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...priorityDot, background: priorityColor[task.priority] }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{task.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{task.subject}</div>
                      </div>
                    </div>
                    {task.dueDate && <span style={dueTag}>{task.dueDate}</span>}
                  </div>
                ))}
              </div>

              {/* Subjects */}
              <div style={dashCard}>
                <div style={cardHead}>
                  <span style={cardTitle}>📚 My Subjects</span>
                  <button style={miniBtn} onClick={() => setActivePage("subjects")}>Manage</button>
                </div>
                {subjects.length === 0 && <p style={emptyMsg}>No subjects yet.</p>}
                {subjects.map(sub => (
                  <div key={sub.id} style={subjectRow}>
                    <div style={{ ...subjectDot, background: sub.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub.code}</div>
                    </div>
                    <span style={{ ...taskBadge, background: sub.color + "25", color: sub.color }}>
                      {tasks.filter(t => t.subject === sub.name && !t.done).length} pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ SUBJECTS VIEW ══ */}
        {activePage === "subjects" && (
          <div className="fade-in">
            <div style={pageHeader}>
              <div>
                <h1 style={pageTitle}>📖 My Subjects</h1>
                <p style={pageSubtitle}>Manage all your enrolled courses here.</p>
              </div>
              <button style={accentBtn} onClick={() => setShowSubjectModal(true)}>+ Add Subject</button>
            </div>

            <div style={subjectGrid}>
              {subjects.map(sub => (
                <div key={sub.id} style={{ ...subjectCard, borderTop: `3px solid ${sub.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{sub.name}</div>
                      <div style={{ ...codeBadge, background: sub.color + "20", color: sub.color }}>{sub.code}</div>
                    </div>
                    <button style={removeBtn} onClick={() => removeSubject(sub.id)}>✕</button>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
                    {tasks.filter(t => t.subject === sub.name).length} task(s) •{" "}
                    {tasks.filter(t => t.subject === sub.name && t.done).length} completed
                  </div>
                </div>
              ))}
              <div style={addSubjectCard} onClick={() => setShowSubjectModal(true)}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>➕</span>
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Add new subject</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ TASKS VIEW ══ */}
        {activePage === "tasks" && (
          <div className="fade-in">
            <div style={pageHeader}>
              <div>
                <h1 style={pageTitle}>✅ My Tasks</h1>
                <p style={pageSubtitle}>Track your assignments and deadlines.</p>
              </div>
              <button style={accentBtn} onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            </div>

            <div style={taskFilterRow}>
              {["All", "Pending", "Done"].map(f => (
                <button key={f} style={filterBtn}>{f}</button>
              ))}
            </div>

            <div style={taskList}>
              {tasks.length === 0 && (
                <div style={emptyState}>
                  <span style={{ fontSize: 48 }}>📭</span>
                  <p>No tasks yet. Add your first one!</p>
                </div>
              )}
              {tasks.map(task => (
                <div key={task.id} style={{ ...taskCard, opacity: task.done ? 0.6 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      style={checkbox}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, textDecoration: task.done ? "line-through" : "none", color: "var(--text)" }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <span style={{ ...miniTag, background: getSubjectColor(task.subject) + "22", color: getSubjectColor(task.subject) }}>
                          {task.subject}
                        </span>
                        <span style={{ ...miniTag, background: priorityColor[task.priority] + "22", color: priorityColor[task.priority] }}>
                          {task.priority}
                        </span>
                        {task.dueDate && <span style={{ ...miniTag, background: "var(--bg-surface)", color: "var(--text-muted)" }}>📅 {task.dueDate}</span>}
                      </div>
                    </div>
                  </div>
                  <button style={removeBtn} onClick={() => removeTask(task.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Subject Modal ── */}
      {showSubjectModal && (
        <div style={modalOverlay} onClick={() => setShowSubjectModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={modalTitle}>📖 Add Subject</h3>
            <label style={modalLabel}>Subject Name</label>
            <input style={modalInput} placeholder="e.g. Data Structures" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
            <label style={modalLabel}>Subject Code</label>
            <input style={modalInput} placeholder="e.g. CS301" value={newSubjectCode} onChange={e => setNewSubjectCode(e.target.value)} />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={modalCancelBtn} onClick={() => setShowSubjectModal(false)}>Cancel</button>
              <button style={modalSubmitBtn} onClick={addSubject}>Add Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Modal ── */}
      {showTaskModal && (
        <div style={modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={modalTitle}>✅ Add Task</h3>
            <label style={modalLabel}>Task Title</label>
            <input style={modalInput} placeholder="e.g. Research paper outline" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
            <label style={modalLabel}>Subject</label>
            <select style={modalInput} value={newTaskSubject} onChange={e => setNewTaskSubject(e.target.value)}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <label style={modalLabel}>Due Date</label>
            <input style={modalInput} type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} />
            <label style={modalLabel}>Priority</label>
            <select style={modalInput} value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={modalCancelBtn} onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button style={modalSubmitBtn} onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ─── Styles ────────────────────────────────────────────────
const layout: React.CSSProperties = {
  display: "flex", minHeight: "100vh", background: "var(--bg)",
};

const sidebar: React.CSSProperties = {
  width: "240px", minWidth: "240px",
  background: "var(--bg-card)",
  borderRight: "1px solid var(--border)",
  display: "flex", flexDirection: "column",
  justifyContent: "space-between",
  padding: "24px 16px",
  position: "sticky", top: 0, height: "100vh",
};

const sidebarLogo: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  marginBottom: "28px", paddingLeft: 4,
};
const sidebarLogoText: React.CSSProperties = {
  fontFamily: "var(--font-alt)", fontWeight: 700, fontSize: 17,
  background: "var(--accent-grad)", WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent", backgroundClip: "text",
};

const userChip: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  background: "var(--bg-surface)", borderRadius: "var(--radius)",
  padding: "10px 12px", marginBottom: "20px",
  border: "1px solid var(--border)",
};
const avatarChip: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%",
  background: "var(--accent-grad)", display: "flex",
  alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: 15, flexShrink: 0,
};

const navLink: React.CSSProperties = {
  display: "flex", alignItems: "center",
  padding: "10px 12px", borderRadius: "var(--radius-sm)",
  cursor: "pointer", fontSize: 14, color: "var(--text-dim)",
  marginBottom: 4, fontWeight: 500, transition: "all 0.2s",
};
const navActive: React.CSSProperties = {
  ...navLink, background: "var(--accent-light)",
  color: "var(--accent)", fontWeight: 700,
};

const logoutBtn: React.CSSProperties = {
  display: "flex", alignItems: "center",
  width: "100%", padding: "10px 12px",
  background: "transparent", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const main: React.CSSProperties = {
  flex: 1, padding: "36px 40px", overflowY: "auto",
};

const pageHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between",
  alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: 12,
};
const pageTitle: React.CSSProperties = {
  fontSize: "26px", fontWeight: 800, color: "var(--text)", marginBottom: 4,
};
const pageSubtitle: React.CSSProperties = {
  fontSize: 14, color: "var(--text-muted)",
};
const dateChip: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", padding: "8px 14px",
  fontSize: 13, color: "var(--text-dim)", fontWeight: 500,
};

const statsRow: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
  marginBottom: "24px",
};
const statCard: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "20px", textAlign: "center",
};
const statValue: React.CSSProperties = { fontSize: 32, fontWeight: 800, lineHeight: 1 };
const statLabel: React.CSSProperties = { fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 };

const progressCard: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: "24px",
};
const progressBar: React.CSSProperties = {
  height: 8, background: "var(--bg-surface)", borderRadius: 4, overflow: "hidden",
};
const progressFill: React.CSSProperties = {
  height: "100%", background: "var(--accent-grad)",
  borderRadius: 4, transition: "width 0.6s ease",
};

const dashGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20,
};
const dashCard: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "20px 22px",
};
const cardHead: React.CSSProperties = {
  display: "flex", justifyContent: "space-between",
  alignItems: "center", marginBottom: 16,
};
const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: 15 };
const miniBtn: React.CSSProperties = {
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  color: "var(--text-dim)", padding: "4px 10px",
  borderRadius: "var(--radius-sm)", fontSize: 12, cursor: "pointer",
};

const taskRow: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "10px 12px", borderRadius: "var(--radius-sm)",
  background: "var(--bg-surface)", marginBottom: 8,
};
const priorityDot: React.CSSProperties = {
  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
};
const dueTag: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)",
  background: "var(--bg)", padding: "2px 8px", borderRadius: 4,
};

const subjectRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: "var(--radius-sm)",
  background: "var(--bg-surface)", marginBottom: 8,
};
const subjectDot: React.CSSProperties = {
  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
};
const taskBadge: React.CSSProperties = {
  fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600,
};

const emptyMsg: React.CSSProperties = {
  color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "16px 0",
};

// ─── Subjects page ──────────────────────────────────────────
const subjectGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16,
};
const subjectCard: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "18px 20px",
};
const codeBadge: React.CSSProperties = {
  display: "inline-block", fontSize: 11, fontWeight: 700,
  padding: "3px 8px", borderRadius: 4, marginTop: 4,
};
const addSubjectCard: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px dashed var(--border)",
  borderRadius: "var(--radius)", padding: "18px 20px",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  cursor: "pointer", minHeight: 110,
};
const removeBtn: React.CSSProperties = {
  background: "transparent", border: "none", color: "var(--text-muted)",
  fontSize: 14, cursor: "pointer", padding: "2px 6px",
};

// ─── Tasks page ─────────────────────────────────────────────
const taskFilterRow: React.CSSProperties = {
  display: "flex", gap: 8, marginBottom: 16,
};
const filterBtn: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  color: "var(--text-dim)", padding: "6px 16px",
  borderRadius: "var(--radius-sm)", fontSize: 13, cursor: "pointer",
};
const taskList: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const emptyState: React.CSSProperties = {
  textAlign: "center", padding: "60px 0", color: "var(--text-muted)",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
};
const taskCard: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "14px 18px", gap: 16,
};
const checkbox: React.CSSProperties = {
  width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer",
};
const miniTag: React.CSSProperties = {
  fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
};

// ─── Action buttons ──────────────────────────────────────────
const accentBtn: React.CSSProperties = {
  background: "var(--accent-grad)", color: "#fff",
  border: "none", padding: "10px 20px",
  borderRadius: "var(--radius-sm)", fontSize: 14,
  fontWeight: 700, boxShadow: "var(--shadow-accent)",
};

// ─── Modals ──────────────────────────────────────────────────
const modalOverlay: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 999,
};
const modal: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "28px 30px",
  width: "100%", maxWidth: 400,
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease",
};
const modalTitle: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 20 };
const modalLabel: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-dim)", marginBottom: 6, marginTop: 12,
};
const modalInput: React.CSSProperties = {
  width: "100%", padding: "11px 13px",
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};
const modalSubmitBtn: React.CSSProperties = {
  flex: 1, padding: "11px",
  background: "var(--accent-grad)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff",
  fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const modalCancelBtn: React.CSSProperties = {
  flex: 1, padding: "11px",
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text-dim)",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
};

export default Dashboard;
