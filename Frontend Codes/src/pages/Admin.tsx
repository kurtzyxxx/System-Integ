import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getAdminUsers, deleteAdminUser, changeUserRole, BACKEND_URL } from "../services/api";

interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  bio: string | null;
  major: string | null;
  school: string | null;
  avatarUrl: string | null;
}

interface Stats {
  totalUsers: number;
  completedProfiles: number;
  newUsersThisWeek: number;
  adminCount: number;
}

function Admin() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  const [user] = useState<any>(initialUser);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionMsgType, setActionMsgType] = useState<"success" | "error">("success");
  const [searchTerm, setSearchTerm] = useState("");

  // Theme state (synced)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("sp_theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("sp_theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!initialUser) { navigate("/login"); return; }
    if (initialUser.role !== "admin") { navigate("/dashboard"); return; }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(user.id),
        getAdminUsers(user.id),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (targetId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action permanently removes the account from the database.`)) return;
    try {
      await deleteAdminUser(user.id, targetId);
      setUsers(users.filter(u => u.id !== targetId));
      showAction(`User "${username}" deleted successfully`, "success");
      const statsRes = await getAdminStats(user.id);
      setStats(statsRes.data);
    } catch (err: any) {
      showAction(err.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const handleRoleChange = async (targetId: number, username: string, newRole: string) => {
    const action = newRole === "admin" ? "promote" : "demote";
    if (!window.confirm(`${action === "promote" ? "Promote" : "Demote"} "${username}" to ${newRole}?`)) return;
    try {
      await changeUserRole(user.id, targetId, newRole);
      setUsers(users.map(u => u.id === targetId ? { ...u, role: newRole } : u));
      showAction(`User "${username}" is now ${newRole}`, "success");
      const statsRes = await getAdminStats(user.id);
      setStats(statsRes.data);
    } catch (err: any) {
      showAction(err.response?.data?.message || "Failed to change role", "error");
    }
  };

  const showAction = (msg: string, type: "success" | "error") => {
    setActionMsg(msg);
    setActionMsgType(type);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const firstName = user?.fullName?.split(" ")[0] || user?.username || "Admin";

  // Admin's own avatar from cache
  const adminAvatar = initialUser ? localStorage.getItem(`sp_avatar_${initialUser.id}`) : null;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-muted)" }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={layout}>
      {/* ── Sidebar ── */}
      <aside style={sidebar}>
        <div>
          <div style={sidebarLogo}>
            <img src="/logo.png" alt="Study Planner" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(124,92,252,0.3))', animation: 'float 3s ease-in-out infinite' }} />
            <span style={sidebarLogoText}>Study Planner</span>
          </div>

          {/* User chip */}
          <div style={userChip}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {adminAvatar
                ? <img src={adminAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : firstName.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{firstName}</div>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>Admin</div>
            </div>
          </div>

          <nav>
            <div style={navLink} onClick={() => navigate("/dashboard")}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', marginRight: 10, display: 'inline-block' }} />Dashboard
            </div>
            <div style={navActive}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginRight: 10, display: 'inline-block' }} />Admin Panel
            </div>
            <div style={navLink} onClick={() => navigate("/profile")}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', marginRight: 10, display: 'inline-block' }} />Profile
            </div>
          </nav>
        </div>

        <div>
          <div
            style={themeToggleStyle}
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div style={themeTrack}>
              <div style={{ ...themeThumb, transform: isDark ? 'translateX(0)' : 'translateX(22px)' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>
              {isDark ? "Dark" : "Light"}
            </span>
          </div>
          <button style={logoutBtn} onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}>Logout</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={main}>
        <div className="fade-in-up">
          {/* Header */}
          <div style={pageHeader}>
            <div>
              <h1 style={pageTitle}>Admin Panel</h1>
              <p style={pageSubtitle}>Manage users and monitor system health.</p>
            </div>
          </div>

          {error && <div style={errorBanner}>{error}</div>}
          {actionMsg && <div style={actionMsgType === "success" ? successBanner : errorBanner}>{actionMsg}</div>}

          {/* Stats */}
          {stats && (
            <div style={statsGrid}>
              {[
                { label: "Total Users", value: stats.totalUsers, color: "#7c5cfc" },
                { label: "Completed Profiles", value: stats.completedProfiles, color: "#10b981" },
                { label: "New This Week", value: stats.newUsersThisWeek, color: "#f59e0b" },
                { label: "Admins", value: stats.adminCount, color: "#fc5c7d" },
              ].map(stat => (
                <div key={stat.label} style={statCard} className="card-enter">
                  <div style={{ ...statDot, background: stat.color }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Table */}
          <div style={tableCard}>
            <div style={tableHeader}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Registered Users ({users.length})</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={searchInput}
              />
            </div>

            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>User</th>
                    <th style={th}>Email</th>
                    <th style={th}>Role</th>
                    <th style={th}>School</th>
                    <th style={th}>Joined</th>
                    <th style={{ ...th, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "var(--text-muted)", padding: 32 }}>No users found</td></tr>
                  )}
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ transition: "background 0.15s" }}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ ...avatarSmall, background: u.role === "admin" ? "var(--accent-grad)" : "var(--bg-surface)", overflow: 'hidden' }}>
                            {u.avatarUrl
                              ? <img src={u.avatarUrl.startsWith('http') ? u.avatarUrl : `${BACKEND_URL}${u.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : (u.fullName || u.username || "?").charAt(0).toUpperCase()
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName || u.username}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...td, fontSize: 13 }}>{u.email}</td>
                      <td style={td}>
                        <span style={{ ...roleBadge, background: u.role === "admin" ? "rgba(124,92,252,0.15)" : "rgba(16,185,129,0.15)", color: u.role === "admin" ? "#7c5cfc" : "#10b981" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ ...td, fontSize: 13, color: "var(--text-muted)" }}>{u.school || "—"}</td>
                      <td style={{ ...td, fontSize: 12, color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ ...td, textAlign: "center" }}>
                        {u.id !== user.id ? (
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              style={u.role === "admin" ? demoteBtn : promoteBtn}
                              onClick={() => handleRoleChange(u.id, u.username, u.role === "admin" ? "student" : "admin")}
                            >
                              {u.role === "admin" ? "Demote" : "Promote"}
                            </button>
                            <button style={deleteBtn} onClick={() => handleDelete(u.id, u.username)}>Delete</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;

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
  padding: "12px", borderRadius: "var(--radius-sm)",
  background: "var(--bg-surface)", marginBottom: 20,
};

const navLink: React.CSSProperties = {
  padding: "10px 12px", borderRadius: "var(--radius-sm)",
  cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center",
  color: "var(--text-dim)", marginBottom: 4, fontWeight: 500,
  transition: "background 0.15s, color 0.15s",
};
const navActive: React.CSSProperties = { ...navLink, background: "var(--accent-light)", color: "var(--accent)", fontWeight: 700 };

const themeToggleStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
  padding: "10px 12px", marginBottom: 8, borderRadius: "var(--radius-sm)",
  transition: "background 0.2s",
};
const themeTrack: React.CSSProperties = {
  width: 42, height: 22, borderRadius: 11, background: "var(--bg-surface)",
  border: "1px solid var(--border)", position: "relative", flexShrink: 0,
  transition: "background 0.3s, border-color 0.3s",
};
const themeThumb: React.CSSProperties = {
  width: 16, height: 16, borderRadius: "50%", background: "var(--accent-grad)",
  position: "absolute", top: 2, left: 2,
  transition: "transform 0.3s ease",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

const logoutBtn: React.CSSProperties = {
  display: "flex", alignItems: "center",
  width: "100%", padding: "10px 12px",
  background: "transparent", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const main: React.CSSProperties = {
  flex: 1, padding: "32px 40px", overflow: "auto",
  transition: "background 0.3s",
};

const pageHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28,
};
const pageTitle: React.CSSProperties = {
  fontSize: 26, fontWeight: 800, fontFamily: "var(--font-alt)",
  background: "var(--accent-grad)", WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent", backgroundClip: "text",
};
const pageSubtitle: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)", marginTop: 4 };

const errorBanner: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
  color: "#ef4444", padding: "12px 16px", borderRadius: "var(--radius-sm)",
  fontSize: 13, marginBottom: 16,
};
const successBanner: React.CSSProperties = {
  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
  color: "#10b981", padding: "12px 16px", borderRadius: "var(--radius-sm)",
  fontSize: 13, marginBottom: 16, animation: "fadeIn 0.3s ease",
};

const statsGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28,
};
const statCard: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: "var(--radius)",
  padding: "20px", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", gap: 14,
  transition: "border-color 0.2s, box-shadow 0.2s",
};
const statDot: React.CSSProperties = {
  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
  animation: "pulse 2s ease-in-out infinite",
};

const tableCard: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: "var(--radius)",
  border: "1px solid var(--border)", overflow: "hidden",
};
const tableHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px", borderBottom: "1px solid var(--border)",
};
const searchInput: React.CSSProperties = {
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", padding: "8px 14px",
  fontSize: 13, color: "var(--text)", width: 220,
  outline: "none",
};
const tableWrap: React.CSSProperties = { overflowX: "auto" };
const table: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse",
};
const th: React.CSSProperties = {
  textAlign: "left", padding: "12px 20px",
  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.5px", color: "var(--text-muted)",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg-surface)",
};
const td: React.CSSProperties = {
  padding: "14px 20px", borderBottom: "1px solid var(--border)",
  fontSize: 14, verticalAlign: "middle",
};
const avatarSmall: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
};
const roleBadge: React.CSSProperties = {
  padding: "4px 10px", borderRadius: 20,
  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.3px",
};
const deleteBtn: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
  color: "#ef4444", padding: "6px 12px", borderRadius: "var(--radius-sm)",
  fontSize: 11, fontWeight: 600, cursor: "pointer",
  transition: "background 0.15s",
};
const promoteBtn: React.CSSProperties = {
  background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.3)",
  color: "#7c5cfc", padding: "6px 12px", borderRadius: "var(--radius-sm)",
  fontSize: 11, fontWeight: 600, cursor: "pointer",
  transition: "background 0.15s",
};
const demoteBtn: React.CSSProperties = {
  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
  color: "#f59e0b", padding: "6px 12px", borderRadius: "var(--radius-sm)",
  fontSize: 11, fontWeight: 600, cursor: "pointer",
  transition: "background 0.15s",
};
