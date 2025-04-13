// src/pages/Section1.js

import React, { useState, useEffect, useContext } from "react";
import "../styling/Form.css";
import { AuthContext } from "../context/AuthContext";

// Age Brackets - direct strings
const AGE_BRACKETS = [
  "9-13", "13-18", "18-22", "22-30", "30-40", "40-50", "50-60", "60+"
];

// US States (value : label)
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DC", label: "District of Columbia" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachussetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

// Ethnicities - direct strings
const ETHNICITIES = [
  "South Asian: Includes Indian, Pakistan, Sri Lankan, Bangaladesh",
  "Black or African American: Includes Jamaican, Nigerian, Haitian, and Ethiopian",
  "White or European: Includes German, Irish, English, Italian, Polish, and French",
  "Hispanic or Latino: Includes Puerto Rican, Mexican, Cuban, Salvadoran, and Colombian",
  "Middle Eastern or North African: Includes Lebanese, Iranian, Egyptian, Moroccan, Israeli, and Palestinian",
  "Native Hawaiian or Pacific Islander: Includes Samoan, Buamanian, Chamorro, and Tongan",
  "American Indian or Alaska Native",
  "Asian: Includes Chinese, Japanese, Filipino, Korean, South Asian, and Vietnamese",
  "Other…"
];

// Ethnicity Match Options - direct strings
const ETHNICITY_MATCH_OPTIONS = [
  "Prefer ONLY to be matched within that similarity",
  "Prefer it, but available to others as needed",
  "Prefer NOT to be matched within that similarity",
  "Do not have a preference. Either is fine.",
  "Other…"
];

// Gender Options - direct strings
const GENDER_OPTIONS = [
  "Cisgender Male",
  "Cisgender Female", 
  "Transgender Male",
  "Transgender Female",
  "Prefer not to disclose",
  "Other…"
];

// Gender Match Options - direct strings
const GENDER_MATCH_OPTIONS = [
  "Prefer ONLY to be matched within that similarity",
  "Prefer it, but available to others as needed",
  "Prefer NOT to be matched within that similarity",
  "Do not have a preference. Either is fine.",
  "Other…"
];

// Method Options - direct strings
const METHOD_OPTIONS = [
  "Web conference (ie. Zoom video conference)",  // Changed from "Web Conference"
  "In person",                                   // Changed from "In Person" 
  "Hybrid (both web and in person)",             // Changed from "Hybrid (Both In Person and web)"
  "Other:"                                       // Changed from "Other..."
];


function Section1({ data, updateData, onNext }) {
  const [errorMsg, setErrorMsg] = useState("");
  const { accessToken } = useContext(AuthContext);

  // On mount, fetch user details (only once)
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!accessToken) {
        console.warn("No access token found. User may not be logged in.");
        return;
      }
      try {
        const res = await fetch("/api/v1/users/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userData = await res.json();
        // Autofill email & name, disabling editing
        updateData({
          email: userData.email || "",
          name: userData.full_name || "",
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    fetchUserDetails();
  // Empty dependency array -> runs only once
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  // For radio fields (string values)
  const handleRadio = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  // For checkbox fields (string values)
  const handleCheckbox = (e, fieldName) => {
    const { value, checked } = e.target;

    if (checked) {
      updateData({ [fieldName]: [...data[fieldName], value] });
    } else {
      updateData({
        [fieldName]: data[fieldName].filter(item => item !== value)
      });
    }
  };

  // For role checkbox fields
  const handleRoleChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      updateData({ roles: [...data.roles, value] });
    } else {
      updateData({
        roles: data.roles.filter((role) => role !== value),
      });
    }
  };

  // Validate email only
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple email check
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(data.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // If all good, go next
    onNext();
  };

  return (
    <form className="form-container" onSubmit={handleFormSubmit}>
      <h1 className="form-heading">STEAM Superheroes Mentor Mentee Matching Form</h1>
      <h2 className="form-heading">Section 1 - Basic Info</h2>

      {/* Email */}
      <label className="floating-label">
        <input
          type="email"
          name="email"
          placeholder=" "
          className="floating-input"
          value={data.email}
          onChange={handleChange}
          disabled // <-- Disable editing
          required
        />
        <span className="floating-label-text">Email</span>
      </label>

      {/* Name */}
      <label className="floating-label">
        <input
          type="text"
          name="name"
          placeholder=" "
          className="floating-input"
          value={data.name}
          onChange={handleChange}
          disabled // <-- Disable editing
        />
        <span className="floating-label-text">Name</span>
      </label>

      {/* Age Bracket (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Age Bracket:</label>
        <div>
          {AGE_BRACKETS.map((bracket) => (
            <label key={bracket} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="ageBracket"
                value={bracket}
                checked={data.ageBracket === bracket}
                onChange={handleRadio}
              />
              {` ${bracket}`}
            </label>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <label className="floating-label">
        <input
          type="text"
          name="phoneNumber"
          placeholder=" "
          className="floating-input"
          value={data.phoneNumber}
          onChange={handleChange}
        />
        <span className="floating-label-text">Phone Number</span>
      </label>

      {/* State (select) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>State:</label>
        <select
          name="state"
          className="form-input"
          value={data.state}
          onChange={handleChange}
          style={{ marginTop: "5px" }}
        >
          <option value="">Select State</option>
          {US_STATES.map((st) => (
            <option key={st.value} value={st.value}>
              {`${st.value} : ${st.label}`}
            </option>
          ))}
        </select>
      </div>

      {/* City (text) */}
      <label className="floating-label" style={{ marginBottom: "15px" }}>
        <input
          type="text"
          name="city"
          placeholder=" "
          className="floating-input"
          value={data.city}
          onChange={handleChange}
        />
        <span className="floating-label-text">City</span>
      </label>

      {/* Ethnicities (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Ethnicities:</label>
        <div>
          {ETHNICITIES.map((ethnicity) => (
            <label key={ethnicity} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="ethnicities"
                value={ethnicity}
                checked={data.ethnicities.includes(ethnicity)}
                onChange={(e) => handleCheckbox(e, "ethnicities")}
              />
              {` ${ethnicity}`}
            </label>
          ))}
        </div>
      </div>

      {/* Ethnicity Matching Preference (radio) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          What is your preference in being matched with a person of the same ethnicity?
        </label>
        <div>
          {ETHNICITY_MATCH_OPTIONS.map((opt) => (
            <label key={opt} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="ethnicityPreference"
                value={opt}
                checked={data.ethnicityPreference === opt}
                onChange={handleRadio}
              />
              {` ${opt}`}
            </label>
          ))}
        </div>
      </div>

      {/* Gender (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Gender:</label>
        <div>
          {GENDER_OPTIONS.map((g, index) => (
            <label key={index} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="gender"
                value={g}
                checked={data.gender.includes(g)}
                onChange={(e) => handleCheckbox(e, "gender")}
              />
              {` ${g}`}
            </label>
          ))}
        </div>
      </div>

      {/* Gender Matching Preference (radio) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          What is your preference regarding being matched with a person of the same gender identity?
        </label>
        <div>
          {GENDER_MATCH_OPTIONS.map((opt) => (
            <label key={opt} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="genderPreference"
                value={opt}
                checked={data.genderPreference === opt}
                onChange={handleRadio}
              />
              {` ${opt}`}
            </label>
          ))}
        </div>
      </div>

      {/* Methods (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          What methods are you open to?
        </label>
        <div>
          {METHOD_OPTIONS.map((m, index) => (
            <label key={index} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="methods"
                value={m}
                checked={data.methods.includes(m)}
                onChange={(e) => handleCheckbox(e, "methods")}
              />
              {` ${m}`}
            </label>
          ))}
        </div>
      </div>

      {/* Role (checkbox multi-select) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          Choose your role(s) - select all that apply:
        </label>
        <div>
          <label style={{ display: "block", marginTop: "5px" }}>
            <input
              type="checkbox"
              name="role"
              value="mentor"
              checked={data.roles?.includes("mentor")}
              onChange={handleRoleChange}
            />
            {" Mentor (person providing guidance)"}
          </label>
          <label style={{ display: "block", marginTop: "5px" }}>
            <input
              type="checkbox"
              name="role"
              value="mentee"
              checked={data.roles?.includes("mentee")}
              onChange={handleRoleChange}
            />
            {" Mentee (person receiving guidance)"}
          </label>
        </div>
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}

      <button type="submit" className="form-button">
        Next
      </button>
    </form>
  );
}

export default Section1;
