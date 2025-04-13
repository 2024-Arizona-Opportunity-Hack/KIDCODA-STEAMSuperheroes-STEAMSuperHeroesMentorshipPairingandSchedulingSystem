// src/components/Dashboard.js

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
import LeftSidebar from "./LeftSidebar"; // Import the LeftSidebar component

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample events array (you can replace this with dynamic data)
  const events = [
    { date: new Date(2024, 0, 12), title: "Help DStudio get more customers" },
    { date: new Date(2024, 0, 15), title: "Plan a trip" },
    { date: new Date(2024, 0, 20), title: "Return a package" },
  ];

  const handleNewMatching = () => {
    navigate("/form/section1");
    setIsSidebarVisible(false); // Hide sidebar after navigation on mobile
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const onChangeCalendar = (date) => {
    setSelectedDate(date);
    // You can add additional logic here, e.g., fetching events for the selected date
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleViewSessions = () => {
    navigate("/sessions");
  };

  // Define menu items for Mentee Dashboard
  const menuItems = [
    { label: "Dashboard", active: true },
    { label: "Sessions", active: false, onClick: handleViewSessions },
    { label: "My Mentors", active: false },
    { label: "My Mentees", active: false },
  ];

  // Define projects/tools for Mentee Dashboard
  const projects = {
    title: "Projects",
    items: [
      { name: "Event Planning", color: "pink" },
      { name: "Breakfast Plan", color: "green" },
    ],
    manageButtonLabel: "New Session Enrollment",
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftSidebar
        title="Dashboard"
        menuItems={menuItems}
        projects={projects}
        onManageProjects={handleNewMatching}
        onLogout={handleLogout}
      />
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={() => {}}>
        {/* Implement toggle functionality if needed */}
        ☰
      </button>
      {/* <aside className={`sidebar ${isSidebarVisible ? "visible" : "hidden"}`}>
        <h2 className="sidebar-title">Mentee Dashboard</h2>
        <ul className="sidebar-menu">
          <li className="menu-item active">Dashboard</li>
          <li className="menu-item">Sessions</li>
          <li className="menu-item">My Mentors</li>
          <li className="menu-item">Notes</li>
          <li className="menu-item">Documents</li>
          <li className="menu-item">Receipts</li>
        </ul>
        <div className="sidebar-projects">
          <h3>Projects</h3>
          <ul>
            <li>
              <span className="dot pink"></span> Event Planning
            </li>
            <li>
              <span className="dot green"></span> Breakfast Plan
            </li>
          </ul>
          <button className="add-project-btn" onClick={handleNewMatching}>
            + New Mentor-Mentee Matching
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <p>Help & Support</p>
        </div>
      </aside> */}

      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarVisible ? "✖" : "☰"} {/* Using icons for better UX */}
      </button>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="search-bar">
            <input type="text" placeholder="Search or type a command" />
          </div>
          <div className="header-actions">
            <button className="new-project-btn" onClick={handleNewMatching}>
              + New Session Enrollment
            </button>
            <div className="profile">
              <img src="https://via.placeholder.com/30" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Greeting Section */}
        <section className="greeting-section">
        <p className="greeting-date">{formattedDate}</p>
          <h1 className="greeting-title">Welcome!</h1>
          <div className="greeting-stats">
          <div className="stat">
              <span className="stat-icon">⏱</span>
              <div>
                <p className="stat-value">12hrs</p>
                <p className="stat-label">Time Saved</p>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">✅</span>
              <div>
                <p className="stat-value">24</p>
                <p className="stat-label">Projects Completed</p>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">⚙️</span>
              <div>
                <p className="stat-value">7</p>
                <p className="stat-label">Projects In-progress</p>
              </div>
            </div>
          </div>
        </section>

        {/* Meetings and Calendar Row */}
        <div className="dashboard-row">
          {/* My Meetings Section */}
          <section className="projects-section">
            <header className="section-header">
              <h2>My Meetings</h2>
              <button>See All</button>
            </header>
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Meeting Title</th>
                  <th>Date & Time</th>
                  <th>Assign</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Help DStudio get more customers</td>
                  <td>Jan 12, 2024</td>
                  <td>Phoenix Winters</td>
                  <td>
                    <span className="status in-progress">In Progress</span>
                  </td>
                </tr>
                <tr>
                  <td>Plan a trip</td>
                  <td>Jan 15, 2024</td>
                  <td>Cohen Merritt</td>
                  <td>
                    <span className="status pending">Pending</span>
                  </td>
                </tr>
                <tr>
                  <td>Return a package</td>
                  <td>Jan 20, 2024</td>
                  <td>Lukas Juarez</td>
                  <td>
                    <span className="status completed">Completed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Calendar Section */}
          <section className="calendar-section">
            <header className="section-header">
              <h2>My Calendar</h2>
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
      </main>
    </div>
  );
};

export default Dashboard;
