import { useState } from "react";
import toast from "react-hot-toast";
import { updateProfileAPI, changePasswordAPI } from "../api/auth";
import { useAuthStore } from "../context/authStore";
import { CATEGORIES } from "../utils/constants";

export default function Settings() {
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    currency: user?.currency || "INR",
    monthlyBudget: user?.monthlyBudget || "",
  });

  const [customCat, setCustomCat] = useState("");
  const [customCategories, setCustomCategories] = useState(user?.customCategories || []);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await updateProfileAPI({
        ...profile,
        monthlyBudget: Number(profile.monthlyBudget) || 0,
        customCategories,
      });
      updateUser(res.data.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.error("Fill all password fields");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePasswordAPI({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const addCustomCategory = () => {
    const trimmed = customCat.trim();
    if (!trimmed) return;
    if (CATEGORIES.includes(trimmed) || customCategories.includes(trimmed)) {
      toast.error("Category already exists");
      return;
    }
    setCustomCategories([...customCategories, trimmed]);
    setCustomCat("");
  };

  const removeCustomCategory = (cat) => {
    setCustomCategories(customCategories.filter((c) => c !== cat));
  };

  const currencies = [
    { value: "INR", label: "INR — Indian Rupee" },
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — British Pound" },
    { value: "JPY", label: "JPY — Japanese Yen" },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile & Preferences</h2>
          <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className="input"
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Your name"
              />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Currency</label>
                <select className="input" name="currency" value={profile.currency} onChange={handleProfileChange}>
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Monthly Budget</label>
                <input
                  className="input"
                  type="number"
                  name="monthlyBudget"
                  value={profile.monthlyBudget}
                  onChange={handleProfileChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div style={{
              padding: "12px 14px",
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              fontSize: 13,
              color: "var(--text-secondary)",
            }}>
              Budget alerts will show on your dashboard when monthly spending exceeds your set limit.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? (
                  <><div className="spinner" style={{ width: 14, height: 14 }} />Saving...</>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Custom Categories</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Add your own categories alongside the default ones
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              className="input"
              type="text"
              placeholder="New category name"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCategory())}
            />
            <button className="btn btn-primary" onClick={addCustomCategory} style={{ flexShrink: 0 }}>
              Add
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Default Categories
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((c) => (
                <span key={c} className="badge badge-gray">{c}</span>
              ))}
            </div>
          </div>

          {customCategories.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Custom Categories
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {customCategories.map((c) => (
                  <div key={c} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px",
                    background: "var(--accent-soft)",
                    border: "1px solid rgba(79,124,255,0.2)",
                    borderRadius: "var(--radius-full)",
                    fontSize: 12, fontWeight: 500, color: "var(--accent-primary)",
                  }}>
                    {c}
                    <button
                      onClick={() => removeCustomCategory(c)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-primary)", display: "flex", padding: 0, lineHeight: 1 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary"
              onClick={async () => {
                setProfileLoading(true);
                try {
                  const res = await updateProfileAPI({ ...profile, monthlyBudget: Number(profile.monthlyBudget) || 0, customCategories });
                  updateUser(res.data.data);
                  toast.success("Categories saved");
                } catch {
                  toast.error("Failed to save");
                } finally {
                  setProfileLoading(false);
                }
              }}
              disabled={profileLoading}
            >
              Save Categories
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Change Password</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            Make sure your new password is at least 6 characters
          </p>
          <form onSubmit={handlePasswordSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Current Password</label>
              <input
                className="input"
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">New Password</label>
                <input
                  className="input"
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                {passwordLoading ? (
                  <><div className="spinner" style={{ width: 14, height: 14 }} />Updating...</>
                ) : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ border: "1px solid rgba(244,63,94,0.2)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>Account Info</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Your account details
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Name", value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}