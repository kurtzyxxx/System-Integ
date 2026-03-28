import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

interface Subject { id: number; name: string; code: string; color: string; }
interface Task { id: number; title: string; subject: string; dueDate: string; done: boolean; priority: "high" | "medium" | "low"; }

const COLORS = ["#5b6cf9", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
const PRIORITY_COLOR: Record<string, string> = { high: "#f43f5e", medium: "#f59e0b", low: "#10b981" };

const NAV = [
  { key: "dashboard", label: "Dashboard"  },
  { key: "subjects",  label: "Subjects"   },
  { key: "tasks",     label: "Tasks"      },
];

// ── Helper: read user-scoped data from localStorage synchronously ──
function readLocalUser() {
  try {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function readScoped(suffix: string) {
  try {
    const u = readLocalUser();
    if (!u) return null;
    const key = u.username || u.id || "default";
    return localStorage.getItem(`${suffix}_${key}`);
  } catch { return null; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── All state initialised SYNCHRONOUSLY — zero first-render flash ──
  const [user, setUser] = useState<any>(() => readLocalUser());

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    const raw = readScoped("sp_avatar");
    return raw || "";
  });

  const [storageKey, setStorageKey] = useState<string>(() => {
    const u = readLocalUser();
    return u ? (u.username || u.id || "default") : "";
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const raw = readScoped("sp_subjects");
    return raw ? JSON.parse(raw) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const raw = readScoped("sp_tasks");
    return raw ? JSON.parse(raw) : [];
  });

  const [page, setPage] = useState<"dashboard" | "subjects" | "tasks">(
    (location.state as any)?.tab || "dashboard"
  );

  const [showSubModal, setShowSubModal] = useState(false);
  const [subName, setSubName]           = useState("");
  const [subCode, setSubCode]           = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle,    setTaskTitle]    = useState("");
  const [taskSubject,  setTaskSubject]  = useState("");
  const [taskDue,      setTaskDue]      = useState("");
  const [taskPriority, setTaskPriority] = useState<"high"|"medium"|"low">("medium");
  const [taskFilter,   setTaskFilter]   = useState<"all"|"active"|"overdue"|"done">("all");

  // ── Auth guard + refresh avatar from Profile if updated ──
  useEffect(() => {
    const s = localStorage.getItem("user");
    if (!s) { navigate("/login"); return; }
    const u = JSON.parse(s);
    setUser(u);
    const key = u.username || u.id || "default";
    setStorageKey(key);
    // Refresh avatar in case it was changed in Profile
    const av = localStorage.getItem(`sp_avatar_${key}`);
    if (av) setAvatarUrl(av);
  }, [navigate]);

  // Close modals on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSubModal(false);
        setShowTaskModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Persist subjects/tasks only when the user is known (storageKey is set)
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(`sp_subjects_${storageKey}`, JSON.stringify(subjects));
  }, [subjects, storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(`sp_tasks_${storageKey}`, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  const addSubject = () => {
    if (!subName || !subCode) return;
    setSubjects([...subjects, { id: Date.now(), name: subName, code: subCode, color: COLORS[subjects.length % COLORS.length] }]);
    setSubName(""); setSubCode(""); setShowSubModal(false);
  };

  const addTask = () => {
    if (!taskTitle || !taskSubject) return;
    setTasks([...tasks, { id: Date.now(), title: taskTitle, subject: taskSubject, dueDate: taskDue, done: false, priority: taskPriority }]);
    setTaskTitle(""); setTaskSubject(""); setTaskDue(""); setTaskPriority("medium"); setShowTaskModal(false);
  };

  const toggleTask   = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask   = (id: number) => setTasks(tasks.filter(t => t.id !== id));
  const removeSubject= (id: number) => setSubjects(subjects.filter(s => s.id !== id));

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const rate      = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);
  const today     = new Date().toISOString().split("T")[0];
  const dueTodayCount = pending.filter(t => t.dueDate === today).length;

  // ── Overdue helpers ──
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const isOverdue = (t: Task) =>
    !t.done && !!t.dueDate && new Date(t.dueDate) < startOfToday;
  const overdueList = pending.filter(isOverdue);
  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    return Math.floor((startOfToday.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };
  const isDueSoon = (t: Task) => {
    if (t.done || !t.dueDate || isOverdue(t)) return false;
    const due = new Date(t.dueDate); due.setHours(0, 0, 0, 0);
    const diff = Math.floor((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 2;
  };

  const firstName = user?.fullName?.split(" ")[0] || user?.username || "Student";
  const getColor  = (name: string) => subjects.find(s => s.name === name)?.color || "#5b6cf9";

  const filteredTasks = tasks.filter((t: Task) => {
    if (taskFilter === "active")  return !t.done && !isOverdue(t);
    if (taskFilter === "overdue") return isOverdue(t);
    if (taskFilter === "done")    return t.done;
    return true; // "all"
  });

  return (
    <div style={layout}>
      {/* ── Sidebar ── */}
      <aside style={sidebar}>
        <div>
          {/* Brand */}
          <div style={brand}>
            <img src="/logo.png" alt="logo" style={logoImg} />
            <span style={brandLabel}>Study Planner</span>
          </div>

          {/* User pill */}
          <div style={userPill}>
            <div style={avatar}>
              {avatarUrl
                ? <img
                    src={avatarUrl}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                  />
                : firstName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={userName}>{user?.fullName || firstName}</div>
              <div style={userEmail}>{user?.email}</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ marginTop: 8 }}>
            <div style={navSection}>MAIN</div>
            {NAV.map(n => (
              <div key={n.key} style={page === n.key ? navItemActive : navItem} onClick={() => setPage(n.key as any)}>
                {page === n.key && <div style={navIndicator} />}
                {n.label}
              </div>
            ))}
            <div style={{ ...navItem, marginTop: 4 }} onClick={() => navigate("/profile")}>
              Profile
            </div>
          </nav>
        </div>

        <ThemeToggle variant="sidebar" />
        <button style={logoutBtn} onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}>
          Sign out
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={main}>

        {/* ══ DASHBOARD ══ */}
        {page === "dashboard" && (
          <div className="fade-in">
            <div style={pageHead}>
              <div>
                <h1 style={pageTitle}>Dashboard</h1>
                <p style={pageSub}>Welcome back, <strong>{firstName}</strong>. Here's your overview.</p>
              </div>
              <div style={datePill}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
            </div>

            {/* Stats */}
            <div style={statsGrid}>
              {[
                { label: "Pending",   value: pending.filter(t => !isOverdue(t)).length, color: "#f59e0b" },
                { label: "Completed", value: completed.length,                          color: "#10b981" },
                { label: "Overdue",   value: overdueList.length,                        color: "#f43f5e" },
                { label: "Due Today", value: dueTodayCount,                             color: "#3b82f6" },
              ].map(s => (
                <div key={s.label} style={{ ...statCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={cardTitle}>Completion Progress</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#10b981" }}>{rate}%</span>
              </div>
              <div style={progressTrack}>
                <div style={{ ...progressFill, width: `${rate}%` }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8 }}>
                {completed.length} of {tasks.length} tasks completed
              </p>
            </div>

            {/* Grid */}
            <div style={twoCol}>
              {/* Tasks */}
              <div style={card}>
                <div style={cardHead}>
                  <span style={cardTitle}>Upcoming Tasks</span>
                  <button style={linkBtn} onClick={() => setPage("tasks")}>View all</button>
                </div>
                {pending.length === 0 && <p style={emptyMsg}>No pending tasks — you're all caught up!</p>}
                {/* Show overdue first, then upcoming */}
                {[...pending.filter(isOverdue), ...pending.filter(t => !isOverdue(t))]
                  .slice(0, 4).map(t => {
                    const overdue = isOverdue(t);
                    const soon    = isDueSoon(t);
                    return (
                      <div key={t.id} style={{
                        ...taskRow,
                        borderLeft: overdue ? "3px solid #f43f5e" : soon ? "3px solid #f59e0b" : "1px solid var(--border)",
                        background: overdue ? "rgba(244,63,94,0.05)" : "var(--bg)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ ...priBadge, background: PRIORITY_COLOR[t.priority] + "20", color: PRIORITY_COLOR[t.priority] }}>
                            {t.priority[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: overdue ? "#f43f5e" : "var(--text)" }}>{t.title}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{t.subject}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                          {overdue && <span style={overdueTag}>{getDaysOverdue(t.dueDate)}d overdue</span>}
                          {!overdue && t.dueDate && <span style={dueChip}>{t.dueDate}</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Subjects */}
              <div style={card}>
                <div style={cardHead}>
                  <span style={cardTitle}>Subjects</span>
                  <button style={linkBtn} onClick={() => setPage("subjects")}>Manage</button>
                </div>
                {subjects.map(s => (
                  <div key={s.id} style={subjectRow}>
                    <div style={{ ...colorDot, background: s.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.code}</div>
                    </div>
                    <span style={{ ...miniTag, background: s.color + "18", color: s.color }}>
                      {tasks.filter(t => t.subject === s.name && !t.done).length} pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ SUBJECTS ══ */}
        {page === "subjects" && (
          <div className="fade-in">
            <div style={pageHead}>
              <div>
                <h1 style={pageTitle}>Subjects</h1>
                <p style={pageSub}>Manage your enrolled courses.</p>
              </div>
              <button style={accentBtn} onClick={() => setShowSubModal(true)}>+ Add Subject</button>
            </div>
            <div style={subjectGrid}>
              {subjects.map(s => (
                <div key={s.id} style={{ ...subCard, borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
                      <span style={{ ...codeTag, background: s.color + "18", color: s.color }}>{s.code}</span>
                    </div>
                    <button style={delBtn} onClick={() => removeSubject(s.id)}>×</button>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
                    {tasks.filter(t => t.subject === s.name).length} task(s)  ·  {tasks.filter(t => t.subject === s.name && t.done).length} done
                  </div>
                </div>
              ))}
              <div style={addCard} onClick={() => setShowSubModal(true)}>
                <span style={{ fontSize: 22, color: "var(--text-dim)", lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Add subject</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ TASKS ══ */}
        {page === "tasks" && (
          <div className="fade-in">
            <div style={pageHead}>
              <div>
                <h1 style={pageTitle}>Tasks</h1>
                <p style={pageSub}>Track your assignments and deadlines.</p>
              </div>
              <button style={accentBtn} onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            </div>

            {/* Filter tabs */}
            <div style={filterBar}>
              {(["all", "active", "overdue", "done"] as const).map(f => (
                <button
                  key={f}
                  id={`task-filter-${f}`}
                  style={taskFilter === f ? filterBtnActive : filterBtn}
                  onClick={() => setTaskFilter(f)}
                >
                  {f === "all"     && `All (${tasks.length})`}
                  {f === "active"  && `Active (${pending.filter(t => !isOverdue(t)).length})`}
                  {f === "overdue" && `Overdue (${overdueList.length})`}
                  {f === "done"    && `Done (${completed.length})`}
                </button>
              ))}
            </div>

            <div style={taskList}>
              {filteredTasks.length === 0 && <div style={emptyState}>No tasks in this category.</div>}
              {filteredTasks.map(t => {
                const overdue = isOverdue(t);
                const soon    = isDueSoon(t);
                return (
                  <div key={t.id} style={{
                    ...taskCard,
                    opacity:    t.done ? 0.6 : 1,
                    borderLeft: overdue ? "3px solid #f43f5e" : soon ? "3px solid #f59e0b" : "1px solid var(--border)",
                    background: overdue ? "rgba(244,63,94,0.04)" : "var(--bg-white)",
                  }}>
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={checkbox} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 14,
                        textDecoration: t.done ? "line-through" : "none",
                        color: overdue && !t.done ? "#f43f5e" : "var(--text)",
                      }}>
                        {t.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ ...miniTag, background: getColor(t.subject) + "18", color: getColor(t.subject) }}>{t.subject}</span>
                        <span style={{ ...miniTag, background: PRIORITY_COLOR[t.priority] + "18", color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                        {overdue && !t.done && (
                          <span style={overdueTag}>{getDaysOverdue(t.dueDate)} day{getDaysOverdue(t.dueDate) !== 1 ? "s" : ""} overdue</span>
                        )}
                        {soon && !t.done && !overdue && (
                          <span style={dueSoonTag}>Due soon</span>
                        )}
                        {t.dueDate && !overdue && !soon && (
                          <span style={{ ...miniTag, background: "var(--bg-muted)", color: "var(--text-muted)" }}>{t.dueDate}</span>
                        )}
                        {t.dueDate && !overdue && soon && (
                          <span style={{ ...miniTag, background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>{t.dueDate}</span>
                        )}
                      </div>
                    </div>
                    <button style={delBtn} onClick={() => removeTask(t.id)}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Subject Modal ── */}
      {showSubModal && (
        <div style={overlay} onClick={() => setShowSubModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={modalTitle}>Add Subject</h3>
            <label style={mLabel}>Subject Name</label>
            <input style={mInput} placeholder="e.g. Data Structures" value={subName} onChange={e => setSubName(e.target.value)} />
            <label style={mLabel}>Subject Code</label>
            <input style={mInput} placeholder="e.g. CS301" value={subCode} onChange={e => setSubCode(e.target.value)} />
            <div style={modalBtns}>
              <button style={mCancelBtn} onClick={() => setShowSubModal(false)}>Cancel</button>
              <button style={mSubmitBtn} onClick={addSubject}>Add Subject</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Modal ── */}
      {showTaskModal && (
        <div style={overlay} onClick={() => setShowTaskModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={modalTitle}>Add Task</h3>
            <label style={mLabel}>Task Title</label>
            <input style={mInput} placeholder="e.g. Research paper outline" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
            <label style={mLabel}>Subject</label>
            <select style={mInput} value={taskSubject} onChange={e => setTaskSubject(e.target.value)}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <label style={mLabel}>Due Date</label>
            <input style={mInput} type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
            <label style={mLabel}>Priority</label>
            <select style={mInput} value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <div style={modalBtns}>
              <button style={mCancelBtn} onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button style={mSubmitBtn} onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
const layout: React.CSSProperties = { display: "flex", minHeight: "100vh" };

const sidebar: React.CSSProperties = {
  width: "240px", minWidth: "240px",
  background: "var(--sidebar)", display: "flex",
  flexDirection: "column", justifyContent: "space-between",
  padding: "24px 16px", position: "sticky", top: 0, height: "100vh",
};

const brand: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "4px 8px", marginBottom: 20,
};
const logoImg: React.CSSProperties = {
  width: 36, height: 36,
  objectFit: "contain", flexShrink: 0,
  borderRadius: 6,
};
const brandLabel: React.CSSProperties = {
  color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em",
};

const userPill: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-dark)",
  borderRadius: "var(--radius)", padding: "10px 12px", marginBottom: 20,
};
const avatar: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "50%",
  background: "var(--accent-grad)", display: "flex",
  alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0,
};
const userName: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const userEmail: React.CSSProperties = { fontSize: 11, color: "var(--text-sidebar-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

const navSection: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--text-sidebar-muted)", letterSpacing: "0.1em", padding: "0 12px", marginBottom: 6 };
const navItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 0,
  padding: "9px 12px", borderRadius: "var(--radius-sm)",
  cursor: "pointer", fontSize: 13, fontWeight: 500,
  color: "var(--text-sidebar)", marginBottom: 2,
  position: "relative", transition: "all 0.15s",
};
const navItemActive: React.CSSProperties = {
  ...navItem, background: "rgba(91,108,249,0.18)",
  color: "#fff", fontWeight: 600,
};
const navIndicator: React.CSSProperties = {
  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
  width: 3, height: 16, background: "var(--accent)", borderRadius: "0 2px 2px 0",
};

const logoutBtn: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "transparent",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "var(--radius-sm)",
  color: "var(--text-sidebar-muted)", fontSize: 13, fontWeight: 500, textAlign: "left" as const,
};

const main: React.CSSProperties = { flex: 1, padding: "36px 40px", overflowY: "auto" };

const pageHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 };
const pageTitle: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 3 };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)" };
const datePill: React.CSSProperties = {
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", padding: "7px 14px",
  fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
};

const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 };
const statCard: React.CSSProperties = {
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "18px 20px",
  boxShadow: "var(--shadow-sm)",
};

const card: React.CSSProperties = {
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "20px 22px",
  boxShadow: "var(--shadow-sm)", marginBottom: 16,
};
const cardHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 };
const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: 14, color: "var(--text)" };
const linkBtn: React.CSSProperties = {
  background: "none", border: "none", color: "var(--accent)",
  fontSize: 12, fontWeight: 600, padding: 0,
};

const progressTrack: React.CSSProperties = { height: 7, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" };
const progressFill: React.CSSProperties = { height: "100%", background: "var(--accent-grad)", borderRadius: 99, transition: "width 0.5s ease" };

const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 };

const taskRow: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "9px 12px", borderRadius: "var(--radius-sm)",
  background: "var(--bg)", marginBottom: 6, border: "1px solid var(--border)",
};
const priBadge: React.CSSProperties = {
  width: 22, height: 22, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 10, fontWeight: 800, flexShrink: 0,
};
const dueChip: React.CSSProperties = {
  fontSize: 11, color: "var(--text-muted)",
  background: "var(--bg-muted)", padding: "3px 8px", borderRadius: 4,
};
const emptyMsg: React.CSSProperties = { color: "var(--text-muted)", fontSize: 13, padding: "10px 0" };

const subjectRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "9px 12px", borderRadius: "var(--radius-sm)",
  background: "var(--bg)", marginBottom: 6, border: "1px solid var(--border)",
};
const colorDot: React.CSSProperties = { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 };
const miniTag: React.CSSProperties = { fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" as const };

// Subjects page
const subjectGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 };
const subCard: React.CSSProperties = {
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "18px 20px", boxShadow: "var(--shadow-sm)",
};
const codeTag: React.CSSProperties = { fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, display: "inline-block" };
const addCard: React.CSSProperties = {
  background: "var(--bg-white)", border: "1.5px dashed var(--border)",
  borderRadius: "var(--radius)", padding: "18px 20px",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  cursor: "pointer", minHeight: 110,
};
const delBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--text-dim)", fontSize: 18, lineHeight: 1 };

// Tasks page
const taskList: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const emptyState: React.CSSProperties = { textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 };
const taskCard: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 12,
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "14px 16px",
  boxShadow: "var(--shadow-sm)",
};
const checkbox: React.CSSProperties = { width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer", marginTop: 2, flexShrink: 0 };

// Deadline status tags
const overdueTag: React.CSSProperties = {
  fontSize: 11, padding: "2px 8px",
  borderRadius: 20, fontWeight: 700,
  background: "rgba(244,63,94,0.15)",
  color: "#f43f5e", whiteSpace: "nowrap" as const,
};
const dueSoonTag: React.CSSProperties = {
  fontSize: 11, padding: "2px 8px",
  borderRadius: 20, fontWeight: 700,
  background: "rgba(245,158,11,0.15)",
  color: "#f59e0b", whiteSpace: "nowrap" as const,
};

// Filter bar
const filterBar: React.CSSProperties = {
  display: "flex", gap: 6, marginBottom: 16,
  flexWrap: "wrap" as const,
};
const filterBtn: React.CSSProperties = {
  padding: "6px 14px",
  background: "var(--bg-white)", border: "1.5px solid var(--border)",
  borderRadius: 20, fontSize: 12, fontWeight: 600,
  color: "var(--text-muted)", cursor: "pointer",
  transition: "all 0.15s",
};
const filterBtnActive: React.CSSProperties = {
  ...filterBtn,
  background: "var(--accent)", borderColor: "var(--accent)",
  color: "#fff", boxShadow: "0 2px 8px rgba(91,108,249,0.3)",
};

// Accent btn
const accentBtn: React.CSSProperties = {
  background: "var(--accent)", color: "#fff", border: "none",
  padding: "9px 18px", borderRadius: "var(--radius-sm)",
  fontSize: 13, fontWeight: 700,
  boxShadow: "0 2px 10px rgba(91,108,249,0.3)",
};

// Modals
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(10,12,30,0.55)",
  backdropFilter: "blur(3px)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 999,
};
const modal: React.CSSProperties = {
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "28px 30px",
  width: "100%", maxWidth: 400, boxShadow: "var(--shadow-lg)",
  animation: "modalIn 0.25s ease",
};
const modalTitle: React.CSSProperties = { fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 20 };
const mLabel: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, marginTop: 14 };
const mInput: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "var(--bg)", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: 14, boxSizing: "border-box",
};
const modalBtns: React.CSSProperties = { display: "flex", gap: 10, marginTop: 20 };
const mSubmitBtn: React.CSSProperties = { flex: 1, padding: "10px", background: "var(--accent-grad)", border: "none", borderRadius: "var(--radius-sm)", color: "#fff", fontWeight: 700, fontSize: 14 };
const mCancelBtn: React.CSSProperties = { flex: 1, padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontWeight: 600, fontSize: 14 };
