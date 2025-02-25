// src/pages/Section1.js

import React, { useState, useEffect, useContext } from "react";
import "../styling/Form.css";
import { AuthContext } from "../context/AuthContext";

// Numeric IDs for each Age Bracket
const AGE_BRACKETS = [
  { id: 1, label: "9-13" },
  { id: 2, label: "13-18" },
  { id: 3, label: "18-22" },
  { id: 4, label: "22-30" },
  { id: 5, label: "30-40" },
  { id: 6, label: "40-50" },
  { id: 7, label: "50-60" },
  { id: 8, label: "60+" },
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

// Numeric IDs for Ethnicity
const ETHNICITIES = [
  { id: 1, label: "American Indian or Alaska Native" },
  { id: 2, label: "Asian: Includes Chinese, Japanese, Filipino, Korean, South Asian, and Vietnamese" },
  { id: 3, label: "South Asian: Includes Indian, Pakistan, Sri Lankan, Bangaladesh" },
  { id: 4, label: "Black or African American: Includes Jamaican, Nigerian, Haitian, and Ethiopian" },
  { id: 5, label: "Hispanic or Latino: Includes Puerto Rican, Mexican, Cuban, Salvadoran, and Colombian" },
  { id: 6, label: "Middle Eastern or North African: Includes Lebanese, Iranian, Egyptian, Moroccan, Israeli, and Palestinian" },
  { id: 7, label: "Native Hawaiian or Pacific Islander: Includes Samoan, Guamanian, Chamorro, and Tongan" },
  { id: 8, label: "White or European: Includes German, Irish, English, Italian, Polish, and French" },
  { id: 9, label: "Other…" },
];

// Numeric IDs for Session Preferences
const SESSION_TYPE_PREFERENCES = [
  { id: 1, label: "Homework Help" },
  { id: 2, label: "Exposure to STEAM in general" },
  { id: 3, label: "College guidance" },
  { id: 4, label: "Career guidance" },
  { id: 5, label: "Explore a particular field" },
  { id: 6, label: "Other: text" },
];

// Numeric IDs for Ethnicity Match Preference
const ETHNICITY_MATCH_OPTIONS = [
  { id: 1, label: "Prefer ONLY to be matched within that similarity" },
  { id: 2, label: "Prefer it, but available to others as needed" },
  { id: 3, label: "Prefer NOT to be matched within that similarity" },
  { id: 4, label: "Do not have a preference. Either is fine." },
  { id: 5, label: "Other…" },
];

// Numeric IDs for Gender
const GENDER_OPTIONS = [
  { id: 1, label: "Cisgender Male" },
  { id: 2, label: "Cisgender Female" },
  { id: 3, label: "Transgender Male" },
  { id: 4, label: "Transgender Female" },
  { id: 5, label: "Prefer not to disclose" },
  { id: 6, label: "Other…" },
];

// Numeric IDs for Gender Preference
const GENDER_MATCH_OPTIONS = [
  { id: 1, label: "Prefer ONLY to be matched within that similarity" },
  { id: 2, label: "Prefer it, but available to others as needed" },
  { id: 3, label: "Prefer NOT to be matched within that similarity" },
  { id: 4, label: "Do not have a preference. Either is fine." },
  { id: 5, label: "Other…" },
];

// Numeric IDs for Methods
const METHOD_OPTIONS = [
  { id: 1, label: "Web Conference (i.e. Zoom Conference)" },
  { id: 2, label: "In Person" },
  { id: 3, label: "Hybrid (Both In Person and web)" },
  { id: 4, label: "Other..." },
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

  // For numeric radio fields
  const handleRadioNumeric = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: parseInt(value, 10) });
  };

  // For numeric checkbox fields
  const handleCheckboxNumeric = (e, fieldName) => {
    const { value, checked } = e.target;
    const numericVal = parseInt(value, 10);

    if (checked) {
      updateData({ [fieldName]: [...data[fieldName], numericVal] });
    } else {
      updateData({
        [fieldName]: data[fieldName].filter((item) => item !== numericVal),
      });
    }
  };

  // Validate email only
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple email check
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
          {AGE_BRACKETS.map((item) => (
            <label key={item.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="ageBracket"
                value={item.id}
                checked={data.ageBracket === item.id}
                onChange={handleRadioNumeric}
              />
              {` ${item.label}`}
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
          {ETHNICITIES.map((eth) => (
            <label key={eth.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="ethnicities"
                value={eth.id}
                checked={data.ethnicities.includes(eth.id)}
                onChange={(e) => handleCheckboxNumeric(e, "ethnicities")}
              />
              {` ${eth.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Session Preferences (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Session Type Preference:</label>
        <div>
          {SESSION_TYPE_PREFERENCES.map((pref) => (
            <label key={pref.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="sessionPreferences"
                value={pref.id}
                checked={data.sessionPreferences.includes(pref.id)}
                onChange={(e) => handleCheckboxNumeric(e, "sessionPreferences")}
              />
              {` ${pref.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Ethnicity Matching Preference (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          What is your preference in being matched with a person of the same ethnicity?
        </label>
        <div>
          {ETHNICITY_MATCH_OPTIONS.map((opt) => (
            <label key={opt.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="ethnicityPreference"
                value={opt.id}
                checked={data.ethnicityPreference === opt.id}
                onChange={handleRadioNumeric}
              />
              {` ${opt.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Gender (checkbox numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Gender:</label>
        <div>
          {GENDER_OPTIONS.map((g) => (
            <label key={g.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="gender"
                value={g.id}
                checked={data.gender.includes(g.id)}
                onChange={(e) => handleCheckboxNumeric(e, "gender")}
              />
              {` ${g.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Gender Matching Preference (radio numeric) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          What is your preference regarding being matched with a person of the same gender identity?
        </label>
        <div>
          {GENDER_MATCH_OPTIONS.map((opt) => (
            <label key={opt.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name="genderPreference"
                value={opt.id}
                checked={data.genderPreference === opt.id}
                onChange={handleRadioNumeric}
              />
              {` ${opt.label}`}
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
          {METHOD_OPTIONS.map((m) => (
            <label key={m.id} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="checkbox"
                name="methods"
                value={m.id}
                checked={data.methods.includes(m.id)}
                onChange={(e) => handleCheckboxNumeric(e, "methods")}
              />
              {` ${m.label}`}
            </label>
          ))}
        </div>
      </div>

      {/* Role (radio) */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>
          Choose the role you're signing up for:
        </label>
        <div>
          <label style={{ display: "block", marginTop: "5px" }}>
            <input
              type="radio"
              name="role"
              value="mentor"
              checked={data.role === "mentor"}
              onChange={handleChange}
            />
            {" Mentor (the person providing guidance)"}
          </label>
          <label style={{ display: "block", marginTop: "5px" }}>
            <input
              type="radio"
              name="role"
              value="mentee"
              checked={data.role === "mentee"}
              onChange={handleChange}
            />
            {" Mentee (the person receiving guidance)"}
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
