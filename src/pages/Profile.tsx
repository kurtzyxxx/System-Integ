import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, changePassword, uploadAvatar, updateName, BACKEND_URL } from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

export default function Profile() {
  const navigate    = useNavigate();
  const fileRef     = useRef<HTMLInputElement>(null);

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // ── All identity state initialised SYNCHRONOUSLY — zero first-render flash ──
  const [user, setUser] = useState<any>(() => {
    try { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [fullName, setFullName] = useState<string>(() => {
    try { const s = localStorage.getItem("user"); return s ? (JSON.parse(s).fullName || "") : ""; }
    catch { return ""; }
  });

  const [bio,      setBio]      = useState("");
  const [major,    setMajor]    = useState("");
  const [school,   setSchool]   = useState("");
  const [avatar, setAvatar] = useState<string>(() => {
    try {
      const s = localStorage.getItem("user");
      if (!s) return "";
      const u = JSON.parse(s);
      const key = u.username || u.id || "default";
      return localStorage.getItem(`sp_avatar_${key}`) || "";
    } catch { return ""; }
  });
  const [uploading,setUploading]= useState(false);

  const [curPwd,   setCurPwd]   = useState("");
  const [newPwd,   setNewPwd]   = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg,   setPwdMsg]   = useState({ text: "", ok: true });
  const [changingPwd, setChangingPwd] = useState(false);

  // Password strength (0-4)
  const pwdStrength = (p: string): number => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p))    score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  };
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["#f43f5e", "#f43f5e", "#f59e0b", "#3b82f6", "#10b981"];

  const [msg,  setMsg]  = useState({ text: "", ok: true });
  const [tab,  setTab]  = useState<"profile"|"academic"|"security">("profile");

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (!s) { navigate("/login"); return; }
    const u = JSON.parse(s);
    // Only update if changed (avoids extra re-render)
    setUser(u); setFullName(u.fullName || "");
    const key = u.username || u.id || "default";
    const cached = localStorage.getItem(`sp_avatar_${key}`);
    if (cached) setAvatar(cached);

    getProfile(u.id)
      .then(res => {
        if (res.data) {
          setBio(res.data.bio || "");
          setMajor(res.data.major || "");
          setSchool(res.data.school || "");
          if (res.data.avatar_url) {
            const url = `${BACKEND_URL}${res.data.avatar_url}`;
            setAvatar(url);
            // Keep localStorage in sync with server
            localStorage.setItem(`sp_avatar_${key}`, url);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };
  const flashPwd = (text: string, ok: boolean) => {
    setPwdMsg({ text, ok });
    setTimeout(() => setPwdMsg({ text: "", ok: true }), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, { bio, major, school });
      if (fullName !== user?.fullName) {
        const r = await updateName({ userId: user.id, newName: fullName });
        if (r.data?.user) {
          const u2 = { ...user, fullName: r.data.user.fullName };
          setUser(u2); localStorage.setItem("user", JSON.stringify(u2));
        }
      }
      flash("Changes saved successfully.", true);
    } catch { flash("Failed to save changes.", false); }
    finally   { setSaving(false); }
  };

  const handlePwdChange = async () => {
    // ── Frontend validations ──
    if (!curPwd || !newPwd || !confirmPwd) {
      flashPwd("Please fill in all password fields.", false); return;
    }
    if (curPwd === newPwd) {
      flashPwd("New password must be different from your current password.", false); return;
    }
    if (newPwd.length < 8) {
      flashPwd("New password must be at least 8 characters.", false); return;
    }
    if (newPwd !== confirmPwd) {
      flashPwd("New password and confirmation do not match.", false); return;
    }
    setChangingPwd(true);
    try {
      await changePassword({ userId: user.id, currentPassword: curPwd, newPassword: newPwd });
      flashPwd("Password updated successfully!", true);
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (e: any) {
      flashPwd(e.response?.data?.message || "Incorrect current password.", false);
    } finally { setChangingPwd(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    setUploading(true);
    try {
      const r = await uploadAvatar(user.id, fd);
      if (r.data?.avatarUrl) {
        const url = `${BACKEND_URL}${r.data.avatarUrl}`;
        setAvatar(url);
        // Persist per-user so Dashboard sidebar shows the updated avatar
        const key = user.username || user.id || "default";
        localStorage.setItem(`sp_avatar_${key}`, url);
      }
    } catch { alert("Upload failed."); }
    finally   { setUploading(false); }
  };

  const firstName = user?.fullName?.split(" ")[0] || user?.username || "Student";
  const TABS = [
    { key: "profile",  label: "Personal" },
    { key: "academic", label: "Academic" },
    { key: "security", label: "Security" },
  ];

  return (
    <div style={layout}>
      {/* ── Sidebar ── */}
      <aside style={sidebar}>
        <div>
          <div style={brand}>
            <img src="/logo.png" alt="logo" style={logoImg} />
            <span style={brandLabel}>Study Planner</span>
          </div>

          <div style={userPill}>
            <div style={avatarEl}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : firstName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={userName}>{user?.fullName || firstName}</div>
              <div style={userEmail}>{user?.email}</div>
            </div>
          </div>

          <nav>
            <div style={navSection}>MAIN</div>
            {[
              { label: "Dashboard", tab: "dashboard" },
              { label: "Subjects",  tab: "subjects"  },
              { label: "Tasks",     tab: "tasks"     },
            ].map(n => (
              <div key={n.label} style={navItem} onClick={() => navigate("/dashboard", { state: { tab: n.tab } })}>{n.label}</div>
            ))}
            <div style={navItemActive}>
              <div style={navIndicator} />
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
        <div className="fade-in">
          <div style={pageHead}>
            <div>
              <h1 style={pageTitle}>Profile</h1>
              <p style={pageSub}>Manage your personal and academic details.</p>
            </div>
          </div>

          {loading ? (
            <div style={loadingBox}>
              <div style={spinner} />
              <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 14 }}>Loading profile...</p>
            </div>
          ) : (
            <div style={profileLayout}>
              {/* Avatar card */}
              <div style={avatarCard}>
                <div style={avatarWrap}>
                  {avatar
                    ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={avatarInitial}>{firstName.charAt(0).toUpperCase()}</div>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 14, color: "var(--text)" }}>{user?.fullName}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>@{user?.username}</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                <button style={changePicBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading..." : "Change Photo"}
                </button>
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>JPG, PNG or GIF · Max 5MB</p>
                {(school || major) && (
                  <div style={{ marginTop: 18, width: "100%" }}>
                    {school && <div style={infoChip}>{school}</div>}
                    {major  && <div style={infoChip}>{major}</div>}
                  </div>
                )}
              </div>

              {/* Tab section */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={tabBar}>
                  {TABS.map(t => (
                    <button key={t.key} style={tab === t.key ? tabActive : tabBtn} onClick={() => setTab(t.key as any)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={tabContent}>
                  {/* Personal */}
                  {tab === "profile" && (
                    <div className="fade-in">
                      {msg.text && <div style={msgBox(msg.ok)}>{msg.text}</div>}
                      <div style={fGroup}>
                        <label style={fLabel}>Full Name</label>
                        <input style={fInput} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                      </div>
                      <div style={readRow}>
                        <div style={readItem}>
                          <label style={fLabel}>Username</label>
                          <div style={readVal}>@{user?.username}</div>
                        </div>
                        <div style={readItem}>
                          <label style={fLabel}>Email</label>
                          <div style={readVal}>{user?.email}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>Username and email cannot be changed.</p>
                      <button style={saving ? saveBtnOff : saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}

                  {/* Academic */}
                  {tab === "academic" && (
                    <div className="fade-in">
                      {msg.text && <div style={msgBox(msg.ok)}>{msg.text}</div>}
                      <div style={fGroup}>
                        <label style={fLabel}>School / University</label>
                        <input style={fInput} value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. State University" />
                      </div>
                      <div style={fGroup}>
                        <label style={fLabel}>Major / Course</label>
                        <input style={fInput} value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Computer Science" />
                      </div>
                      <div style={fGroup}>
                        <label style={fLabel}>Bio</label>
                        <textarea style={fTextarea} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your study goals..." rows={4} />
                      </div>
                      <button style={saving ? saveBtnOff : saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Academic Info"}
                      </button>
                    </div>
                  )}

                  {/* Security */}
                  {tab === "security" && (
                    <div className="fade-in">
                      {pwdMsg.text && <div style={msgBox(pwdMsg.ok)}>{pwdMsg.text}</div>}
                      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Keep your account secure with a strong password.</p>

                      <div style={fGroup}>
                        <label style={fLabel}>Current Password</label>
                        <input
                          id="current-password"
                          type="password" style={fInput}
                          value={curPwd}
                          onChange={e => setCurPwd(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>

                      <div style={fGroup}>
                        <label style={fLabel}>New Password</label>
                        <input
                          id="new-password"
                          type="password" style={{
                            ...fInput,
                            borderColor: newPwd && curPwd === newPwd ? "#f43f5e" : undefined,
                          }}
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          placeholder="Min. 8 characters"
                        />
                        {/* Inline warning if same as current */}
                        {newPwd && curPwd && curPwd === newPwd && (
                          <p style={{ fontSize: 12, color: "#f43f5e", marginTop: 5, fontWeight: 600 }}>
                            Must be different from your current password.
                          </p>
                        )}
                        {/* Strength bar */}
                        {newPwd.length > 0 && (() => {
                          const s = pwdStrength(newPwd);
                          return (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                                {[0,1,2,3].map(i => (
                                  <div key={i} style={{
                                    flex: 1, height: 4, borderRadius: 2,
                                    background: i < s ? strengthColor[s] : "var(--border)",
                                    transition: "background 0.25s",
                                  }} />
                                ))}
                              </div>
                              <span style={{ fontSize: 11, color: strengthColor[s], fontWeight: 600 }}>
                                {strengthLabel[s]}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      <div style={fGroup}>
                        <label style={fLabel}>Confirm New Password</label>
                        <input
                          id="confirm-password"
                          type="password" style={{
                            ...fInput,
                            borderColor: confirmPwd && confirmPwd !== newPwd ? "#f43f5e" : confirmPwd && confirmPwd === newPwd ? "#10b981" : undefined,
                          }}
                          value={confirmPwd}
                          onChange={e => setConfirmPwd(e.target.value)}
                          placeholder="Re-enter new password"
                        />
                        {confirmPwd && confirmPwd !== newPwd && (
                          <p style={{ fontSize: 12, color: "#f43f5e", marginTop: 5, fontWeight: 600 }}>Passwords do not match.</p>
                        )}
                        {confirmPwd && confirmPwd === newPwd && (
                          <p style={{ fontSize: 12, color: "#10b981", marginTop: 5, fontWeight: 600 }}>Passwords match ✓</p>
                        )}
                      </div>

                      <button
                        id="update-password-btn"
                        style={changingPwd ? saveBtnOff : saveBtn}
                        onClick={handlePwdChange}
                        disabled={changingPwd}
                      >
                        {changingPwd ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Styles ─── */
const layout: React.CSSProperties = { display: "flex", minHeight: "100vh" };

const sidebar: React.CSSProperties = {
  width: "240px", minWidth: "240px", background: "var(--sidebar)",
  display: "flex", flexDirection: "column", justifyContent: "space-between",
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
const avatarEl: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "50%", overflow: "hidden",
  background: "var(--accent-grad)", display: "flex",
  alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0,
};
const userName: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const userEmail: React.CSSProperties = { fontSize: 11, color: "var(--text-sidebar-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const navSection: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--text-sidebar-muted)", letterSpacing: "0.1em", padding: "0 12px", marginBottom: 6 };
const navItem: React.CSSProperties = {
  padding: "9px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer",
  fontSize: 13, fontWeight: 500, color: "var(--text-sidebar)", marginBottom: 2,
};
const navItemActive: React.CSSProperties = {
  ...navItem, background: "rgba(91,108,249,0.18)", color: "#fff",
  fontWeight: 600, position: "relative",
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
const pageHead: React.CSSProperties = { marginBottom: 28 };
const pageTitle: React.CSSProperties = { fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 3 };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)" };

const loadingBox: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" };
const spinner: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.7s linear infinite" };

const profileLayout: React.CSSProperties = { display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" };

const avatarCard: React.CSSProperties = {
  width: 210, background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "28px 20px", textAlign: "center",
  boxShadow: "var(--shadow-sm)", flexShrink: 0,
};
const avatarWrap: React.CSSProperties = {
  width: 88, height: 88, borderRadius: "50%", overflow: "hidden",
  margin: "0 auto", border: "3px solid var(--accent)",
};
const avatarInitial: React.CSSProperties = {
  width: "100%", height: "100%", display: "flex",
  alignItems: "center", justifyContent: "center",
  background: "var(--accent-grad)", fontSize: 34, fontWeight: 800, color: "#fff",
};
const changePicBtn: React.CSSProperties = {
  background: "var(--bg)", border: "1.5px solid var(--border)",
  color: "var(--text)", padding: "8px 14px", borderRadius: "var(--radius-sm)",
  fontSize: 13, fontWeight: 600,
};
const infoChip: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 20, padding: "4px 10px",
  fontSize: 12, color: "var(--text-muted)", marginBottom: 6,
};

const tabBar: React.CSSProperties = {
  display: "flex", gap: 2, marginBottom: 16,
  background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", padding: 3,
};
const tabBtn: React.CSSProperties = {
  flex: 1, padding: "8px 10px", background: "transparent",
  border: "none", color: "var(--text-muted)",
  borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 600,
};
const tabActive: React.CSSProperties = {
  ...tabBtn, background: "var(--bg-white)", color: "var(--text)",
  boxShadow: "var(--shadow-sm)",
};
const tabContent: React.CSSProperties = {
  background: "var(--bg-white)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "24px",
  boxShadow: "var(--shadow-sm)",
};

const fGroup: React.CSSProperties = { marginBottom: 18 };
const fLabel: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 7, letterSpacing: "0.01em" };
const fInput: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "var(--bg)", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)",
  fontSize: 14, boxSizing: "border-box",
};
const fTextarea: React.CSSProperties = { ...fInput, resize: "vertical" as const };

const readRow: React.CSSProperties = { display: "flex", gap: 14, marginBottom: 10 };
const readItem: React.CSSProperties = { flex: 1 };
const readVal: React.CSSProperties = {
  padding: "9px 13px", background: "var(--bg-muted)",
  border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
  fontSize: 14, color: "var(--text-muted)",
};

const msgBox = (ok: boolean): React.CSSProperties => ({
  padding: "10px 14px", borderRadius: "var(--radius-sm)",
  fontSize: 13, marginBottom: 18,
  background: ok ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)",
  border: `1px solid ${ok ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
  color: ok ? "#0d9461" : "#e11d48",
});

const saveBtn: React.CSSProperties = {
  width: "100%", padding: "11px",
  background: "var(--accent-grad)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff",
  fontSize: 14, fontWeight: 700,
  boxShadow: "0 4px 14px rgba(91,108,249,0.25)",
};
const saveBtnOff: React.CSSProperties = { ...saveBtn, opacity: 0.55, cursor: "not-allowed" };
