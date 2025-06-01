import React, { useState } from "react";
import "../styling/Form.css";

// List of U.S. states (value : label)
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

// Age bracket options for radio buttons
const AGE_BRACKETS = [
  "9-13",
  "13-18",
  "18-22",
  "22-30",
  "30-40",
  "40-50",
  "50-60",
  "60+",
];

// Ethnicity (checkbox) options
const ETHNICITY_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian: Includes Chinese, Japanese, Filipino, Korean, South Asian, and Vietnamese",
  "South Asian: Includes Indian, Pakistan, Sri Lankan, Bangaladesh",
  "Black or African American: Includes Jamaican, Nigerian, Haitian, and Ethiopian",
  "Hispanic or Latino: Includes Puerto Rican, Mexican, Cuban, Salvadoran, and Colombian",
  "Middle Eastern or North African: Includes Lebanese, Iranian, Egyptian, Moroccan, Israeli, and Palestinian",
  "Native Hawaiian or Pacific Islander: Includes Samoan, Guamanian, Chamorro, and Tongan",
  "White or European: Includes German, Irish, English, Italian, Polish, and French",
  "Other",
];

// Ethnicity matching preference (radio)
const ETHNICITY_MATCH_OPTIONS = [
  "Prefer ONLY to be matched within that similarity",
  "Prefer it, but available to others as needed",
  "Prefer NOT to be matched within that similarity",
  "Do not have a preference. Either is fine.",
  "Other",
];

// Gender (checkbox) options
const GENDER_OPTIONS = [
  "Cisgender Male",
  "Cisgender Female",
  "Transgender Male",
  "Transgender Female",
  "Prefer not to disclose",
  "Other",
];

// Gender matching preference (radio)
const GENDER_MATCH_OPTIONS = [
  "Prefer ONLY to be matched within that similarity",
  "Prefer it, but available to others as needed",
  "Prefer NOT to be matched within that similarity",
  "Do not have a preference. Either is fine.",
  "Other",
];

// Preferred methods (checkbox) options
const METHOD_OPTIONS = [
  "Web Conference (i.e. Zoom Conference)",
  "In Person",
  "Hybrid (Both In Person and web)",
  "Other",
];

// Role (radio)
const ROLE_OPTIONS = [
  { value: "mentor", label: "Mentor (the person providing guidance)" },
  { value: "mentee", label: "Mentee (the person receiving guidance)" },
];

const FormComponent = () => {
  const [formData, setFormData] = useState({
    // Existing fields
    email: "",
    name: "",
    ageBracket: "",
    phoneNumber: "",
    city: "",
    state: "",
    ethnicities: [],

    // New fields
    ethnicityPreference: "",
    gender: [],
    genderPreference: "",
    methods: [],
    role: "",
  });

  const [errors, setErrors] = useState({});

  // Handle text, select, radio inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkboxes (ethnicities, gender, methods)
  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, [fieldName]: [...prev[fieldName], value] };
      } else {
        return {
          ...prev,
          [fieldName]: prev[fieldName].filter((item) => item !== value),
        };
      }
    });
  };

  // Validation & submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required.";
    }

    // Age bracket validation
    if (!formData.ageBracket) {
      newErrors.ageBracket = "Please select an age bracket.";
    }

    // Phone number validation (basic US format)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (
      !/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(
        formData.phoneNumber
      )
    ) {
      newErrors.phoneNumber = "Invalid phone number format.";
    }

    // City validation
    if (!formData.city) {
      newErrors.city = "City is required.";
    }

    // State validation
    if (!formData.state) {
      newErrors.state = "Please select a state.";
    }

    // (OPTIONAL) Additional validations for new fields if required
    // if (!formData.ethnicityPreference) {
    //   newErrors.ethnicityPreference = "Please choose a preference.";
    // }
    // if (!formData.genderPreference) {
    //   newErrors.genderPreference = "Please choose a gender matching preference.";
    // }
    // if (!formData.role) {
    //   newErrors.role = "Please select a role.";
    // }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!");
      console.log("Form Data:", formData);

      // Optionally reset the form:
      // setFormData({
      //   email: "",
      //   name: "",
      //   ageBracket: "",
      //   phoneNumber: "",
      //   city: "",
      //   state: "",
      //   ethnicities: [],
      //   ethnicityPreference: "",
      //   gender: [],
      //   genderPreference: "",
      //   methods: [],
      //   role: "",
      // });
    }
  };

  return (
    <div className="page-container">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-heading">STEAM Form (Mentor Mentee Matching)</h2>

        {/* Email (floating label) */}
        <label className="floating-label">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" "
            className="floating-input"
          />
          <span className="floating-label-text">Email</span>
        </label>
        {errors.email && <div className="error-message">{errors.email}</div>}

        {/* Name (floating label) */}
        <label className="floating-label">
          <input
            type="text"
            name="name"
            placeholder=" "
            className="floating-input"
            value={formData.name}
            onChange={handleChange}
          />
          <span className="floating-label-text">Name</span>
        </label>
        {errors.name && <div className="error-message">{errors.name}</div>}

        {/* Age Bracket (radio buttons) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Age Bracket:</label>
          <div>
            {AGE_BRACKETS.map((bracket) => (
              <label key={bracket} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="radio"
                  name="ageBracket"
                  value={bracket}
                  checked={formData.ageBracket === bracket}
                  onChange={handleChange}
                />
                {` ${bracket}`}
              </label>
            ))}
          </div>
          {errors.ageBracket && (
            <div className="error-message">{errors.ageBracket}</div>
          )}
        </div>

        {/* Phone Number (floating label) */}
        <label className="floating-label">
          <input
            type="text"
            name="phoneNumber"
            placeholder=" "
            className="floating-input"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <span className="floating-label-text">Phone Number</span>
        </label>
        {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}

        {/* City (floating label) */}
        <label className="floating-label">
          <input
            type="text"
            name="city"
            placeholder=" "
            className="floating-input"
            value={formData.city}
            onChange={handleChange}
          />
          <span className="floating-label-text">City</span>
        </label>
        {errors.city && <div className="error-message">{errors.city}</div>}

        {/* State dropdown */}
        <select
          name="state"
          className="form-input"
          value={formData.state}
          onChange={handleChange}
        >
          <option value="">Select State</option>
          {US_STATES.map((st) => (
            <option key={st.value} value={st.value}>
              {`${st.value} : ${st.label}`}
            </option>
          ))}
        </select>
        {errors.state && <div className="error-message">{errors.state}</div>}

        {/* Ethnicities (checkboxes) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Ethnicities:</label>
          <div>
            {ETHNICITY_OPTIONS.map((ethnicity) => (
              <label
                key={ethnicity}
                style={{ display: "block", marginTop: "5px" }}
              >
                <input
                  type="checkbox"
                  name="ethnicities"
                  value={ethnicity}
                  checked={formData.ethnicities.includes(ethnicity)}
                  onChange={(e) => handleCheckboxChange(e, "ethnicities")}
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
            {ETHNICITY_MATCH_OPTIONS.map((option) => (
              <label key={option} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="radio"
                  name="ethnicityPreference"
                  value={option}
                  checked={formData.ethnicityPreference === option}
                  onChange={handleChange}
                />
                {` ${option}`}
              </label>
            ))}
          </div>
        </div>

        {/* Gender (checkboxes) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Gender:</label>
          <div>
            {GENDER_OPTIONS.map((g) => (
              <label key={g} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="checkbox"
                  name="gender"
                  value={g}
                  checked={formData.gender.includes(g)}
                  onChange={(e) => handleCheckboxChange(e, "gender")}
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
            {GENDER_MATCH_OPTIONS.map((option) => (
              <label key={option} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="radio"
                  name="genderPreference"
                  value={option}
                  checked={formData.genderPreference === option}
                  onChange={handleChange}
                />
                {` ${option}`}
              </label>
            ))}
          </div>
        </div>

        {/* Methods (checkboxes) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>What methods are you open to?</label>
          <div>
            {METHOD_OPTIONS.map((method) => (
              <label key={method} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="checkbox"
                  name="methods"
                  value={method}
                  checked={formData.methods.includes(method)}
                  onChange={(e) => handleCheckboxChange(e, "methods")}
                />
                {` ${method}`}
              </label>
            ))}
          </div>
        </div>

        {/* Role (radio) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Choose the role you're signing up for:</label>
          <div>
            {ROLE_OPTIONS.map((r) => (
              <label key={r.value} style={{ display: "block", marginTop: "5px" }}>
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={formData.role === r.value}
                  onChange={handleChange}
                />
                {` ${r.label}`}
              </label>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button type="submit" className="form-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormComponent;
