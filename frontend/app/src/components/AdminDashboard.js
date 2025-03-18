// src/components/AdminDashboard.js

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/Dashboard.css";
import { AuthContext } from "../context/AuthContext"; // <-- We'll grab the token from here
import "react-calendar/dist/Calendar.css";
import LeftSidebar from "./LeftSidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, accessToken } = useContext(AuthContext); 
  // ^ accessToken is where your JWT is stored, from AuthContext

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState(null);


  // State for storing user's full name
  const [fullName, setFullName] = useState("");
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      setSessionError(null);
      try {
        const response = await fetch("/api/v1/session/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessionError("Failed to load sessions. Please try again later.");
      } finally {
        setIsLoadingSessions(false);
      }
    };
  
    fetchSessions();
  }, [accessToken]);
  
  // Update this handler function to properly encode the session name
  const handleSessionClick = (sessionName) => {
    // Create a URL-safe version of the session name
    const encodedName = encodeURIComponent(sessionName);
    navigate(`/admin/sessions/${encodedName}`);
  };
  // Fetch current user on mount (with Bearer token)
  useEffect(() => {
    fetch("/api/v1/users/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`, // Attach the token here
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // If the user has a full_name, use it; otherwise fallback to "Admin"
        setFullName(data.full_name || "Admin");
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [accessToken]);

  console.log("This is the accessToken: " + accessToken);
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleNewMatching = () => {
    navigate("/form/section1");
    setIsSidebarVisible(false);
  };

  const handleCreateSession = () => {
    navigate("/admin/create-session");
    setIsSidebarVisible(false);
  };

  async function handleDoMatching() {
    const userConfirmed = window.confirm(
      "Are you sure you want to perform the matching? NOTE: If you proceed, all new entries of mentors would be matched with potential new mentees."
    );
    if (!userConfirmed) {
      console.log("User chose not to proceed.");
      return;
    }
    try {
      const response = await fetch("/api/matching/do", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
        return;
      }
      const data = await response.json();
      console.log("Matching result:", data);
      const navigateToMatchings = window.confirm(
        "Pairings completed! Navigate to matchings table?"
      );
      if (!navigateToMatchings) {
        console.log("User chose not to proceed.");
        return;
      }
      navigate("/admin/matchings");
    } catch (error) {
      console.error("Error performing matching:", error);
    }
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const handleManageForms = () => {
    navigate("/admin/manage-forms");
  };

  const handleViewMatchings = () => {
    navigate("/admin/matchings");
  };

  const handleViewSessions = () => {
    navigate("/admin/sessions");
  };

  const handleViewMentors = () => {
    navigate("/admin/mentors");
  };

  const handleViewMentees = () => {
    navigate("/admin/mentees");
  };

  const handleViewAllUsers = () => {
    navigate("/admin/all-users");
  }

  // Menu items for the sidebar
  const menuItems = [
    { label: "Home", onClick: () => navigate("/admin") },
    { label: "View Mentors", onClick: handleViewMentors },
    { label: "View Mentees", onClick: handleViewMentees },
    { label: "Matchings", onClick: handleViewMatchings },
    { label: "View Sessions", onClick: handleViewSessions },
    { label: "View All Users", onClick: handleViewAllUsers},
  ];

  // Admin Tools for the sidebar
  const projects = {
    title: "Admin Tools",
    items: [
      { name: "Role Assignments", color: "pink" },
      { name: "Permissions Control", color: "green" },
    ],
    manageButtonLabel: "Manage Form Fields",
  };

  

  

  return (
    <div className="dashboard-container">
      <LeftSidebar
        title="Admin Dashboard"
        menuItems={menuItems}
        projects={projects}
        onManageProjects={handleManageForms}
        onLogout={handleLogout}
      />

      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarVisible ? "✖" : "☰"}
      </button>

      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="search-bar">
            <input type="text" placeholder="Search or type a command" />
          </div>
          <div className="header-actions">
            <button className="new-project-btn" onClick={handleNewMatching}>
              + New Mentor Mentee Matching
            </button>
            <button className="new-project-btn" onClick={handleDoMatching}>
              + Perform Matching
            </button>
            <button className="new-project-btn" onClick={handleCreateSession}>
              + Create Session
            </button>
            <div className="profile">
              <img src="https://via.placeholder.com/30" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Greeting Section */}
        <section className="greeting-section">
          <p className="greeting-date">{formattedDate}</p>
          <h1 className="greeting-title">Welcome, {fullName}!</h1>
          <div className="greeting-stats">
            <div className="stat">
              <span className="stat-icon">📈</span>
              <div>
                <p className="stat-value">150</p>
                <p className="stat-label">Active Users</p>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">🛠️</span>
              <div>
                <p className="stat-value">35</p>
                <p className="stat-label">Projects Managed</p>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">📅</span>
              <div>
                <p className="stat-value">12</p>
                <p className="stat-label">Upcoming Events</p>
              </div>
            </div>
          </div>
        </section>
        {/* Sessions List Section */}
        <section className="sessions-section">
          <div className="section-header">
            <h2>Active Sessions</h2>
            <button className="view-all-btn" onClick={() => navigate("/admin/sessions")}>
              View All
            </button>
          </div>
          
          {isLoadingSessions ? (
            <div className="loading">Loading sessions...</div>
          ) : sessionError ? (
            <div className="error-message">{sessionError}</div>
          ) : sessions.length === 0 ? (
            <div className="no-sessions">No active sessions found.</div>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => {
                // Format dates to show only YYYY-MM-DD
                let startDateStr = session.start_time ? session.start_time.split('T')[0] : '';
                let endDateStr = session.end_time ? session.end_time.split('T')[0] : '';
                
                return (
                  <div 
                    key={session.id} 
                    className="session-card"
                    onClick={() => handleSessionClick(session.session_name)}
                  >
                    <div className="session-header">
                      <h3>{session.session_name}</h3>
                      <span className={`session-status ${session.active ? "active" : "inactive"}`}>
                        {session.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="session-description">{session.description}</p>
                    <div className="session-details">
                      <div className="detail">
                        <span className="detail-icon">🕒</span>
                        <span>Start: {startDateStr}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-icon">🔚</span>
                        <span>End: {endDateStr}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-icon">📍</span>
                        <span>{session.location || "Virtual"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
