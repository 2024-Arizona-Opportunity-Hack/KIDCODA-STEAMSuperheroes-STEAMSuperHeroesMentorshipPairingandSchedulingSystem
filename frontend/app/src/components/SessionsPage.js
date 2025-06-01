import React, { useState, useEffect, useMemo, useContext } from "react";
import "../styling/ExpandableList.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function SessionsPage() {
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      if (!accessToken) {
        console.warn("No access token found. Please log in.");
        return;
      }
      try {
        const response = await fetch("/api/v1/session/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, [accessToken]);

  // Filter sessions based on search term
  const filteredSessions = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return sessions.filter(session =>
      [session.session_name, session.description, session.location, session.id]
        .map(val => val?.toString().toLowerCase() || "")
        .some(field => field.includes(lower))
    );
  }, [sessions, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSessions, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleExpand = (sessionId) => {
    setExpandedSessionId(prev => (prev === sessionId ? null : sessionId));
  };

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <div className="expandable-list-container">
      <button className="button" onClick={navigateBack}>
        Back
      </button>
      <h2 className="expandable-list-title">All Sessions</h2>

      <div className="list-controls">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {paginatedSessions.map(session => {
        const isExpanded = session.id === expandedSessionId;

        return (
          <div className="expandable-item" key={session.id}>
            <div className="expandable-header" onClick={() => toggleExpand(session.id)}>
              <div className="expandable-header-left">
                <div>{session.session_name}</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {session.location}
                </div>
              </div>
              <div className="expandable-header-right">
                <span>{isExpanded ? "▼" : "▶"}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="expandable-content">
                <div className="expandable-content-fields">
                  <div>
                    <div className="field-label">Description:</div>
                    <div className="field-value">{session.description}</div>
                  </div>
                  <div>
                    <div className="field-label">Timezone:</div>
                    <div className="field-value">{session.timezone}</div>
                  </div>
                  <div>
                    <div className="field-label">Start Date:</div>
                    <div className="field-value">{session.start_date}</div>
                  </div>
                  <div>
                    <div className="field-label">End Date:</div>
                    <div className="field-value">{session.end_date}</div>
                  </div>
                  <div>
                    <div className="field-label">Active:</div>
                    <div className="field-value">
                      {session.active ? "Yes" : "No"}
                    </div>
                  </div>
                  <div>
                    <div className="field-label">Session Type:</div>
                    <div className="field-value">{session.session_type}</div>
                  </div>
                  <div>
                    <div className="field-label">Meeting Durations:</div>
                    <div className="field-value">
                      {session.meeting_duration.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div className="field-label">Cadence:</div>
                    <div className="field-value">{session.cadence}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={page === currentPage ? "active" : ""}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default SessionsPage;