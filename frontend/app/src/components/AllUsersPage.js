// src/pages/AllUsersPage.jsx

import React, { useState, useEffect, useMemo, useContext } from "react";
import "../styling/ExpandableList.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // <-- Import your AuthContext

function AllUsersPage() {
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext); // <-- Destructure the token here

  const [users, setUsers] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // (Optional) placeholders for future editing
  const [editRowId, setEditRowId] = useState(null);
  const [editFields, setEditFields] = useState({
    email: "",
    full_name: "",
  });

  // Search/pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ============ Fetch All Users ============
  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken) {
        console.warn("No access token found. Are you logged in as a superuser?");
        return;
      }
      try {
        const response = await fetch("/api/v1/users/all?page=0", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // Use the token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [accessToken]);

  // ============ Filtering by Search ============
  const filteredUsers = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return users.filter((user) =>
      [user.email, user.full_name, user.id]
        .map((val) => val?.toString().toLowerCase() || "")
        .some((field) => field.includes(lower))
    );
  }, [users, searchTerm]);

  // ============ Pagination ============
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ============ Expand/Collapse Row ============
  const toggleExpand = (userId) => {
    setExpandedRowId((prev) => (prev === userId ? null : userId));
    setEditRowId(null);
  };

  // ============ Edit Handlers (Placeholder) ============
  const handleEditClick = (user) => {
    setEditRowId(user.id);
    setEditFields({
      email: user.email || "",
      full_name: user.full_name || "",
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = async (userId) => {
    // Placeholder: implement PATCH call in future
    console.log("Saving user with ID:", userId, "New data:", editFields);
    // Example of real patch call:
    // await fetch(`http://localhost/api/v1/users/${userId}`, {
    //   method: "PATCH",
    //   headers: { 
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${accessToken}`,
    //   },
    //   body: JSON.stringify({ ...editFields })
    // });
    setEditRowId(null);
  };

  // ============ Delete Handler (Placeholder) ============
  const handleDeleteClick = async (user) => {
    // Placeholder: implement DELETE call in future
    console.log("Deleting user:", user);
    // Example of real delete call:
    // await fetch(`http://localhost/api/v1/users/${user.id}`, {
    //   method: "DELETE",
    //   headers: {
    //     "Authorization": `Bearer ${accessToken}`,
    //   },
    // });
  };

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <div className="expandable-list-container">
      <button className="button" onClick={() => navigateBack()}>
        Back
      </button>
      <h2 className="expandable-list-title">All Users</h2>

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

      {paginatedUsers.map((user) => {
        const isExpanded = user.id === expandedRowId;
        const isEditing = user.id === editRowId;

        return (
          <div className="expandable-item" key={user.id}>
            <div className="expandable-header" onClick={() => toggleExpand(user.id)}>
              <div className="expandable-header-left">
                <div>{user.full_name || "No Name"}</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {user.email}
                </div>
              </div>
              <div className="expandable-header-right">
                <span>{isExpanded ? "▼" : "▶"}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="expandable-content">
                {isEditing ? (
                  <div className="expandable-content-fields">
                    <div>
                      <div className="field-label">Email:</div>
                      <input
                        type="text"
                        value={editFields.email}
                        onChange={(e) =>
                          setEditFields({ ...editFields, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <div className="field-label">Full Name:</div>
                      <input
                        type="text"
                        value={editFields.full_name}
                        onChange={(e) =>
                          setEditFields({ ...editFields, full_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="expandable-content-fields">
                    <div>
                      <div className="field-label">Email:</div>
                      <div className="field-value">{user.email}</div>
                    </div>
                    <div>
                      <div className="field-label">Full Name:</div>
                      <div className="field-value">
                        {user.full_name || "Not Provided"}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">User ID:</div>
                      <div className="field-value">{user.id}</div>
                    </div>
                    <div>
                      <div className="field-label">Superuser:</div>
                      <div className="field-value">
                        {user.is_superuser ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Active:</div>
                      <div className="field-value">
                        {user.is_active ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Email Validated:</div>
                      <div className="field-value">
                        {user.email_validated ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">TOTP Enabled:</div>
                      <div className="field-value">
                        {user.totp ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="expandable-actions">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSaveClick(user.id)}>Save</button>
                      <button onClick={handleCancelClick}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(user)}>Edit</button>
                      <button onClick={() => handleDeleteClick(user)}>Delete</button>
                    </>
                  )}
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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

export default AllUsersPage;
