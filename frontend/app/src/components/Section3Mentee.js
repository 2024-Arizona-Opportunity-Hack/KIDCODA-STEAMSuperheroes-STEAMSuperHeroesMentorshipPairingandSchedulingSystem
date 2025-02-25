import React from "react";
import "../styling/Form.css";

/**
 * Numeric-keyed grade radio options
 */
const GRADE_OPTIONS = [
  { id: 1, label: "5th grade" },
  { id: 2, label: "6th grade" },
  { id: 3, label: "7th grade" },
  { id: 4, label: "8th grade" },
  { id: 5, label: "9th grade" },
  { id: 6, label: "10th grade" },
  { id: 7, label: "11th grade" },
  { id: 8, label: "12th grade" },
  { id: 9, label: "College Freshman" },
  { id: 10, label: "College Sophomore" },
  { id: 11, label: "College Junior" },
  { id: 12, label: "College Senior" },
  { id: 13, label: "Graduate Student" },
];

/**
 * Numeric-keyed reasons for wanting a mentor (checkbox).
 * The last one "Other…" triggers a text box if selected.
 */
const REASONS_OPTIONS = [
  { id: 1, label: "Career Exploration" },
  { id: 2, label: "Do better in school" },
  { id: 3, label: "Learn about STEAM" },
  { id: 4, label: "Other…" }, // triggers text field
];

/**
 * Numeric-keyed interests (checkbox).
 * The last one "Other…" triggers a text box if selected.
 */
const INTERESTS_OPTIONS = [
  { id: 1, label: "Science" },
  { id: 2, label: "Dance" },
  { id: 3, label: "Math" },
  { id: 4, label: "Music" },
  { id: 5, label: "Building" },
  { id: 6, label: "Robotics" },
  { id: 7, label: "Art" },
  { id: 8, label: "Other…" }, // triggers text field
];

function Section3Mentee({ data, updateData, onNext }) {
  /**
   * If it's a single radio (grade), we parseInt the value, store it in data.grade as a number.
   * If it's a text field for "Other reason"/"Other interest", we store as string.
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // If it's a radio for numeric keys (grade), parse it to an integer:
    if (type === "radio" && name === "grade") {
      updateData({ [name]: parseInt(value, 10) });
    } else {
      // Otherwise, store string as is (for text, etc.)
      updateData({ [name]: value });
    }
  };

  /**
   * For checkboxes, we store numeric IDs in arrays: data.reasonsForMentor, data.interests.
   * If "Other…" is unchecked, clear the associated text field (reasonsForMentorOther / interestsOther).
   */
  const handleCheckboxChange = (e, fieldName, otherFieldName) => {
    const { value, checked } = e.target;
    const numericVal = parseInt(value, 10);

    if (checked) {
      // Add numericVal to the array
      updateData({ [fieldName]: [...data[fieldName], numericVal] });
    } else {
      // Remove numericVal from the array
      updateData({
        [fieldName]: data[fieldName].filter((item) => item !== numericVal),
      });
    }

    // If the user unchecks "Other…" => clear the related text field
    // We assume "Other…" always has the highest numeric ID in the set for that field
    // e.g., id=4 for reasons, id=8 for interests
    if (!checked && otherFieldName) {
      // If the user clicked "Other…", then numericVal is the ID for "Other…"
      // Let's see if numericVal matches the last item for "Other…"
      // For reasons, id=4 is "Other…"
      // For interests, id=8 is "Other…"
      const isOther = (
        fieldName === "reasonsForMentor" && numericVal === 4
      ) || (
        fieldName === "interests" && numericVal === 8
      );
      if (isOther) {
        updateData({ [otherFieldName]: "" });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // optional validations
    onNext();
  };

  // Helper to see if data array includes "Other…" numeric ID
  const hasOtherReasons = data.reasonsForMentor.includes(4); // 4 is "Other…"
  const hasOtherInterests = data.interests.includes(8);      // 8 is "Other…"

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-heading">Mentee Profile Questions</h2>

      {/* Grade (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Grade:</label>
        <div>
          {GRADE_OPTIONS.map((grade) => (
            <label
              key={grade.id}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="radio"
                name="grade"
                value={grade.id}
                checked={data.grade === grade.id}
                onChange={handleChange}
              />
              {` ${grade.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Reasons for Wanting a Mentor (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Reasons for Wanting a Mentor:</label>
        <div>
          {REASONS_OPTIONS.map((reason) => (
            <label
              key={reason.id}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="checkbox"
                name="reasonsForMentor"
                value={reason.id}
                checked={data.reasonsForMentor.includes(reason.id)}
                onChange={(e) => handleCheckboxChange(e, "reasonsForMentor", "reasonsForMentorOther")}
              />
              {` ${reason.label}`}
            </label>
          ))}
        </div>
        {/* If "Other…" is selected, display the text box */}
        {hasOtherReasons && (
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

      {/* Interests (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Interests:</label>
        <div>
          {INTERESTS_OPTIONS.map((interest) => (
            <label
              key={interest.id}
              style={{ display: "block", marginTop: "5px" }}
            >
              <input
                type="checkbox"
                name="interests"
                value={interest.id}
                checked={data.interests.includes(interest.id)}
                onChange={(e) => handleCheckboxChange(e, "interests", "interestsOther")}
              />
              {` ${interest.label}`}
            </label>
          ))}
        </div>
        {/* If "Other…" is selected, display the text box */}
        {hasOtherInterests && (
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
