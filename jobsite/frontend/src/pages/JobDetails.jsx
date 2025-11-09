// src/pages/JobDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ add useNavigate
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapPin, Clock, DollarSign, Star } from "lucide-react";
import "./JobDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ initialize navigate
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/jobs/${id}`);
        const data = await res.json();
        setJob(data);
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <p>Loading job...</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <>
      <Navbar />
      <main className="job-details-page">
        <div className="job-details-container">
          <img
            src={job.image_url || "https://via.placeholder.com/600x300"}
            alt={job.title}
            className="job-banner"
          />
          <h1>{job.title}</h1>
          <p className="company">{job.company || "Unknown Company"}</p>

          <div className="details">
            <div><MapPin size={16} /> {job.location || "N/A"}</div>
            <div><Clock size={16} /> {job.jobtype || "Full-time"}</div>
            <div><DollarSign size={16} /> AUD {job.salary || "0"}</div>
            <div><Star size={16} /> 4.8 rating</div>
          </div>

          <h3>Description</h3>
          <p>{job.description || "No description available."}</p>

          {job.skills && job.skills.length > 0 && (
            <>
              <h3>Skills</h3>
              <ul>
                {job.skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {/* ✅ Apply Now Button */}
          <button
            className="apply-btn"
            onClick={() => navigate("/you-applied", { state: { job } })}
          >
            Apply Now
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default JobDetails;
