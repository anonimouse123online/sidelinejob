// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.email) throw new Error("Please log in first.");

        const res = await fetch(`${API_URL}/api/profile?email=${storedUser.email}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
        setUserProfile(data.user);
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle profile info edits
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert("Save feature not implemented yet.");
    setIsEditing(false);
  };

  // Handle profile picture upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.email) {
      setError("User not found. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("user", JSON.stringify({ email: storedUser.email }));

    try {
      setUploading(true);
      const res = await fetch("${API_URL}/api/profile/pic", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload profile picture");

      setUserProfile((prev) => ({
        ...prev,
        profile_pic: data.profilePic,
      }));
      alert("✅ Profile picture updated successfully!");
    } catch (err) {
      console.error("Profile pic upload error:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-container">
          <div className="loading-card">
            <p>⏳ Loading your profile...</p>
          </div>
        </main>
      </div>
    );

  if (error)
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-container">
          <div className="error-card">
            <h2>⚠️ Oops!</h2>
            <p>{error}</p>
            <button className="login-btn" onClick={() => (window.location.href = "/login")}>
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );

  if (!userProfile)
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-container">
          <div className="info-card">
            <p>No profile data available.</p>
          </div>
        </main>
      </div>
    );

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={
                userProfile.profilePic
                  ? `${API_URL}${userProfile.profilePic}`
                  : "https://via.placeholder.com/150"
              }
              alt="User avatar"
              className="profile-avatar"
            />
            <div className="profile-info">
              <h1 className="profile-name">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <p className="profile-email">📧 {userProfile.email}</p>
              <p className="profile-phone">📱 {userProfile.phone || "—"}</p>

              <label htmlFor="profilePicInput" className="upload-btn">
                {uploading ? "Uploading..." : "Change Profile Picture"}
              </label>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={{ display: "none" }}
                disabled={uploading}
              />

              {/* Logout Button */}
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2>Account Info</h2>
            </div>
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-form">
                <input
                  type="text"
                  name="firstName"
                  value={userProfile.firstName || ""}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="input-field"
                />
                <input
                  type="text"
                  name="lastName"
                  value={userProfile.lastName || ""}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="input-field"
                />
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info-list">
                <p>
                  <strong>First Name:</strong> {userProfile.firstName}
                </p>
                <p>
                  <strong>Last Name:</strong> {userProfile.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {userProfile.email}
                </p>
                <p>
                  <strong>Phone:</strong> {userProfile.phone || "—"}
                </p>
              </div>
            )}
          </div>

          {/* ✅ Removed "Applied Jobs" Section */}
          <div className="profile-section">
            <h2>My Listings</h2>
            <p className="coming-soon">🔜 Coming soon</p>
          </div>

          <div className="profile-section">
            <h2>Reviews</h2>
            <p className="coming-soon">🔜 Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
