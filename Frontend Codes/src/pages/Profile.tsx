import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, changePassword, uploadAvatar, updateName, BACKEND_URL } from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [message, setMessage]             = useState("");
  const [messageType, setMessageType]     = useState<"success" | "error">("success");
  const [user, setUser]                   = useState<any>(null);

  const [fullName, setFullName]           = useState("");
  const [bio, setBio]                     = useState("");
  const [major, setMajor]                 = useState("");
  const [school, setSchool]               = useState("");
  const [avatarUrl, setAvatarUrl]         = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return "";
    const parsed = JSON.parse(stored);
    return localStorage.getItem(`sp_avatar_${parsed.id}`) || "";
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [passwordMsg, setPasswordMsg]         = useState("");
  const [passwordMsgType, setPasswordMsgType] = useState<"success" | "error">("success");
  const [changingPwd, setChangingPwd]         = useState(false);

  const [activeTab, setActiveTab] = useState<"profile" | "academic" | "security">("profile");

  // Theme state (synced with Dashboard)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("sp_theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("sp_theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setFullName(parsed.fullName || "");

    getProfile(parsed.id)
      .then((res) => {
        if (res.data) {
          setBio(res.data.bio || "");
          setMajor(res.data.major || "");
          setSchool(res.data.school || "");
          if (res.data.avatar_url) {
            const url = res.data.avatar_url.startsWith('http') ? res.data.avatar_url : `${BACKEND_URL}${res.data.avatar_url}`;
            setAvatarUrl(url);
            localStorage.setItem(`sp_avatar_${parsed.id}`, url);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage(text); setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, { bio, major, school });
      if (fullName !== user?.fullName) {
        const res = await updateName({ userId: user.id, newName: fullName });
        if (res.data?.user) {
          const updated = { ...user, fullName: res.data.user.fullName };
          setUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));
        }
      }
      showMsg("Profile saved successfully!", "success");
    } catch {
      showMsg("Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg("Please fill in both fields."); setPasswordMsgType("error"); return;
    }
    setChangingPwd(true); setPasswordMsg("");
    try {
      await changePassword({ userId: user.id, currentPassword, newPassword });
      setPasswordMsg("Password changed successfully!"); setPasswordMsgType("success");
      setCurrentPassword(""); setNewPassword("");
    } catch (err: any) {
      setPasswordMsg(err.response?.data?.message || "Failed to change password."); setPasswordMsgType("error");
    } finally {
      setChangingPwd(false);
      setTimeout(() => setPasswordMsg(""), 4000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(user.id, formData);
      if (res.data?.avatarUrl) {
        const url = `${BACKEND_URL}${res.data.avatarUrl}`;
        setAvatarUrl(url);
        localStorage.setItem(`sp_avatar_${user.id}`, url);
      }
    } catch {
      alert("Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const firstName = user?.fullName?.split(" ")[0] || user?.username || "Student";

  const tabs = [
    { key: "profile",  label: "Profile",    icon: "" },
    { key: "academic", label: "Academic",   icon: "" },
    { key: "security", label: "Security",   icon: "" },
  ];

  return (
    <div style={layout}>
      {/* ── Sidebar ── */}
      <aside style={sidebar}>
        <div>
          <div style={sidebarLogo}>
            <img src="/logo.png" alt="Study Planner" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' as const, filter: 'drop-shadow(0 0 8px rgba(124,92,252,0.3))', animation: 'float 3s ease-in-out infinite' }} />
            <span style={sidebarLogoText}>Study Planner</span>
          </div>

          <div style={userChip}>
            <div style={avatarChipEl}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{firstName}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user?.email}</div>
            </div>
          </div>

          <nav>
            {[
              { label: "Dashboard", tab: "dashboard" },
              { label: "Subjects",  tab: "subjects" },
              { label: "Tasks",     tab: "tasks" },
            ].map(item => (
              <div
                key={item.label}
                style={navLink}
                onClick={() => navigate("/dashboard", { state: { tab: item.tab } })}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', marginRight: 10, display: 'inline-block' }} />{item.label}
              </div>
            ))}
            <div style={navActive} onClick={() => navigate("/profile")}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginRight: 10, display: 'inline-block' }} />Profile
            </div>
          </nav>
        </div>
        <div>
          <div
            style={themeToggle}
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
        <div className="fade-in">
          <div style={pageHeader}>
            <div>
              <h1 style={pageTitle}>Your Profile</h1>
              <p style={pageSubtitle}>Manage your personal details and academic info.</p>
            </div>
          </div>

          {loading ? (
            <div style={loadingBox}>
              <div style={loadingSpinner} />
              <p style={{ color: "var(--text-muted)", marginTop: 12 }}>Loading your profile...</p>
            </div>
          ) : (
            <div style={profileLayout}>
              {/* Left: avatar card */}
              <div style={avatarCard}>
                <div style={avatarWrap}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" style={avatarImg} />
                    : <div style={avatarPlaceholder}>{firstName.charAt(0).toUpperCase()}</div>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, marginTop: 14 }}>{user?.fullName}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>@{user?.username}</div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                <button
                  style={changePicBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading..." : "Change Photo"}
                </button>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>JPG, PNG or GIF · Max 5MB</p>

                <div style={infoChips}>
                  {school && <div style={infoChip}>{school}</div>}
                  {major  && <div style={infoChip}>{major}</div>}
                </div>
              </div>

              {/* Right: tab sections */}
              <div style={{ flex: 1 }}>
                <div style={tabBar}>
                  {tabs.map(t => (
                    <button
                      key={t.key}
                      style={activeTab === t.key ? tabActive : tabBtn}
                      onClick={() => setActiveTab(t.key as any)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={tabContent}>
                  {/* ── Profile Tab ── */}
                  {activeTab === "profile" && (
                    <div className="fade-in">
                      {message && <div style={msgBox(messageType)}>{message}</div>}
                      <div style={fieldGroup}>
                        <label style={labelStyle}>Full Name</label>
                        <input
                          style={inputStyle}
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div style={readOnlyGroup}>
                        <div style={readOnlyItem}>
                          <label style={labelStyle}>Username</label>
                          <div style={readOnlyValue}>@{user?.username}</div>
                        </div>
                        <div style={readOnlyItem}>
                          <label style={labelStyle}>Email</label>
                          <div style={readOnlyValue}>{user?.email}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                        * Username and email cannot be changed.
                      </p>
                      <button style={saving ? btnDisabled : saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}

                  {/* ── Academic Tab ── */}
                  {activeTab === "academic" && (
                    <div className="fade-in">
                      {message && <div style={msgBox(messageType)}>{message}</div>}
                      <div style={fieldGroup}>
                        <label style={labelStyle}>School / University</label>
                        <input
                          style={inputStyle}
                          value={school}
                          onChange={e => setSchool(e.target.value)}
                          placeholder="e.g. State University"
                        />
                      </div>
                      <div style={fieldGroup}>
                        <label style={labelStyle}>Major / Course</label>
                        <input
                          style={inputStyle}
                          value={major}
                          onChange={e => setMajor(e.target.value)}
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      <div style={fieldGroup}>
                        <label style={labelStyle}>Bio</label>
                        <textarea
                          style={textareaStyle}
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder="Share your study goals..."
                          rows={4}
                        />
                      </div>
                      <button style={saving ? btnDisabled : saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Academic Info"}
                      </button>
                    </div>
                  )}

                  {/* ── Security Tab ── */}
                  {activeTab === "security" && (
                    <div className="fade-in">
                      {passwordMsg && <div style={msgBox(passwordMsgType)}>{passwordMsg}</div>}
                      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
                        Choose a strong password to protect your account.
                      </p>
                      <div style={fieldGroup}>
                        <label style={labelStyle}>Current Password</label>
                        <input
                          type="password"
                          style={inputStyle}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div style={fieldGroup}>
                        <label style={labelStyle}>New Password</label>
                        <input
                          type="password"
                          style={inputStyle}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <button
                        style={changingPwd ? btnDisabled : saveBtn}
                        onClick={handlePasswordChange}
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

// ─── Styles ────────────────────────────────────────────────
const layout: React.CSSProperties = { display: "flex", minHeight: "100vh", background: "var(--bg)" };

const sidebar: React.CSSProperties = {
  width: "240px", minWidth: "240px",
  background: "var(--bg-card)", borderRight: "1px solid var(--border)",
  display: "flex", flexDirection: "column", justifyContent: "space-between",
  padding: "24px 16px", position: "sticky", top: 0, height: "100vh",
};
const sidebarLogo: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: "28px", paddingLeft: 4 };
const sidebarLogoText: React.CSSProperties = {
  fontFamily: "var(--font-alt)", fontWeight: 700, fontSize: 17,
  background: "var(--accent-grad)", WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent", backgroundClip: "text",
};
const userChip: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  background: "var(--bg-surface)", borderRadius: "var(--radius)", padding: "10px 12px",
  marginBottom: "20px", border: "1px solid var(--border)",
};
const avatarChipEl: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%", background: "var(--accent-grad)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 700, fontSize: 15, flexShrink: 0, overflow: "hidden",
};
const navLink: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: "10px 12px",
  borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 14,
  color: "var(--text-dim)", marginBottom: 4, fontWeight: 500,
};
const navActive: React.CSSProperties = { ...navLink, background: "var(--accent-light)", color: "var(--accent)", fontWeight: 700 };
const themeToggle: React.CSSProperties = {
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
  display: "flex", alignItems: "center", width: "100%", padding: "10px 12px",
  background: "transparent", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
};
const main: React.CSSProperties = { flex: 1, padding: "36px 40px", overflowY: "auto" };
const pageHeader: React.CSSProperties = { marginBottom: "28px" };
const pageTitle: React.CSSProperties = { fontSize: "26px", fontWeight: 800, marginBottom: 4 };
const pageSubtitle: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)" };

const loadingBox: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" };
const loadingSpinner: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%",
  border: "3px solid var(--bg-surface)", borderTopColor: "var(--accent)",
  animation: "spin 0.8s linear infinite",
};

const profileLayout: React.CSSProperties = { display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" };

const avatarCard: React.CSSProperties = {
  width: 220, background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "28px 20px", textAlign: "center",
  flexShrink: 0,
};
const avatarWrap: React.CSSProperties = {
  width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
  margin: "0 auto", border: "3px solid var(--accent)", boxShadow: "var(--shadow-accent)",
};
const avatarImg: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const avatarPlaceholder: React.CSSProperties = {
  width: "100%", height: "100%", display: "flex", alignItems: "center",
  justifyContent: "center", background: "var(--accent-grad)", fontSize: 38, fontWeight: 800,
};
const changePicBtn: React.CSSProperties = {
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  color: "var(--text)", padding: "8px 14px", borderRadius: "var(--radius-sm)",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const infoChips: React.CSSProperties = { marginTop: 16, display: "flex", flexDirection: "column", gap: 6 };
const infoChip: React.CSSProperties = {
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "var(--text-dim)",
};

const tabBar: React.CSSProperties = {
  display: "flex", gap: 4, marginBottom: 20,
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", padding: 4,
};
const tabBtn: React.CSSProperties = {
  flex: 1, padding: "8px 12px", background: "transparent",
  border: "none", color: "var(--text-muted)", borderRadius: "var(--radius-sm)",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const tabActive: React.CSSProperties = {
  ...tabBtn, background: "var(--accent-grad)", color: "#fff",
};
const tabContent: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "24px",
};

const fieldGroup: React.CSSProperties = { marginBottom: 18 };
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-dim)", marginBottom: 7, letterSpacing: "0.02em",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px",
  background: "var(--bg-surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: 14,
  outline: "none", boxSizing: "border-box",
};
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical" as const };

const readOnlyGroup: React.CSSProperties = { display: "flex", gap: 14, marginBottom: 10 };
const readOnlyItem:  React.CSSProperties = { flex: 1, marginBottom: 16 };
const readOnlyValue: React.CSSProperties = {
  padding: "10px 13px", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--text-muted)",
};

const msgBox = (type: "success" | "error"): React.CSSProperties => ({
  padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 16,
  background: type === "success" ? "rgba(16,185,129,0.1)" : "rgba(252,92,125,0.1)",
  border: `1px solid ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(252,92,125,0.3)"}`,
  color: type === "success" ? "#6ee7b7" : "#fc8fa3",
});

const saveBtn: React.CSSProperties = {
  width: "100%", padding: "12px",
  background: "var(--accent-grad)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff",
  fontSize: 15, fontWeight: 700, boxShadow: "var(--shadow-accent)",
};
const btnDisabled: React.CSSProperties = { ...saveBtn, opacity: 0.6, cursor: "not-allowed" };

export default Profile;
