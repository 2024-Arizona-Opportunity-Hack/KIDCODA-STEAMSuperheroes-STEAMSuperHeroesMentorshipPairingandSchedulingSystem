// src/pages/MentorsPage.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import "../styling/ExpandableList.css"; // Import the teal styling
 
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";


// ====== Example Mappings for Numeric IDs ======
// Adjust these to match your actual IDs and labels

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

// 2) Ethnicity
const ETHNICITY_LABELS = {
  1: "American Indian or Alaska Native",
  2: "Asian",
  3: "South Asian",
  4: "Black or African American",
  5: "Hispanic or Latino",
  6: "Middle Eastern or North African",
  7: "Native Hawaiian or Pacific Islander",
  8: "White or European",
  9: "Other…",
};

// 3) Gender
const GENDER_LABELS = {
  1: "Cisgender Male",
  2: "Cisgender Female",
  3: "Transgender Male",
  4: "Transgender Female",
  5: "Prefer not to disclose",
  6: "Other…",
};

// 4) Session Preferences
const SESSION_PREF_LABELS = {
  1: "Homework Help",
  2: "Exposure to STEAM in general",
  3: "College guidance",
  4: "Career guidance",
  5: "Explore a particular field",
  6: "Other: text",
};

// 5) STEAM Background
const STEAM_BACKGROUND_LABELS = {
  1: "Professional",
  2: "Student",
  // add if you have more
};

// 6) Academic Level
const ACADEMIC_LEVEL_LABELS = {
  1: "High School Freshman",
  2: "High School Sophomore",
  3: "High School Junior",
  4: "High School Senior",
  5: "College Undergraduate",
  6: "Graduate School",
  7: "Graduated / Working Professional",
};

// 7) Reasons for Mentoring
const REASONS_MENTORING_LABELS = {
  1: "Give back to community",
  2: "Volunteer hours",
  3: "Other",
};

function MentorsPage() {
  const { sessionId } = useParams();
  const { accessToken } = useContext(AuthContext);
  const [mentors, setMentors] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const navigate = useNavigate();

  // Editing states
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

  // ====== Fetch Mentors ======
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`/api/v1/user_preferences/?session_name=${sessionId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch mentors.");
        }
        const data = await response.json();
        console.log(data);
        setMentors(data);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      }
    };
    fetchMentors();
  }, []);

  // ====== Filter by Search ======
  const filteredMentors = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return mentors.filter((m) =>
      [m.name, m.email, m.phone_number, m.city, m.state]
        .map((val) => val?.toString().toLowerCase() || "")
        .some((field) => field.includes(lower))
    );
  }, [mentors, searchTerm]);

  // ====== Pagination ======
  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);
  const paginatedMentors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMentors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMentors, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ====== Expand/Collapse Row ======
  const toggleExpand = (mentorId) => {
    setExpandedRowId((prev) => (prev === mentorId ? null : mentorId));
    // Cancel editing if we expand a new row
    setEditRowId(null);
  };

  // ====== Editing Handlers ======
  const handleEditClick = (mentor) => {
    setEditRowId(mentor.mentor_id);
    setEditFields({
      email: mentor.email || "",
      phone_number: mentor.phone_number || "",
      city: mentor.city || "",
    });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleSaveClick = async (mentorId) => {
    try {
      const response = await fetch(
        `/api/admin/mentors/${mentorId}`,
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
      if (!response.ok) throw new Error("Failed to update mentor.");

      await response.json();
      // Update local state
      setMentors((prev) =>
        prev.map((m) =>
          m.mentor_id === mentorId
            ? {
                ...m,
                email: editFields.email,
                phone_number: editFields.phone_number,
                city: editFields.city,
              }
            : m
        )
      );
      setEditRowId(null);
    } catch (err) {
      console.error("Error updating mentor:", err);
      alert("Error updating mentor. Check console.");
    }
  };

  // ====== Delete ======
  const handleDeleteClick = async (mentor) => {
    if (!window.confirm(`Are you sure you want to delete ${mentor.name}?`)) {
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/mentors/${mentor.mentor_id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete mentor.");
      await response.json();
      setMentors((prev) => prev.filter((m) => m.mentor_id !== mentor.mentor_id));
    } catch (err) {
      console.error("Error deleting mentor:", err);
      alert("Error deleting mentor. See console for details.");
    }
  };

  // ====== Rendering Helpers ======
  const renderAgeBracket = (num) => {
    if (!num) return "";
    return AGE_BRACKET_LABELS[num] || `Unknown #${num}`;
  };
  const renderEthnicities = (arr) => {
    if (!arr?.length) return "";
    return arr
      .map((id) => ETHNICITY_LABELS[id] || `Unknown #${id}`)
      .join(", ");
  };
  const renderGenders = (arr) => {
    if (!arr?.length) return "";
    return arr
      .map((id) => GENDER_LABELS[id] || `Unknown #${id}`)
      .join(", ");
  };
  const renderSessionPrefs = (arr) => {
    if (!arr?.length) return "";
    return arr
      .map((id) => SESSION_PREF_LABELS[id] || `Unknown #${id}`)
      .join(", ");
  };
  const renderSteamBackground = (num) => {
    if (!num) return "";
    return STEAM_BACKGROUND_LABELS[num] || `Unknown #${num}`;
  };
  const renderAcademicLevel = (num) => {
    if (!num) return "";
    return ACADEMIC_LEVEL_LABELS[num] || `Unknown #${num}`;
  };
  const renderReasonsMentoring = (num) => {
    if (!num) return "";
    return REASONS_MENTORING_LABELS[num] || `Unknown #${num}`;
  };

  const navigateHome = () => {
    navigate(-1);
  }

  return (
    
    <div className="expandable-list-container">
      <button className="button" onClick={() => navigateHome()}>Back</button>
      <h2 className="expandable-list-title">Mentors</h2>

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

      {paginatedMentors.map((mentor) => {
        const isExpanded = mentor.mentor_id === expandedRowId;
        const isEditing = mentor.mentor_id === editRowId;

        return (
          <div className="expandable-item" key={mentor.mentor_id}>
            <div
              className="expandable-header"
              onClick={() => toggleExpand(mentor.mentor_id)}
            >
              <div className="expandable-header-left">
                <div>{mentor.name}</div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {mentor.email} - {mentor.city}
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
                          setEditFields({
                            ...editFields,
                            email: e.target.value,
                          })
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
                          setEditFields({ ...editFields, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="expandable-content-fields">
                    {/* Basic Info */}
                    <div>
                      <div className="field-label">Email:</div>
                      <div className="field-value">{mentor.email}</div>
                    </div>
                    <div>
                      <div className="field-label">Phone:</div>
                      <div className="field-value">{mentor.phone_number}</div>
                    </div>
                    <div>
                      <div className="field-label">City:</div>
                      <div className="field-value">{mentor.city}</div>
                    </div>
                    <div>
                      <div className="field-label">State:</div>
                      <div className="field-value">{mentor.state}</div>
                    </div>
                    <div>
                      <div className="field-label">Age Bracket:</div>
                      <div className="field-value">
                        {renderAgeBracket(mentor.age_bracket)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Ethnicities:</div>
                      <div className="field-value">
                        {renderEthnicities(mentor.ethnicities)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Gender:</div>
                      <div className="field-value">
                        {renderGenders(mentor.gender)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Session Preferences:</div>
                      <div className="field-value">
                        {renderSessionPrefs(mentor.session_preferences)}
                      </div>
                    </div>

                    {/* Mentor-Specific Fields */}
                    <div>
                      <div className="field-label">STEAM Background:</div>
                      <div className="field-value">
                        {renderSteamBackground(mentor.steam_background)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Academic Level:</div>
                      <div className="field-value">
                        {renderAcademicLevel(mentor.academic_level)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Professional Title:</div>
                      <div className="field-value">
                        {mentor.professional_title || ""}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Current Employer:</div>
                      <div className="field-value">
                        {mentor.current_employer || ""}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Reasons for Mentoring:</div>
                      <div className="field-value">
                        {renderReasonsMentoring(mentor.reasons_for_mentoring)}
                      </div>
                    </div>
                    <div>
                      <div className="field-label">Willing to Advise:</div>
                      <div className="field-value">
                        {mentor.willing_to_advise ?? ""}
                      </div>
                    </div>
                  </div>
                )}

                <div className="expandable-actions">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSaveClick(mentor.mentor_id)}>
                        Save
                      </button>
                      <button onClick={handleCancelClick}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(mentor)}>Edit</button>
                      <button onClick={() => handleDeleteClick(mentor)}>Delete</button>
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

export default MentorsPage;
