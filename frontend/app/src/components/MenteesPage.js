// src/pages/MenteesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import "../styling/ExpandableList.css";
import { useNavigate } from "react-router-dom";


// ====== Example label mappings ======
// Adjust to match your numeric IDs vs labels

// 1) Age Brackets
const AGE_BRACKET_LABELS = {
  1: "9-13",
  2: "13-18",
  3: "18-22",
  4: "22-30",
  5: "30-40",
  6: "40-50",
  7: "50-60",
  8: "60+",
};

// 2) Gender
const GENDER_LABELS = {
  1: "Cisgender Male",
  2: "Cisgender Female",
  3: "Transgender Male",
  4: "Transgender Female",
  5: "Prefer not to disclose",
  6: "Other",
};

// 3) Ethnicities
const ETHNICITY_LABELS = {
  1: "American Indian or Alaska Native",
  2: "Asian",
  3: "South Asian",
  4: "Black or African American",
  5: "Hispanic or Latino",
  6: "Middle Eastern or North African",
  7: "Native Hawaiian or Pacific Islander",
  8: "White or European",
  9: "Other",
};

// 4) Grade
const GRADE_LABELS = {
  1: "5th grade",
  2: "6th grade",
  3: "7th grade",
  4: "8th grade",
  5: "9th grade",
  6: "10th grade",
  7: "11th grade",
  8: "12th grade",
  9: "College Freshman",
  10: "College Sophomore",
  11: "College Junior",
  12: "College Senior",
  13: "Graduate Student",
};

// 5) Example: reasons_for_mentor
const REASONS_MENTEE_LABELS = {
  1: "Career Exploration",
  2: "Do better in school",
  3: "Learn about STEAM",
  4: "Other",
};

// 6) Example: interests
const INTERESTS_LABELS = {
  1: "Science",
  2: "Dance",
  3: "Math",
  4: "Music",
  5: "Building",
  6: "Robotics",
  7: "Art",
  8: "Other",
};

function MenteesPage() {
  const [mentees, setMentees] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const navigate = useNavigate();

  // Edit states
  const [editRowId, setEditRowId] = useState(null);
  const [editFields, setEditFields] = useState({
    email: "",
    phone_number: "",
    city: "",
  });

  // Search/pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ============ Fetch Mentees ============
  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const response = await fetch("api/admin/mentees");
        if (!response.ok) {
          throw new Error("Failed to fetch mentees");
        }
        const data = await response.json();
        setMentees(data);
      } catch (err) {
        console.error("Error fetching mentees:", err);
      }
    };
    fetchMentees();
  }, []);

  // ============ Filtering by Search ============
  const filteredMentees = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return mentees.filter((mentee) =>
      [mentee.name, mentee.email, mentee.phone_number, mentee.city, mentee.state]
        .map((val) => val?.toString().toLowerCase() || "")
        .some((field) => field.includes(lower))
    );
  }, [mentees, searchTerm]);

  // ============ Pagination ============
  const totalPages = Math.ceil(filteredMentees.length / itemsPerPage);
  const paginatedMentees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMentees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMentees, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ============ Expand/Collapse Row ============
  const toggleExpand = (menteeId) => {
    setExpandedRowId((prev) => (prev === menteeId ? null : menteeId));
    setEditRowId(null);
  };

  // ============ Edit Handlers ============
  const handleEditClick = (mentee) => {
    setEditRowId(mentee.mentee_id);
    setEditFields({
      email: mentee.email || "",
      phone_number: mentee.phone_number || "",
      city: mentee.city || "",
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = async (menteeId) => {
    try {
      const response = await fetch(
        `/api/admin/mentees/${menteeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: editFields.email,
            phone_number: editFields.phone_number,
            city: editFields.city,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update mentee");

      await response.json();
      // Update local state
      setMentees((prev) =>
        prev.map((m) =>
          m.mentee_id === menteeId
            ? { ...m, ...editFields }
            : m
        )
      );
      setEditRowId(null);
      console.log("Mentee updated successfully");
    } catch (err) {
      console.error("Error updating mentee:", err);
      alert("Error updating mentee. Check console.");
    }
  };

  // ============ Delete Handler ============
  const handleDeleteClick = async (mentee) => {
    if (!window.confirm(`Are you sure to delete ${mentee.name}?`)) return;
    try {
      const response = await fetch(
        `/api/admin/mentees/${mentee.mentee_id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete mentee");
      await response.json();

      setMentees((prev) => prev.filter((m) => m.mentee_id !== mentee.mentee_id));
      console.log("Mentee deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting mentee. Check console.");
    }
  };

  // ============ Helper Functions to Render Numeric IDs as Labels ============
  const renderAgeBracket = (num) => {
    if (!num) return "";
    return AGE_BRACKET_LABELS[num] || `Unknown #${num}`;
  };

  const renderGenders = (arr) => {
    if (!arr?.length) return "";
    return arr
      .map((id) => GENDER_LABELS[id] || `Unknown #${id}`)
      .join(", ");
  };

  const renderEthnicities = (arr) => {
    if (!arr?.length) return "";
    return arr
      .map((id) => ETHNICITY_LABELS[id] || `Unknown #${id}`)
      .join(", ");
  };

  const renderGrade = (num) => {
    if (!num) return "";
    return GRADE_LABELS[num] || `Unknown #${num}`;
  };

  const renderReasonsForMentor = (arr, otherValue) => {
    if (!arr?.length) return "";
    // If the user selected "Other…" numeric ID, we might append the text
    // e.g. "Other… (some custom text)"
    return arr
      .map((id) => {
        if (id === 4 && otherValue) {
          // 4 means "Other" in this example
          return `Other (${otherValue})`;
        }
        return REASONS_MENTEE_LABELS[id] || `Unknown #${id}`;
      })
      .join(", ");
  };

  const renderInterests = (arr, otherValue) => {
    if (!arr?.length) return "";
    return arr
      .map((id) => {
        if (id === 8 && otherValue) {
          // 8 means "Other…" in this example
          return `Other (${otherValue})`;
        }
        return INTERESTS_LABELS[id] || `Unknown #${id}`;
      })
      .join(", ");
  };

  const navigateHome = () => {
    navigate(-1);
  }

  return (
    <div className="expandable-list-container">
      <button className="button" onClick={() => navigateHome()}>Back</button>
      <h2 className="expandable-list-title">Mentees</h2>

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

      {paginatedMentees.map((mentee) => {
        const isExpanded = mentee.mentee_id === expandedRowId;
        const isEditing = mentee.mentee_id === editRowId;

        return (
          <div className="expandable-item" key={mentee.mentee_id}>
            <div
              className="expandable-header"
              onClick={() => toggleExpand(mentee.mentee_id)}
            >
              <div className="expandable-header-left">
                <div>{mentee.name}</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {mentee.email} - {mentee.city}
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
                      <div className="field-label">Phone:</div>
                      <input
                        type="text"
                        value={editFields.phone_number}
                        onChange={(e) =>
                          setEditFields({
                            ...editFields,
                            phone_number: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="field-label">City:</div>
                      <input
                        type="text"
                        value={editFields.city}
                        onChange={(e) =>
                          setEditFields({
                            ...editFields,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="expandable-content-fields">
                    {/* Basic Info */}
                    <div>
                      <div className="field-label">Email:</div>
                      <div className="field-value">{mentee.email}</div>
                    </div>
                    <div>
                      <div className="field-label">Phone:</div>
                      <div className="field-value">{mentee.phone_number}</div>
                    </div>
                    <div>
                      <div className="field-label">City:</div>
                      <div className="field-value">{mentee.city}</div>
                    </div>
                    <div>
                      <div className="field-label">State:</div>
                      <div className="field-value">{mentee.state}</div>
                    </div>
                    <div>
                      <div className="field-label">Age Bracket:</div>
                      <div className="field-value">
                        {renderAgeBracket(mentee.age_bracket)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Ethnicities:</div>
                      <div className="field-value">
                        {renderEthnicities(mentee.ethnicities)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Gender:</div>
                      <div className="field-value">
                        {renderGenders(mentee.gender)}
                      </div>
                    </div>

                    {/* Mentee-Specific Fields */}
                    <div>
                      <div className="field-label">Grade:</div>
                      <div className="field-value">
                        {renderGrade(mentee.grade)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Reasons for Mentor:</div>
                      <div className="field-value">
                        {renderReasonsForMentor(
                          mentee.reasons_for_mentor,
                          mentee.reasons_for_mentor_other
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Interests:</div>
                      <div className="field-value">
                        {renderInterests(
                          mentee.interests,
                          mentee.interests_other
                        )}
                      </div>
                    </div>
                    {/* Add any other numeric fields or booleans, etc. */}
                  </div>
                )}

                <div className="expandable-actions">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSaveClick(mentee.mentee_id)}>
                        Save
                      </button>
                      <button onClick={handleCancelClick}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(mentee)}>Edit</button>
                      <button onClick={() => handleDeleteClick(mentee)}>Delete</button>
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

export default MenteesPage;
