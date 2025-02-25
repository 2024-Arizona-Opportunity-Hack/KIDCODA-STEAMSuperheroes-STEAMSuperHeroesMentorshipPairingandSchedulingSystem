// src/components/ViewOnlySessionsPage.js

import React, { useState, useMemo, useEffect } from "react";
import "../styling/MentorMenteeMatchings.css"; // Reuse the same styling as LoginForm
import { useNavigate } from "react-router-dom";

const ViewOnlySessionsPage = () => {
  // React state to store sessions data fetched from the backend
  const [sessionsData, setSessionsData] = useState([]);
  const navigate = useNavigate();

  // States for search, filter, sorting, pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCadence, setFilterCadence] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5; // Adjust as needed

  /**
   * On mount, fetch sessions from the backend.
   * Adjust the endpoint URL to your actual sessions API route for mentees,
   * e.g., http://127.0.0.1:8000/api/sessions
   */
  useEffect(() => {
    console.log("ViewOnlySessionsPage mounted. Fetching sessions...");

    const fetchSessions = async () => {
      try {
        console.log("Attempting to fetch sessions from /api/sessions");
        const response = await fetch("/api/sessions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include authentication headers if required
            // "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch sessions.");
        }
        const data = await response.json();

        console.log("Raw data received from API:", data);

        // data should be an array of sessions
        setSessionsData(data);
        console.log("sessionsData state updated with fetched data:", data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  /**
   * Sorting logic
   */
  const handleSort = (key) => {
    console.log(`Sorting by key='${key}'`);
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  /**
   * Build a memoized sorted list of sessions
   */
  const sortedSessions = useMemo(() => {
    console.log("Calculating sortedSessions...");
    let sortableSessions = [...sessionsData];

    // 1) Search filtering
    if (searchTerm) {
      console.log(`Filtering by searchTerm='${searchTerm}'`);
      // Adjust to match whichever session fields you'd like to search
      sortableSessions = sortableSessions.filter((session) =>
        session.session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.session_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.cadence?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2) Filter by cadence
    if (filterCadence !== "All") {
      console.log(`Filtering by cadence='${filterCadence}'`);
      sortableSessions = sortableSessions.filter(
        (session) => session.cadence === filterCadence
      );
    }

    // 3) Sorting
    if (sortConfig.key) {
      console.log(
        `Sorting by '${sortConfig.key}' in '${sortConfig.direction}' order.`
      );
      sortableSessions.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    console.log("sortableSessions after search/filter/sort:", sortableSessions);
    return sortableSessions;
  }, [sessionsData, sortConfig, searchTerm, filterCadence]);

  /**
   * Pagination logic
   */
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);

  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const result = sortedSessions.slice(startIndex, endIndex);

    console.log(
      `Paginating from index ${startIndex} to ${endIndex}, total pages=${totalPages}, currentPage=${currentPage}`
    );
    console.log("paginatedSessions:", result);

    return result;
  }, [sortedSessions, currentPage, itemsPerPage, totalPages]);

  /**
   * handlePageChange
   */
  const handlePageChange = (pageNumber) => {
    console.log(`Changing page to ${pageNumber}`);
    setCurrentPage(pageNumber);
  };

  /**
   * Search & Filter changes -> reset to page 1
   */
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetToFirstPage();
  };

  const handleFilterChange = (e) => {
    setFilterCadence(e.target.value);
    resetToFirstPage();
  };

  const navigateHome = () => {
    navigate("/home");
  };

  /**
   * Build unique cadences for filter dropdown
   */
  const uniqueCadences = ["All", ...new Set(sessionsData.map((s) => s.cadence || ""))];

  /**
   * Render
   */
  return (
    <div className="matchings-container">
      <button className="button" onClick={() => navigateHome()}>Back</button>
      <h2 className="matchings-title">Sessions</h2>

      {/* Search and Filter Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Session ID, Session Type, or Cadence"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        <select
          value={filterCadence}
          onChange={handleFilterChange}
          className="filter-select"
        >
          {uniqueCadences.map((cad, index) => (
            <option key={index} value={cad}>
              {cad}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions Table */}
      <div className="table-container">
        <table className="matchings-table">
          <thead>
            <tr>
              {/* Sort by session_id, session_type, session_start, etc. */}
              <th onClick={() => handleSort("session_id")}>
                Session ID
                {sortConfig.key === "session_id" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>

              <th onClick={() => handleSort("session_type")}>
                Session Type
                {sortConfig.key === "session_type" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>

              <th onClick={() => handleSort("session_start")}>
                Start
                {sortConfig.key === "session_start" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>

              <th onClick={() => handleSort("session_end")}>
                End
                {sortConfig.key === "session_end" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>

              <th onClick={() => handleSort("nbr_meetings")}>
                # Meetings
                {sortConfig.key === "nbr_meetings" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>

              <th onClick={() => handleSort("cadence")}>
                Cadence
                {sortConfig.key === "cadence" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSessions.length > 0 ? (
              paginatedSessions.map((session, idx) => {
                console.log(`Rendering row ${idx + 1}`, session);

                return (
                  <tr key={session.session_id}>
                    <td>{session.session_id}</td>
                    <td>{session.session_type}</td>
                    <td>{new Date(session.session_start).toLocaleString()}</td>
                    <td>{new Date(session.session_end).toLocaleString()}</td>
                    <td>{session.nbr_meetings}</td>
                    <td>{session.cadence}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`pagination-btn ${
                  currentPage === pageNumber ? "active" : ""
                }`}
              >
                {pageNumber}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewOnlySessionsPage;
