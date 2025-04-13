import React from "react";
import "../styling/Form.css";

/**
 * STEAM background options as direct strings
 */
const STEAM_BACKGROUND_OPTIONS = [
  "Professional",
  "Student"
];

/**
 * Academic level options as direct strings (matching Grade enum)
 */
const ACADEMIC_LEVEL_OPTIONS = [
  "5th grade",
  "6th grade",
  "7th grade",
  "8th grade",
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
  "College Freshman",
  "College Sophomore",
  "College Junior",
  "College Senior",
  "Graduate Student",
  "High School Freshman",
  "High School Sophomore",
  "High School Junior",
  "High School Senior",
  "College Undergraduate",
  "Graduate School",
  "Graduated / Working Professional"
];

/**
 * Reasons for mentoring as direct strings
 */
const REASONS_FOR_MENTORING_OPTIONS = [
  "Give back to community",
  "Volunteer hours",
  "Other"
];

/**
 * Session preferences/mentoring types as direct strings (matching MentoringType enum)
 */
const SESSION_PREFERENCE_OPTIONS = [
  "Homework Help",
  "Exposure to STEAM in general",
  "College guidance",
  "Career guidance",
  "Explore a particular field",
  "Other"
];

function Section2Mentor({ data, updateData, onNext }) {
  /**
   * Handler for all form fields - all stored as direct string values
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  /**
   * Handler for checkbox fields like sessionPreferences
   */
  const handleCheckbox = (e, fieldName) => {
    const { value, checked } = e.target;

    if (checked) {
      updateData({ [fieldName]: [...(data[fieldName] || []), value] });
    } else {
      updateData({
        [fieldName]: (data[fieldName] || []).filter(item => item !== value)
      });
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

      {/* Session Preferences / Mentoring Type (checkbox) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>What type of mentoring are you interested in?</label>
        <div>
          {SESSION_PREFERENCE_OPTIONS.map((option) => (
            <label key={option} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="sessionPreferences"
                value={option}
                checked={data.sessionPreferences?.includes(option)}
                onChange={(e) => handleCheckbox(e, "sessionPreferences")}
              />
              {` ${option}`}
            </label>
          ))}
        </div>
      </div>

      {/* STEAM Background (radio) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>STEAM Background:</label>
        <div>
          {STEAM_BACKGROUND_OPTIONS.map((option) => (
            <label key={option} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="steamBackground"
                value={option}
                checked={data.steamBackground === option}
                onChange={handleChange}
              />
              {` ${option}`}
            </label>
          ))}
        </div>
      </div>

      {/* Current Academic Level (radio) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Current Academic Level:</label>
        <div>
          {ACADEMIC_LEVEL_OPTIONS.map((level) => (
            <label key={level} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="academicLevel"
                value={level}
                checked={data.academicLevel === level}
                onChange={handleChange}
              />
              {` ${level}`}
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

      {/* Reasons for Mentoring (radio) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Reasons for Mentoring:</label>
        <div>
          {REASONS_FOR_MENTORING_OPTIONS.map((reason) => (
            <label key={reason} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="reasonsForMentoring"
                value={reason}
                checked={data.reasonsForMentoring === reason}
                onChange={handleChange}
              />
              {` ${reason}`}
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
