import React from "react";
import "../styling/Form.css";

/**
 * Numeric-keyed STEAM background radio options
 */
const STEAM_BACKGROUND_OPTIONS = [
  { id: 1, label: "Professional" },
  { id: 2, label: "Student" },
];

/**
 * Numeric-keyed academic level radio options
 */
const ACADEMIC_LEVEL_OPTIONS = [
  { id: 1, label: "High School Freshman" },
  { id: 2, label: "High School Sophomore" },
  { id: 3, label: "High School Junior" },
  { id: 4, label: "High School Senior" },
  { id: 5, label: "College Undergraduate" },
  { id: 6, label: "Graduate School" },
  { id: 7, label: "Graduated / Working Professional" },
];

/**
 * Numeric-keyed reasons for mentoring (radio)
 */
const REASONS_FOR_MENTORING_OPTIONS = [
  { id: 1, label: "Give back to community" },
  { id: 2, label: "Volunteer hours" },
  { id: 3, label: "Other" },
];

function Section2Mentor({ data, updateData, onNext }) {
  /**
   * Handler for text or numeric fields.
   * For radio fields, we parseInt the value (which is stored as a numeric ID).
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // If it's a radio for numeric keys (steamBackground, academicLevel, reasonsForMentoring),
    // we parse to int. Otherwise, store string or number as is.
    if (type === "radio") {
      const numericVal = parseInt(value, 10);
      updateData({ [name]: numericVal });
    } else {
      updateData({ [name]: value });
    }
  };

  /**
   * Submit handler: optional validation, then onNext
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Additional validation if needed
    onNext();
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-heading">Mentor Profile Questions</h2>

      {/* STEAM Background (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>STEAM Background:</label>
        <div>
          {STEAM_BACKGROUND_OPTIONS.map((option) => (
            <label key={option.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="steamBackground"
                value={option.id}
                checked={data.steamBackground === option.id}
                onChange={handleChange}
              />
              {` ${option.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Current Academic Level (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Current Academic Level:</label>
        <div>
          {ACADEMIC_LEVEL_OPTIONS.map((level) => (
            <label key={level.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="academicLevel"
                value={level.id}
                checked={data.academicLevel === level.id}
                onChange={handleChange}
              />
              {` ${level.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Professional/Job Title (text, floating label) */}
      <label className="floating-label">
        <input
          type="text"
          name="professionalTitle"
          placeholder=" "
          className="floating-input"
          value={data.professionalTitle || ""}
          onChange={handleChange}
        />
        <span className="floating-label-text">
          Professional/Job Title (Enter N/A if not graduated)
        </span>
      </label>

      {/* Current Employer (text, floating label) */}
      <label className="floating-label">
        <input
          type="text"
          name="currentEmployer"
          placeholder=" "
          className="floating-input"
          value={data.currentEmployer || ""}
          onChange={handleChange}
        />
        <span className="floating-label-text">Current Employer</span>
      </label>

      {/* Reasons for Mentoring (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Reasons for Mentoring:</label>
        <div>
          {REASONS_FOR_MENTORING_OPTIONS.map((reason) => (
            <label key={reason.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="reasonsForMentoring"
                value={reason.id}
                checked={data.reasonsForMentoring === reason.id}
                onChange={handleChange}
              />
              {` ${reason.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Number of mentees (linear scale 1-10) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          How many individual mentees are you willing to advise?
        </label>
        <div style={{ marginTop: "5px" }}>
          <input
            type="range"
            name="willingToAdvise"
            min="1"
            max="10"
            value={data.willingToAdvise || 1}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
          <div style={{ textAlign: "center", marginTop: "5px" }}>
            {data.willingToAdvise || 1} mentee(s)
          </div>
        </div>
      </div>

      {/* Submit (Next) Button */}
      <button type="submit" className="form-button">
        Next
      </button>
    </form>
  );
}

export default Section2Mentor;
