import React from "react";
import "../styling/Form.css";

/**
 * Grade options as direct strings (matching Grade enum)
 */
const GRADE_OPTIONS = [
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
  "Graduate School"
];

/**
 * Reasons for wanting a mentor as direct strings
 */
const REASONS_OPTIONS = [
  "Career Exploration",
  "Do better in school",
  "Learn about STEAM",
  "Other"
];

/**
 * Interests as direct strings
 */
const INTERESTS_OPTIONS = [
  "Science",
  "Dance",
  "Math",
  "Music",
  "Building",
  "Robotics",
  "Art",
  "Other"
];

/**
 * Session preferences/mentoring types (matching MentoringType enum)
 */
const SESSION_PREFERENCE_OPTIONS = [
  "Homework Help",
  "Exposure to STEAM in general",
  "College guidance",
  "Career guidance",
  "Explore a particular field",
  "Other"
];

function Section3Mentee({ data, updateData, onNext }) {
  /**
   * For all text and radio inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  /**
   * For checkbox fields (reasonsForMentor, interests) - convert to comma-separated strings
   */
  const handleCheckbox = (e, fieldName, otherFieldName) => {
    const { value, checked } = e.target;
    
    // Get current values as array
    const currentValues = data[fieldName] 
      ? (Array.isArray(data[fieldName]) 
        ? data[fieldName] 
        : data[fieldName].split(", "))
      : [];

    let newValues;
    if (checked) {
      // Add value to the array
      newValues = [...currentValues, value];
    } else {
      // Remove value from the array
      newValues = currentValues.filter(item => item !== value);
    }
    
    // Store as comma-separated string
    updateData({ [fieldName]: newValues.join(", ") });

    // If the user unchecks "Other", clear the related text field
    if (!checked && otherFieldName && value === "Other") {
      updateData({ [otherFieldName]: "" });
    }
  };

  /**
   * Special handler for mentoring type checkboxes to create proper objects
   */
  const handleMentoringTypeCheckbox = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // Add a new mentoringType object with is_match_found = false
      const newMentoringType = {
        type: value,
        is_match_found: false
      };
      updateData({ 
        mentoringType: [...(data.mentoringType || []), newMentoringType] 
      });
    } else {
      // Remove the mentoringType object with the matching type
      updateData({
        mentoringType: (data.mentoringType || []).filter(item => item.type !== value)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // optional validations
    onNext();
  };

  // Helper to check if "Other" is selected
  const hasOtherReasons = data.reasonsForMentor?.includes("Other");
  const hasOtherInterests = data.interests?.includes("Other");

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-heading">Mentee Profile Questions</h2>

      {/* Grade (direct string values) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Grade:</label>
        <div>
          {GRADE_OPTIONS.map((grade) => (
            <label
              key={grade}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="radio"
                name="grade"
                value={grade}
                checked={data.grade === grade}
                onChange={handleChange}
              />
              {` ${grade}`}
            </label>
          ))}
        </div>
      </div>

      {/* Mentoring Type / Session Preferences (creates objects) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>What type of mentoring are you interested in?</label>
        <div>
          {SESSION_PREFERENCE_OPTIONS.map((option) => (
            <label
              key={option}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="checkbox"
                name="mentoringType"
                value={option}
                checked={data.mentoringType?.some(item => item.type === option)}
                onChange={handleMentoringTypeCheckbox}
              />
              {` ${option}`}
            </label>
          ))}
        </div>
      </div>

      {/* Reasons for Wanting a Mentor (as string) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Reasons for Wanting a Mentor:</label>
        <div>
          {REASONS_OPTIONS.map((reason) => (
            <label
              key={reason}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="checkbox"
                name="reasonsForMentor"
                value={reason}
                checked={data.reasonsForMentor?.includes(reason)}
                onChange={(e) => handleCheckbox(e, "reasonsForMentor", "reasonsForMentorOther")}
              />
              {` ${reason}`}
            </label>
          ))}
        </div>
        {/* If "Other" is selected, display the text box */}
        {data.reasonsForMentor?.includes("Other") && (
          <label className="floating-label" style={{ marginTop: "5px" }}>
            <input
              type="text"
              name="reasonsForMentorOther"
              placeholder=" "
              className="floating-input"
              value={data.reasonsForMentorOther || ""}
              onChange={handleChange}
            />
            <span className="floating-label-text">
              Other reason (please specify)
            </span>
          </label>
        )}
      </div>

      {/* Interests (as string) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Interests:</label>
        <div>
          {INTERESTS_OPTIONS.map((interest) => (
            <label
              key={interest}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="checkbox"
                name="interests"
                value={interest}
                checked={data.interests?.includes(interest)}
                onChange={(e) => handleCheckbox(e, "interests", "interestsOther")}
              />
              {` ${interest}`}
            </label>
          ))}
        </div>
        {/* If "Other" is selected, display the text box */}
        {data.interests?.includes("Other") && (
          <label className="floating-label" style={{ marginTop: "5px" }}>
            <input
              type="text"
              name="interestsOther"
              placeholder=" "
              className="floating-input"
              value={data.interestsOther || ""}
              onChange={handleChange}
            />
            <span className="floating-label-text">
              Other interest (please specify)
            </span>
          </label>
        )}
      </div>

      <button type="submit" className="form-button">
        Next
      </button>
    </form>
  );
}

export default Section3Mentee;
