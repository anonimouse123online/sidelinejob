// src/pages/FindWork.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import './FindWork.css';

const FindWork = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      !locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCategory =
      !categoryFilter || categoryFilter === 'All' || job.category === categoryFilter;

    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <div className="findwork-container">
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          Find Your Perfect <span className="hero-accent">Sideline</span>
        </h1>
        <p className="hero-subtitle">
          Discover opportunities that fit your lifestyle and skills
        </p>

        <div className="hero-actions desktop-only">
          <button className="action-btn find-jobs-btn">
            Find Jobs
          </button>
          <button
            className="action-btn post-job-btn"
            onClick={() => navigate('/post-job')}
          >
            Post a Job
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <div className="results-header">
          <h2 className="results-title">
            {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs found`}
          </h2>
          <div className="results-subtitle">
            Showing results for "{searchTerm || 'all jobs'}"
          </div>
        </div>

        {/* Error */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Job Listings */}
        <div className="job-listings">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="job-card"
              onClick={() => (window.location.href = `/job/${job.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="job-content">
                <div className="job-header">
                  <div className="company-logo">{job.logo || '🏢'}</div>
                  <div className="job-details">
                    <div className="job-main">
                      <div className="job-info">
                        <h3 className="job-title">{job.title}</h3>
                        <div className="company-info">
                          <Briefcase className="company-icon" />
                          <span className="company-name">{job.company}</span>
                          <span className="separator">•</span>
                          <div className="rating">
                            <Star className="rating-star" />
                            <span className="rating-value">{job.rating || 'N/A'}</span>
                            <span className="rating-reviews">({job.reviews || 0})</span>
                          </div>
                        </div>

                        <div className="job-meta">
                          <div className="meta-item">
                            <MapPin className="meta-icon" />
                            <span>{job.location || 'N/A'}</span>
                          </div>
                          <div className="meta-item">
                            <Clock className="meta-icon" />
                            <span>{job.job_type || 'N/A'}</span>
                          </div>
                          <div className="meta-item">
                            <DollarSign className="meta-icon" />
                            <span>
                              {job.min_budget && job.max_budget
                                ? `$${job.min_budget} - $${job.max_budget}`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <p className="job-description">{job.description}</p>

                        <div className="job-footer">
                          <div className="job-tags">
                            <span
                              className={`category-badge category-${job.category?.toLowerCase() || 'general'}`}
                            >
                              {job.category || 'General'}
                            </span>
                            <span className="posted-time">
                              Posted {job.postedTime || 'Recently'}
                            </span>
                          </div>

                          <button
                            className="apply-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card redirect
                              alert(`Applied for ${job.title}`);
                            }}
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {!loading && filteredJobs.length > 0 && (
          <div className="load-more-section">
            <button className="load-more-btn">Load More Jobs</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindWork;
