import React, { useState, useEffect, useRef } from "react";

// Replace with your actual Geoapify API Key
const GEOAPIFY_API_KEY = "PLEASE_REPLACE_WITH_YOUR_OWN_GEOAPIFY_API_KEY";

// We embed 'type=city&limit=5&filter=countrycode:us,ca' into our fetch URL
const AUTOCOMPLETE_BASE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

function CityAutocomplete() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Store the final selected city & timezone display
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");

  // For closing the dropdown if user clicks outside
  const wrapperRef = useRef(null);

  // Close dropdown if a user clicks outside the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions whenever searchText changes (min 3 chars)
  useEffect(() => {
    if (searchText.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const url = `${AUTOCOMPLETE_BASE_URL}?text=${encodeURIComponent(
          searchText
        )}&apiKey=${GEOAPIFY_API_KEY}&type=city&limit=5&filter=countrycode:us,ca`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          setSuggestions(data.features);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowDropdown(false);
      }
    };

    fetchSuggestions();
  }, [searchText]);

  // Handle a city being selected
  const handleSelect = (feature) => {
    // The user selected this location
    const cityName = feature.properties.formatted || "Unknown location";
    setSelectedCity(cityName);
    setSearchText(cityName);

    // Retrieve the desired timezone info
    const tz = feature.properties.timezone;
    // We just want abbreviation_STD & offset_STD (if they exist)
    if (tz && tz.abbreviation_STD && tz.offset_STD) {
      setSelectedTimezone(`${tz.abbreviation_STD}, ${tz.offset_STD}`);
    } else {
      // If not available, set a fallback
      setSelectedTimezone("Timezone not available");
    }

    // Close the dropdown
    setShowDropdown(false);
  };

  // Optional: Show dropdown on focus if suggestions are available
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <label htmlFor="city-input" className="input-label">
        Type a city (min 3 letters):
      </label>
      <div className="dropdown-input-wrapper">
        <input
          id="city-input"
          type="text"
          className="city-input"
          placeholder="Start typing..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            // If user modifies input, reset selected city/timezone
            setSelectedCity("");
            setSelectedTimezone("");
          }}
          onFocus={handleFocus}
        />
        {/* Optional caret icon or arrow to indicate dropdown (CSS-based or an SVG) */}
        <span className="dropdown-caret">▾</span>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((feat, idx) => {
            const formatted = feat.properties.formatted || "Unknown location";
            return (
              <li
                key={idx}
                className="suggestion-item"
                onClick={() => handleSelect(feat)}
              >
                {formatted}
              </li>
            );
          })}
        </ul>
      )}

      {/* Display selected city & timezone */}
      {selectedCity && (
        <div className="selected-info">
          <div>
            <strong>City:</strong> {selectedCity}
          </div>
          <div>
            <strong>Timezone:</strong> {selectedTimezone}
          </div>
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
