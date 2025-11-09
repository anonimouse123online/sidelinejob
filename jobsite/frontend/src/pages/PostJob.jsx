// src/pages/PostJob.jsx
import React, { useState } from 'react';
import { 
  MapPin, Clock, DollarSign, Briefcase, 
  Mail, Calendar, Plus, HelpCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './PostJob.css';
import { useNavigate } from 'react-router-dom';

// ✅ Fixed: Use backticks + fallback + trim
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();

const PostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [],
    jobType: 'remote',
    location: '',
    duration: '',
    startDate: '',
    paymentType: 'hourly',
    minBudget: '',
    maxBudget: '',
    currency: 'USD',
    contact_email: '',
    deadline: '',
    screeningQuestions: [],
    termsAccepted: false
  });

  const [newSkill, setNewSkill] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setFormData(prev => ({
        ...prev,
        screeningQuestions: [...prev.screeningQuestions, newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index)
    }));
  };

  // ✅ FIXED: Correct template literal + robust error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.termsAccepted) {
      alert('Please accept the Terms of Service.');
      return;
    }

    const payload = {
      ...formData,
      minBudget: formData.minBudget ? Number(formData.minBudget) : undefined,
      maxBudget: formData.maxBudget ? Number(formData.maxBudget) : undefined,
    };

    console.log('📤 Posting to:', `${API_URL}/api/jobs`);
    console.log('📋 Payload:', payload);

    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // 🔒 Guard 1: Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON, got HTML: ${text.substring(0, 200)}...`);
      }

      // 🔒 Guard 2: Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Job posted successfully:', data);
      alert('🎉 Job posted successfully!');
      navigate('/find-work');
    } catch (err) {
      console.error('❌ Job posting failed:', err);
      setError(err.message || 'An unknown error occurred. Please try again.');
    }
  };

  // Options
  const categories = [
    'Creative & Design',
    'Admin & Support',
    'Tech & Development',
    'Writing & Translation',
    'Marketing & Sales',
    'Manual Labor',
    'Other'
  ];

  const durations = [
    'One-time Project',
    'Short-term (under 3 months)',
    'Ongoing/Long-term'
  ];

  const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'PHP', 'AUD', 'Other'];

  return (
    <div className="postjob-container">
      <Navbar />

      <div className="postjob-form-wrapper">
        <div className="form-header">
          <h1>Post a Job</h1>
          <p>Fill out the details below to attract the perfect candidate for your sideline job.</p>
        </div>

        {error && (
          <div className="error-banner">
            <span style={{ color: 'red' }}>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="postjob-form">
          {/* === Section 1: Job Basics === */}
          <div className="form-section">
            <h2>Job Basics</h2>

            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <div className="input-with-icon">
                <Briefcase className="input-icon" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Virtual Assistant for Social Media"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and expectations..."
                rows="5"
                required
              />
              <p className="helper-text">Include scope, deliverables, and key requirements.</p>
            </div>

            <div className="form-group">
              <label htmlFor="category">Job Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Required Skills/Tools</label>
              <div className="tag-input">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button type="button" onClick={handleAddSkill}>Add</button>
              </div>
              <div className="tags">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="tag">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* === Section 2: Location & Timing === */}
          <div className="form-section">
            <h2>Location & Timing</h2>

            <div className="form-group">
              <label>Job Type *</label>
              <div className="radio-group">
                {[
                  { value: 'remote', label: 'Remote' },
                  { value: 'on-site', label: 'On-site' },
                  { value: 'hybrid', label: 'Hybrid' }
                ].map(option => (
                  <label key={option.value} className="radio-label">
                    <input
                      type="radio"
                      name="jobType"
                      value={option.value}
                      checked={formData.jobType === option.value}
                      onChange={handleChange}
                    />
                    <MapPin className="radio-icon" />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {(formData.jobType === 'on-site' || formData.jobType === 'hybrid') && (
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="duration">Duration/Timeline *</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              >
                <option value="">Select duration</option>
                {durations.map(dur => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date (Optional)</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* === Section 3: Compensation === */}
          <div className="form-section">
            <h2>Compensation</h2>

            <div className="form-group">
              <label>Payment Type *</label>
              <div className="radio-group">
                {[
                  { value: 'hourly', label: 'Hourly Rate' },
                  { value: 'fixed', label: 'Fixed Project Price' },
                  { value: 'negotiable', label: 'Negotiable' }
                ].map(option => (
                  <label key={option.value} className="radio-label">
                    <input
                      type="radio"
                      name="paymentType"
                      value={option.value}
                      checked={formData.paymentType === option.value}
                      onChange={handleChange}
                    />
                    <DollarSign className="radio-icon" />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {formData.paymentType !== 'negotiable' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      {formData.paymentType === 'hourly' ? 'Hourly Rate' : 'Project Budget'} *
                      <HelpCircle className="tooltip-icon" data-tooltip="Set a realistic range to attract qualified candidates." />
                    </label>
                    <div className="range-inputs">
                      <input
                        type="number"
                        name="minBudget"
                        value={formData.minBudget}
                        onChange={handleChange}
                        placeholder="Min"
                        min="0"
                        required
                      />
                      <span>to</span>
                      <input
                        type="number"
                        name="maxBudget"
                        value={formData.maxBudget}
                        onChange={handleChange}
                        placeholder="Max"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Currency *</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* === Section 4: Contact & Screening === */}
          <div className="form-section">
            <h2>Contact & Screening</h2>

            <div className="form-group">
              <label htmlFor="contact_email">Contact Email *</label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="candidates@yourcompany.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Application Deadline (Optional)</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Screening Questions (Optional)</label>
              <div className="question-input">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g., What is your experience with Figma?"
                />
                <button type="button" onClick={handleAddQuestion}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="questions-list">
                {formData.screeningQuestions.map((q, i) => (
                  <div key={i} className="question-item">
                    <span>{q}</span>
                    <button type="button" onClick={() => handleRemoveQuestion(i)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === Footer & CTA === */}
          <div className="form-footer">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
              />
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </label>

            <div className="form-buttons">
              <button type="button" className="btn-secondary">
                Save Draft
              </button>
              <button type="submit" className="btn-primary">
                Post Job
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;