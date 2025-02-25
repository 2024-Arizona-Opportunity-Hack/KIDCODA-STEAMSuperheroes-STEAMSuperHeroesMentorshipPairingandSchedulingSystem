// src/components/AdminDashboard.js

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/Dashboard.css";
import { AuthContext } from "../context/AuthContext"; // <-- We'll grab the token from here
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import LeftSidebar from "./LeftSidebar";
import AdminCreateSession from "./CreateSessionPage";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, accessToken } = useContext(AuthContext); 
  // ^ accessToken is where your JWT is stored, from AuthContext

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateSession, setShowCreateSession] = useState(false);

  // State for storing user's full name
  const [fullName, setFullName] = useState("");

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

  // Sample events array
  const events = [
    { date: new Date(2024, 0, 12), title: "Help DStudio get more customers" },
    { date: new Date(2024, 0, 15), title: "Plan a trip" },
    { date: new Date(2024, 0, 20), title: "Return a package" },
  ];

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
      const response = await fetch("http://127.0.0.1:8000/api/matching/do", {
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
    { label: "View Reports", onClick: () => navigate("/admin/view-reports") },
    { label: "System Logs", onClick: () => navigate("/admin/system-logs") },
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

  const overviewItems = [
    {
      item: "Database Backup",
      lastUpdate: "Dec 10, 2025",
      manager: "System Admin",
      status: "Completed",
    },
    {
      item: "Role Assignment Update",
      lastUpdate: "Dec 12, 2025",
      manager: "John Admin",
      status: "In Progress",
    },
    {
      item: "Mentee Form Edits",
      lastUpdate: "Dec 17, 2025",
      manager: "AdminBot",
      status: "Pending",
    },
  ];

  const onChangeCalendar = (date) => {
    setSelectedDate(date);
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

        {/* Meetings and Calendar Row */}
        <div className="dashboard-row">
          {/* Active Users Section */}
          <section className="projects-section">
            <header className="section-header">
              <h2>Active Users</h2>
              <button>View All</button>
            </header>
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>user1</td>
                  <td>user1@example.com</td>
                  <td>Mentee</td>
                  <td>
                    <span className="status active">Active</span>
                  </td>
                </tr>
                <tr>
                  <td>user2</td>
                  <td>user2@example.com</td>
                  <td>Mentee</td>
                  <td>
                    <span className="status inactive">Inactive</span>
                  </td>
                </tr>
                <tr>
                  <td>user3</td>
                  <td>user3@example.com</td>
                  <td>Mentee</td>
                  <td>
                    <span className="status active">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Calendar Section */}
          <section className="calendar-section">
            <header className="section-header">
              <h2>Admin Calendar</h2>
            </header>
            <div className="calendar-container">
              <Calendar
                onChange={onChangeCalendar}
                value={selectedDate}
                className="custom-calendar"
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const event = events.find(
                      (event) =>
                        event.date.getFullYear() === date.getFullYear() &&
                        event.date.getMonth() === date.getMonth() &&
                        event.date.getDate() === date.getDate()
                    );
                    return event ? "event-date" : null;
                  }
                }}
              />
            </div>
          </section>
        </div>

        <div className="dashboard-row">
          {/* System Overview Section */}
          <section className="projects-section">
            <header className="section-header">
              <h2>System Overview</h2>
              <button onClick={() => navigate("/admin/system-logs")}>
                See All Logs
              </button>
            </header>
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Last Update</th>
                  <th>Manager</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {overviewItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item}</td>
                    <td>{item.lastUpdate}</td>
                    <td>{item.manager}</td>
                    <td>
                      <span
                        className={`status ${
                          item.status === "Completed"
                            ? "completed"
                            : item.status === "In Progress"
                            ? "in-progress"
                            : "pending"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
