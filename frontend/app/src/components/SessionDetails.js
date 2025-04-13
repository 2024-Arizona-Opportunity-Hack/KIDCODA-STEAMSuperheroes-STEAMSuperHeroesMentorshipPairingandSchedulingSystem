import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styling/SessionDetails.css';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`/api/v1/session/?session_name=${sessionId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }

        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load session details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId, accessToken]);

  if (loading) {
    return <div className="loading-container">Loading session details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!session) {
    return <div className="error-container">Session not found</div>;
  }

  return (
    <div className="session-details-container">
      <div className="details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{session.name}</h1>
        <span className={`status-badge ${session.active ? "active" : "inactive"}`}>
          {session.active ? "Active" : "Inactive"}
        </span>
      </div>

      <section className="session-info">
        <h2>Session Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <h3>Description</h3>
            <p>{session.description || "No description available"}</p>
          </div>
          <div className="info-item">
            <h3>Location</h3>
            <p>{session.location || "Virtual"}</p>
          </div>
          <div className="info-item">
            <h3>Start Date</h3>
            <p>{new Date(session.start_date).toLocaleDateString()}</p>
          </div>
          <div className="info-item">
            <h3>End Date</h3>
            <p>{new Date(session.end_date).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      <section className="participant-stats">
        <h2>Participants</h2>
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-number">{session.mentor_count || 0}</div>
            <div className="stat-label">Mentors</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{session.mentee_count || 0}</div>
            <div className="stat-label">Mentees</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{session.matching_count || 0}</div>
            <div className="stat-label">Matches</div>
          </div>
        </div>
      </section>

      <div className="action-buttons">
        <button 
          className="action-button edit" 
          onClick={() => navigate(`/admin/sessions/edit/${sessionId}`)}
        >
          Edit Session
        </button>
        <button 
          className="action-button matches" 
          onClick={() => navigate(`/admin/sessions/${sessionId}/matches`)}
        >
          View Matches
        </button>
        <button 
          className="action-button participants" 
          onClick={() => navigate(`/admin/sessions/${sessionId}/participants`)}
        >
          View Participants
        </button>
        <button 
          className="action-button participants" 
          onClick={() => navigate(`/admin/sessions/${sessionId}/mentors`)}
        >
          View Mentors
        </button>
        <button 
          className="action-button participants" 
          onClick={() => navigate(`/admin/sessions/${sessionId}/mentees`)}
        >
          View Mentees
        </button>
      </div>
    </div>
  );
};

export default SessionDetails;