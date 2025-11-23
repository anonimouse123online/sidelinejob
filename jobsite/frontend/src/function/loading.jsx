// Loading.jsx
import React from 'react';
import Navbar from '../components/Navbar'; // Import your Navbar
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <Navbar />
      <div className="loading-overlay">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading, please wait...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;