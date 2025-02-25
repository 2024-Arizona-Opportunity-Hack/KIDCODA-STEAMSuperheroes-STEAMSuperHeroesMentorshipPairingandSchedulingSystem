import React, { useState, useContext, useEffect, useRef } from "react";
import "../styling/Form.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SESSION_TYPE_OPTIONS = [
  "Homework Help",
  "Exposure to STEAM in general",
  "College guidance",
  "Career guidance",
  "Explore a particular field",
  "Other: text",
];

const MEETING_DURATION_OPTIONS = [
  "15 min",
  "30 min",
  "45 min",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "Other",
];

const CADENCE_OPTIONS = ["Weekly", "Bi-Weekly", "Monthly", "Ad Hoc"];
const GEOAPIFY_API_KEY = "4c3e17e2a46e47deadb5256cb7f29d1d";

function AutocompleteCityInput({ onSelect, value }) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value === "") setSearchText("");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchText.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          searchText
        )}&apiKey=${GEOAPIFY_API_KEY}&type=city&limit=5&filter=countrycode:us,ca`;

        const response = await fetch(url);
        const data = await response.json();

        setSuggestions(data.features || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowDropdown(false);
      }
    };

    fetchSuggestions();
  }, [searchText]);

  const handleSelect = (feature) => {
    const cityName = feature.properties.formatted || "Unknown location";
    const tz = feature.properties.timezone;
    let tzString = "Timezone not available";
    
    if (tz) {
      tzString = [tz.abbreviation_STD, tz.offset_STD]
        .filter(Boolean)
        .join(", ");
    }

    setSearchText(cityName);
    onSelect(cityName, tzString);
    setShowDropdown(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <label className="floating-label">
        <input
          type="text"
          className="floating-input"
          placeholder=" "
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value === "") onSelect("", "");
          }}
          onFocus={() => setShowDropdown(suggestions.length > 0)}
        />
        <span className="floating-label-text">Session Location (City)</span>
      </label>

      {showDropdown && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((feat, idx) => (
            <li
              key={idx}
              className="suggestion-item"
              onClick={() => handleSelect(feat)}
            >
              {feat.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateSessionPage() {
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState({
    sessionName: "",
    description: "",
    sessionLocation: "",
    timezone: "",
    sessionStart: "",
    sessionEnd: "",
    sessionType: "",
    nbrMeetings: "",
    meetingDurations: [],
    cadence: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMeetingDurationChange = (e) => {
    const { value, checked } = e.target;
    setSessionData((prev) => ({
      ...prev,
      meetingDurations: checked
        ? [...prev.meetingDurations, value]
        : prev.meetingDurations.filter((d) => d !== value),
    }));
  };

  const handleCitySelect = (city, timezone) => {
    setSessionData((prev) => ({
      ...prev,
      sessionLocation: city,
      timezone: timezone,
    }));
  };

  const validateSessionData = () => {
    if (!sessionData.sessionName) return "Session Name is required.";
    if (!sessionData.description) return "Description is required.";
    if (!sessionData.sessionLocation) return "Session Location is required.";
    if (!sessionData.timezone) return "Please select a valid city from suggestions.";
    if (!sessionData.sessionStart) return "Session Start Date/Time is required.";
    if (!sessionData.sessionEnd) return "Session End Date/Time is required.";
    if (!sessionData.sessionType) return "Session Type is required.";
    if (!sessionData.nbrMeetings) return "Number of Meetings is required.";
    
    const num = parseInt(sessionData.nbrMeetings, 10);
    if (isNaN(num) || num < 1) return "Number of Meetings must be a positive integer.";
    if (sessionData.meetingDurations.length === 0) return "Select at least one Meeting Duration.";
    if (!sessionData.cadence) return "Cadence is required.";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
  
    if (!accessToken) {
      setErrorMsg("Authentication required. Please log in.");
      return;
    }
  
    const error = validateSessionData();
    if (error) return setErrorMsg(error);
  
    // Validate timezone format
    const validTimezones = new Set(["EST", "MST", "CST", "PST", "AKST", "HST", "GMT"]);
    const rawTimezone = sessionData.timezone.split(",")[0].trim().toUpperCase();
    const timezoneAbbreviation = validTimezones.has(rawTimezone) ? rawTimezone : null;
  
    if (!timezoneAbbreviation) {
      setErrorMsg("Invalid timezone. Please select a valid North American timezone.");
      return;
    }
  
    // Validate number of meetings
    const numberOfMeetings = parseInt(sessionData.nbrMeetings, 10);
    if (isNaN(numberOfMeetings) || numberOfMeetings < 0) {
      setErrorMsg("Number of meetings must be a positive integer");
      return;
    }
  
    setLoading(true);
  
    try {
      const payload = {
        description: sessionData.description.toString(),
        location: sessionData.sessionLocation.toString(),
        timezone: timezoneAbbreviation,
        start_date: new Date(sessionData.sessionStart).toISOString(),
        end_date: new Date(sessionData.sessionEnd).toISOString(),
        active: true,
        session_type: sessionData.sessionType.toString(),
        number_of_meetings: numberOfMeetings,
        meeting_duration: sessionData.meetingDurations.map(d => d.toString()),
        cadence: sessionData.cadence.toString(),
        session_name: sessionData.sessionName.toString()
      };
  
      console.log("Submitting payload:", payload); // For debugging
  
      const response = await fetch('/api/v1/session/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Details:", errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
  
      alert("Session created successfully!");
      setSessionData({
        sessionName: "",
        description: "",
        sessionLocation: "",
        timezone: "",
        sessionStart: "",
        sessionEnd: "",
        sessionType: "",
        nbrMeetings: "",
        meetingDurations: [],
        cadence: "",
      });
  
    } catch (err) {
      setErrorMsg(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="form-heading">Create a New Session</h2>

        {errorMsg && <div className="error-message">{errorMsg}</div>}
        {loading && <div className="loading">Creating session...</div>}

        <form onSubmit={handleSubmit}>
          <label className="floating-label">
            <input
              type="text"
              name="sessionName"
              className="floating-input"
              placeholder=" "
              value={sessionData.sessionName}
              onChange={handleChange}
              required
            />
            <span className="floating-label-text">Session Name</span>
          </label>

          <label className="floating-label">
            <textarea
              name="description"
              className="floating-input"
              placeholder=" "
              value={sessionData.description}
              onChange={handleChange}
              required
            />
            <span className="floating-label-text">Description</span>
          </label>

          <AutocompleteCityInput
            onSelect={handleCitySelect}
            value={sessionData.sessionLocation}
          />

          <label className="floating-label">
            <input
              type="text"
              className="floating-input"
              placeholder=" "
              value={sessionData.timezone}
              readOnly
            />
            <span className="floating-label-text">Timezone</span>
          </label>

          <label className="floating-label">
            <input
              type="datetime-local"
              name="sessionStart"
              className="floating-input"
              placeholder=" "
              value={sessionData.sessionStart}
              onChange={handleChange}
              required
            />
            <span className="floating-label-text">Session Start</span>
          </label>

          <label className="floating-label">
            <input
              type="datetime-local"
              name="sessionEnd"
              className="floating-input"
              placeholder=" "
              value={sessionData.sessionEnd}
              onChange={handleChange}
              required
            />
            <span className="floating-label-text">Session End</span>
          </label>

          <select
            name="sessionType"
            className="form-input"
            value={sessionData.sessionType}
            onChange={handleChange}
            required
          >
            <option value="">Select Session Type</option>
            {SESSION_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <label className="floating-label">
            <input
              type="number"
              name="nbrMeetings"
              className="floating-input"
              placeholder=" "
              value={sessionData.nbrMeetings}
              onChange={handleChange}
              min="1"
              required
            />
            <span className="floating-label-text">Number of Meetings</span>
          </label>

          <div className="duration-checkboxes">
            <label>Meeting Duration(s):</label>
            {MEETING_DURATION_OPTIONS.map((opt) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  value={opt}
                  checked={sessionData.meetingDurations.includes(opt)}
                  onChange={handleMeetingDurationChange}
                />
                {opt}
              </label>
            ))}
          </div>

          <select
            name="cadence"
            className="form-input"
            value={sessionData.cadence}
            onChange={handleChange}
            required
          >
            <option value="">Select Cadence</option>
            {CADENCE_OPTIONS.map((cd) => (
              <option key={cd} value={cd}>{cd}</option>
            ))}
          </select>

          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Session"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSessionPage;