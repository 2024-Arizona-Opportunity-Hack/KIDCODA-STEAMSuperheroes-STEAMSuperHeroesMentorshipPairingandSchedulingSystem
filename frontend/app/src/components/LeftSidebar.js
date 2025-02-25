// src/components/LeftSidebar.jsx

import React from "react";
import PropTypes from "prop-types";
import "../styling/LeftSidebar.css"; // We'll create this CSS file next

const LeftSidebar = ({
  title,
  menuItems,
  projects,
  onManageProjects,
  onLogout,
}) => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">{title}</h2>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`menu-item ${item.active ? "active" : ""}`}
            onClick={() => item.onClick && item.onClick()}
          >
            {item.label}
          </li>
        ))}
      </ul>

      {projects && projects.length > 0 && (
        <div className="sidebar-projects">
          <h3>{projects.title}</h3>
          <ul>
            {projects.items.map((project, idx) => (
              <li key={idx}>
                <span className={`dot ${project.color}`}></span> {project.name}
              </li>
            ))}
          </ul>
          {onManageProjects && (
            <button className="add-project-btn" onClick={onManageProjects}>
              + {projects.manageButtonLabel}
            </button>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
        <p>Help & Support</p>
      </div>
    </aside>
  );
};

LeftSidebar.propTypes = {
  title: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      active: PropTypes.bool,
      onClick: PropTypes.func,
    })
  ).isRequired,
  projects: PropTypes.shape({
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired, // e.g., "pink", "green"
      })
    ).isRequired,
    manageButtonLabel: PropTypes.string, // e.g., "New Mentor-Mentee Matching"
  }),
  onManageProjects: PropTypes.func,
  onLogout: PropTypes.func.isRequired,
};

export default LeftSidebar;
