// src/components/MentorMenteeMatchings.jsx
import React, { useState, useMemo, useEffect } from "react";
import "../styling/MentorMenteeMatchings.css";
import { useNavigate } from "react-router-dom";

const MentorMenteeMatchings = () => {
  // React state to store matchings data fetched from the backend
  const [matchingsData, setMatchingsData] = useState([]);
  const navigate = useNavigate();

  // States for search, filter, sorting, pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ------------------------------- useEffect ------------------------------ */
  useEffect(() => {
    console.log("MentorMenteeMatchings component mounted. Fetching data...");

    const fetchMatchings = async () => {
      try {
        console.log("Attempting to fetch matchings from /api/matchings...");
        const response = await fetch("/api/matchings");
        if (!response.ok) {
          throw new Error("Failed to fetch matchings.");
        }
        const data = await response.json();

        console.log("Raw data received from API:", data);

        // data should be an array of matchings
        setMatchingsData(data);
        console.log("matchingsData state updated with fetched data.");
      } catch (error) {
        console.error("Error fetching matchings:", error);
      }
    };

    fetchMatchings();
  }, []);
  // ----------------------------------------------------------------------

  /* ------------------------------- handleSort ------------------------------ */
  const handleSort = (key) => {
    console.log(`Sorting by key='${key}'`);
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  // ----------------------------------------------------------------------

  /* ---------------------------- sortedMatchings --------------------------- */
  const sortedMatchings = useMemo(() => {
    console.log("Calculating sortedMatchings...");
    let sortableMatchings = [...matchingsData];

    // Log the entire matchingsData array for debugging
    console.log("Current matchingsData in sortedMatchings:", matchingsData);

    // SEARCH filtering
    if (searchTerm) {
      console.log(`Filtering by searchTerm='${searchTerm}'`);
      sortableMatchings = sortableMatchings.filter((matching) => {
        // Log each matching's fields for clarity
        console.log("Evaluating matching:", matching);
        return (
          matching.mentor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matching.mentee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matching.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // STATUS filtering
    if (filterStatus !== "All") {
      console.log(`Filtering by status='${filterStatus}'`);
      sortableMatchings = sortableMatchings.filter(
        (matching) => matching.status === filterStatus
      );
    }

    // SORTING
    if (sortConfig.key) {
      console.log(
        `Sorting by '${sortConfig.key}' in '${sortConfig.direction}' order.`
      );
      sortableMatchings.sort((a, b) => {
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

    console.log("sortableMatchings after search/filter/sort:", sortableMatchings);
    return sortableMatchings;
  }, [matchingsData, sortConfig, searchTerm, filterStatus]);

  /* -------------------------- Pagination Logic ---------------------------- */
  const totalPages = Math.ceil(sortedMatchings.length / itemsPerPage);
  const paginatedMatchings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const result = sortedMatchings.slice(startIndex, endIndex);

    console.log(
      `Paginating from index ${startIndex} to ${endIndex}, total pages=${totalPages}, currentPage=${currentPage}`
    );
    console.log("paginatedMatchings:", result);

    return result;
  }, [sortedMatchings, currentPage, itemsPerPage, totalPages]);

  /* -------------------------- handlePageChange --------------------------- */
  const handlePageChange = (pageNumber) => {
    console.log(`Changing page to ${pageNumber}`);
    setCurrentPage(pageNumber);
  };

  /* --------------------- handleSearch & handleFilter --------------------- */
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetToFirstPage();
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    resetToFirstPage();
  };

  const navigateHome = () => {
    navigate(-1);
  }

  /* --------------------------- uniqueStatuses ---------------------------- */
  const uniqueStatuses = ["All", ...new Set(matchingsData.map((m) => m.status))];
  console.log("uniqueStatuses:", uniqueStatuses);

  /* ------------------------------ Rendering ------------------------------ */
  return (
    <div className="matchings-container">
      <button className="button" onClick={() => navigateHome()}>Back</button>
      <h2 className="matchings-title">Mentor-Mentee Matchings</h2>

      {/* Search and Filter Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Mentor, Mentee, or Status"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={handleFilterChange}
          className="filter-select"
        >
          {uniqueStatuses.map((status, index) => (
            <option key={index} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Matchings Table */}
      <div className="table-container">
        <table className="matchings-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("matching_id")}>
                ID
                {sortConfig.key === "matching_id" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
              <th onClick={() => handleSort("mentor_name")}>
                Mentor Name
                {sortConfig.key === "mentor_name" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
              <th onClick={() => handleSort("mentor_email")}>
                Mentor Email
                {sortConfig.key === "mentor_email" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
              <th onClick={() => handleSort("mentee_name")}>
                Mentee Name
                {sortConfig.key === "mentee_name" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
              <th onClick={() => handleSort("mentee_email")}>
                Mentee Email
                {sortConfig.key === "mentee_email" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
              <th onClick={() => handleSort("match_date")}>
                Match Date
                {sortConfig.key === "match_date" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
              <th onClick={() => handleSort("status")}>
                Status
                {sortConfig.key === "status" ? (
                  sortConfig.direction === "ascending" ? " 🔼" : " 🔽"
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedMatchings.length > 0 ? (
              paginatedMatchings.map((matching, idx) => {
                // Log each matching row for debugging
                console.log(
                  `Rendering row ${idx + 1}/${paginatedMatchings.length}: `,
                  matching
                );

                return (
                  <tr key={matching.matching_id}>
                    <td>{matching.matching_id}</td>
                    <td>{matching.mentor_name}</td>
                    <td>{matching.mentor_email}</td>
                    <td>{matching.mentee_name}</td>
                    <td>{matching.mentee_email}</td>
                    <td>{matching.matching_date}</td>
                    <td>
                      <span
                        className={`status ${
                          matching.status
                            ?.toLowerCase()
                            .replace(" ", "-") || ""
                        }`}
                      >
                        {matching.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No matchings found.
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

          {/* Page Numbers */}
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

export default MentorMenteeMatchings;
