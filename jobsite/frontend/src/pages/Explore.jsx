// src/pages/Explore.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Heart, Star, Clock, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import './Explore.css';

const Explore = () => {
  const [favorites, setFavorites] = useState(new Set());
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); // ✅ for confirmation message
  const location = useLocation();

  // 🧠 Get search query from URL (?search=developer)
  const query = new URLSearchParams(location.search).get('search');
  const API_URL = import.meta.env.VITE_API_URL;


  // 💾 Fetch jobs when query changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setLoaded(false);
      try {
        const endpoint = query
          ? `${API_URL}/api/jobs/search?q=${encodeURIComponent(query)}`
          : `${API_URL}/api/jobs`;

        const res = await fetch(endpoint);
        const data = await res.json();
        setJobs(data);
        setLoaded(true);
      } catch (error) {
        console.error('❌ Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [query]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation(); // ✅ prevent click from opening job details
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) newFavorites.delete(id);
    else newFavorites.add(id);
    setFavorites(newFavorites);
  };

  return (
    <>
      <Navbar />

      <main className="explore-page">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              {query
                ? `Search results for "${query}"`
                : 'Popular sideline jobs'}
            </h2>
            <a href="#" className="section-link">
              Show all
            </a>
          </div>

          {loading ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <>
              <div className="job-grid">
                {jobs.map((job) => (
                  <div
                    className="job-card"
                    key={job.id}
                    onClick={() => (window.location.href = `/job/${job.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="job-image-container">
                      <img
                        src={job.image_url || 'https://via.placeholder.com/400x224'}
                        alt={job.title}
                        className="job-image"
                      />
                      <button
                        className="favorite-btn"
                        onClick={(e) => toggleFavorite(job.id, e)}
                      >
                        <Heart
                          size={16}
                          className={`favorite-icon ${
                            favorites.has(job.id) ? 'active' : 'inactive'
                          }`}
                        />
                      </button>
                      {job.is_featured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>

                    <div className="job-content">
                      <div className="job-header">
                        <h3 className="job-title">{job.title}</h3>
                        <div className="job-rating">
                          <Star size={16} className="star-icon" />
                          <span className="rating-text">4.8</span>
                        </div>
                      </div>

                      <p className="job-company">{job.company || 'Unknown Company'}</p>

                      <div className="job-details">
                        <div className="job-detail">
                          <MapPin size={16} className="detail-icon" />
                          <span className="detail-text">
                            {job.location || 'Metro Manila'}
                          </span>
                        </div>
                        <div className="job-detail">
                          <Clock size={16} className="detail-icon" />
                          <span className="detail-text">
                            {job.jobtype || 'Full-time'}
                          </span>
                        </div>
                        <div className="job-detail">
                          <DollarSign size={16} className="detail-icon" />
                          <span className="detail-text salary">
                            {job.salary ? `${job.salary} AUD` : '0 AUD'}
                          </span>
                        </div>
                      </div>

                      {/* Job Skills / Tags */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="job-tags">
                          {Array.isArray(job.skills)
                            ? job.skills.map((skill, index) => (
                                <span key={index} className="job-tag">
                                  {skill}
                                </span>
                              ))
                            : null}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Final confirmation snippet */}
              {loaded && (
                <div className="confirmation-message">
                  <CheckCircle size={20} className="confirm-icon" />
                  <span>All jobs loaded successfully!</span>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Explore;
