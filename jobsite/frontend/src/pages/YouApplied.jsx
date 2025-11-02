// src/pages/YouApplied.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./YouApplied.css";

const YouApplied = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Job info passed from the Apply Now button
  const job = location.state?.job;

  return (
    <div className="youapplied-container">
      <Navbar />

      {job ? (
        <div className="youapplied-card">
          <h1>🎉 You applied for:</h1>
          <h2 className="job-title">{job.title}</h2>
          <p className="company">{job.company}</p>

          <div className="job-meta">
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Type:</strong> {job.job_type}</p>
            <p><strong>Budget:</strong> ${job.min_budget} - ${job.max_budget}</p>
          </div>

          <p className="thanks">
            Thank you for applying! The employer will review your application soon.
          </p>

          <button className="back-btn" onClick={() => navigate("/find-work")}>
            🔙 Back to Jobs
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          No job selected.
        </p>
      )}
    </div>
  );
};

export default YouApplied;
