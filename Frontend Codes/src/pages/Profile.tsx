import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, changePassword, uploadAvatar, updateName } from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Profile specific fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [major, setMajor] = useState("");
  const [school, setSchool] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const userDataPath = localStorage.getItem("user");
    if (!userDataPath) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userDataPath);
    setUser(parsedUser);
    setFullName(parsedUser.fullName || "");

    // Fetch the profile data for this user
    getProfile(parsedUser.id)
      .then((res) => {
        if (res.data) {
          setBio(res.data.bio || "");
          setMajor(res.data.major || "");
          setSchool(res.data.school || "");
          setAvatarUrl(res.data.avatar_url ? `http://localhost:5000${res.data.avatar_url}` : "");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      // 1. Save Profile Data
      await updateProfile(user.id, { bio, major, school });

      // 2. Save Name Data if changed
      if (fullName !== user?.fullName) {
        const res = await updateName({ userId: user.id, newName: fullName });
        if (res.data?.user) {
          const updatedUser = { ...user, fullName: res.data.user.fullName };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      setMessage("Profile saved successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please fill in both password fields.");
      return;
    }
    
    setChangingPassword(true);
    setPasswordMessage("");
    try {
      await changePassword({ 
        userId: user.id, 
        currentPassword, 
        newPassword 
      });
      setPasswordMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error("Error changing password", err);
      setPasswordMessage(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
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
        setAvatarUrl(`http://localhost:5000${res.data.avatarUrl}`);
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={layout}>
      {/* Sidebar navigation duplicating the dashboard to maintain immersion */}
      <aside style={sidebar}>
        <h2 style={logoText}>Study Planner</h2>
        <nav style={navLinks}>
          <div style={navItem} onClick={() => navigate("/dashboard")}>Dashboard</div>
          <div style={navItem}>Subjects</div>
          <div style={navItem}>Tasks</div>
          <div style={activeLink}>Profile</div>
        </nav>
        <button style={logoutBtn} onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
        }}>
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={mainContent}>
        <header style={welcomeHeader}>
          <h1>Your Profile</h1>
          <p style={{ color: "#666" }}>Manage your personal details and academic info here.</p>
        </header>

        <section style={cardConfig}>
          {loading ? (
            <p>Loading profile...</p>
          ) : (
             <>
                <div style={avatarSection}>
                  <div style={avatarImageContainer}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={avatarImage} />
                    ) : (
                      <div style={avatarPlaceholder}>
                         {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div style={avatarControls}>
                     <input 
                       type="file" 
                       accept="image/*" 
                       ref={fileInputRef}
                       style={{ display: "none" }}
                       onChange={handleFileChange}
                     />
                     <button 
                       style={uploadAvatarBtn} 
                       onClick={triggerFileInput}
                       disabled={uploadingAvatar}
                     >
                       {uploadingAvatar ? "Uploading..." : "Change Photo"}
                     </button>
                     <p style={{fontSize: 12, color: "#888", marginTop: 5}}>JPG, GIF or PNG. Max size of 5MB.</p>
                  </div>
                </div>
             
                <h3 style={{marginBottom: 15}}>Personal Details</h3>
                <div style={readOnlySection}>
                  
                  <label style={label}>Full Name</label>
                  <input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter full name"
                  />

                  <p><strong>Username:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p style={{fontSize: 12, color: "#888", marginTop: 5}}>
                     *Username and Email cannot be changed.
                  </p>
                </div>
                
                <hr style={divider} />
                
                <h3 style={{marginBottom: 15}}>Academic Profile</h3>
                
                {message && (
                  <div style={{
                     padding: 10, 
                     marginBottom: 15, 
                     borderRadius: 6, 
                     backgroundColor: message.includes('success') ? '#064e3b' : '#7f1d1d',
                     color: message.includes('success') ? '#34d399' : '#fca5a5'
                  }}>
                    {message}
                  </div>
                )}
                
                <label style={label}>School / University</label>
                <input 
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  style={inputStyle}
                  placeholder="E.g. State University"
                />

                <label style={label}>Major / Course</label>
                <input 
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  style={inputStyle}
                  placeholder="E.g. Computer Science"
                />

                <label style={label}>Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={textareaStyle}
                  placeholder="Tell us about your study goals..."
                  rows={4}
                />

                <button 
                  style={saving ? disabledBtn : saveBtn} 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                
                <hr style={divider} />
                
                <h3 style={{marginBottom: 15}}>Security</h3>
                
                {passwordMessage && (
                  <div style={{
                     padding: 10, 
                     marginBottom: 15, 
                     borderRadius: 6, 
                     backgroundColor: passwordMessage.includes('success') ? '#064e3b' : '#7f1d1d',
                     color: passwordMessage.includes('success') ? '#34d399' : '#fca5a5'
                  }}>
                    {passwordMessage}
                  </div>
                )}
                
                <label style={label}>Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter current password"
                />

                <label style={label}>New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter new password"
                />
                
                <button 
                  style={changingPassword ? disabledBtn : saveBtn} 
                  onClick={handlePasswordChange} 
                  disabled={changingPassword}
                >
                  {changingPassword ? "Updating..." : "Change Password"}
                </button>
             </>
          )}
        </section>
      </main>
    </div>
  );
}

// ------------- STYLES -------------
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

const navLinks: React.CSSProperties = { flex: 1 };

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

const logoutBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #666",
  color: "#AAA",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const mainContent: React.CSSProperties = {
  flex: 1,
  padding: "40px",
  overflowY: "auto",
};

const welcomeHeader: React.CSSProperties = { marginBottom: "30px" };

const cardConfig: React.CSSProperties = {
  backgroundColor: "#333",
  color: "#EEE",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  maxWidth: "600px"
};

const avatarSection: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "25px",
  gap: "20px"
};

const avatarImageContainer: React.CSSProperties = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  overflow: "hidden",
  backgroundColor: "#555",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
};

const avatarPlaceholder: React.CSSProperties = {
  color: "#FFF",
  fontSize: "36px",
  fontWeight: "bold"
};

const avatarImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const avatarControls: React.CSSProperties = {
  display: "flex",
  flexDirection: "column"
};

const uploadAvatarBtn: React.CSSProperties = {
  backgroundColor: "#444",
  color: "#EEE",
  border: "1px solid #666",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  width: "fit-content"
};

const readOnlySection: React.CSSProperties = {
  backgroundColor: "#2a2a2a",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const divider: React.CSSProperties = {
  borderColor: "#444",
  borderStyle: "solid",
  borderWidth: "1px 0 0 0",
  margin: "25px 0"
};

const label: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#ccc",
  fontSize: "14px",
  fontWeight: "bold"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "6px",
  border: "1px solid #555",
  backgroundColor: "#444",
  color: "#EEE",
  boxSizing: "border-box"
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical"
};

const saveBtn: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "#FFF",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  width: "100%",
  marginTop: "10px"
};

const disabledBtn: React.CSSProperties = {
  ...saveBtn,
  backgroundColor: "#555",
  cursor: "not-allowed"
};

export default Profile;
