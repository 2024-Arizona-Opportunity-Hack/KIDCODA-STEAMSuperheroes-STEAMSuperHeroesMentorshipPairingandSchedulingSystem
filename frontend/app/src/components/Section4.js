import React from "react";
import "../styling/Form.css";

// A static enumeration of all 49 day/time-slot combos.
// Each has a unique id (1 to 49) and a label like "Monday - 7am to 9am".
const ALL_DAY_TIME_OPTIONS = [
  { id: 1,  day: "Monday",    time: "7am to 9am" },
  { id: 2,  day: "Monday",    time: "9am to 11am" },
  { id: 3,  day: "Monday",    time: "11am to 1pm" },
  { id: 4,  day: "Monday",    time: "1pm to 3pm" },
  { id: 5,  day: "Monday",    time: "3pm to 5pm" },
  { id: 6,  day: "Monday",    time: "5pm to 7pm" },
  { id: 7,  day: "Monday",    time: "7pm to 9pm" },

  { id: 8,  day: "Tuesday",   time: "7am to 9am" },
  { id: 9,  day: "Tuesday",   time: "9am to 11am" },
  { id: 10, day: "Tuesday",   time: "11am to 1pm" },
  { id: 11, day: "Tuesday",   time: "1pm to 3pm" },
  { id: 12, day: "Tuesday",   time: "3pm to 5pm" },
  { id: 13, day: "Tuesday",   time: "5pm to 7pm" },
  { id: 14, day: "Tuesday",   time: "7pm to 9pm" },

  { id: 15, day: "Wednesday", time: "7am to 9am" },
  { id: 16, day: "Wednesday", time: "9am to 11am" },
  { id: 17, day: "Wednesday", time: "11am to 1pm" },
  { id: 18, day: "Wednesday", time: "1pm to 3pm" },
  { id: 19, day: "Wednesday", time: "3pm to 5pm" },
  { id: 20, day: "Wednesday", time: "5pm to 7pm" },
  { id: 21, day: "Wednesday", time: "7pm to 9pm" },

  { id: 22, day: "Thursday",  time: "7am to 9am" },
  { id: 23, day: "Thursday",  time: "9am to 11am" },
  { id: 24, day: "Thursday",  time: "11am to 1pm" },
  { id: 25, day: "Thursday",  time: "1pm to 3pm" },
  { id: 26, day: "Thursday",  time: "3pm to 5pm" },
  { id: 27, day: "Thursday",  time: "5pm to 7pm" },
  { id: 28, day: "Thursday",  time: "7pm to 9pm" },

  { id: 29, day: "Friday",    time: "7am to 9am" },
  { id: 30, day: "Friday",    time: "9am to 11am" },
  { id: 31, day: "Friday",    time: "11am to 1pm" },
  { id: 32, day: "Friday",    time: "1pm to 3pm" },
  { id: 33, day: "Friday",    time: "3pm to 5pm" },
  { id: 34, day: "Friday",    time: "5pm to 7pm" },
  { id: 35, day: "Friday",    time: "7pm to 9pm" },

  { id: 36, day: "Saturday",  time: "7am to 9am" },
  { id: 37, day: "Saturday",  time: "9am to 11am" },
  { id: 38, day: "Saturday",  time: "11am to 1pm" },
  { id: 39, day: "Saturday",  time: "1pm to 3pm" },
  { id: 40, day: "Saturday",  time: "3pm to 5pm" },
  { id: 41, day: "Saturday",  time: "5pm to 7pm" },
  { id: 42, day: "Saturday",  time: "7pm to 9pm" },

  { id: 43, day: "Sunday",    time: "7am to 9am" },
  { id: 44, day: "Sunday",    time: "9am to 11am" },
  { id: 45, day: "Sunday",    time: "11am to 1pm" },
  { id: 46, day: "Sunday",    time: "1pm to 3pm" },
  { id: 47, day: "Sunday",    time: "3pm to 5pm" },
  { id: 48, day: "Sunday",    time: "5pm to 7pm" },
  { id: 49, day: "Sunday",    time: "7pm to 9pm" },
];

// We'll group them by day so we can display a 7×7 table
// Monday -> items 1..7
// Tuesday -> items 8..14
// etc.

function groupByDay() {
  const dayMap = new Map();
  // Populate dayMap with day -> array of {id, day, time}
  for (let slot of ALL_DAY_TIME_OPTIONS) {
    if (!dayMap.has(slot.day)) {
      dayMap.set(slot.day, []);
    }
    dayMap.get(slot.day).push(slot);
  }

  // Return an array of [day, arrayOfSlots], in day-of-week order
  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  return dayOrder.map((day) => {
    const slots = dayMap.get(day) || [];
    return { day, slots };
  });
}

function Section4({ data, updateData, onSubmit, loading }) {
  // For user feedback if not enough checkboxes are selected
  const [error, setError] = React.useState("");

  /**
   * For each checkbox, we store the numeric ID in data.availability, 
   * which is an array of numbers.
   */
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const numericId = parseInt(value, 10);
    
    // Find the slot object to get the day and time
    const slotObj = ALL_DAY_TIME_OPTIONS.find(slot => slot.id === numericId);
    if (!slotObj) return;
    
    // Create the formatted string like "Monday-7am to 9am"
    const formattedSlot = `${slotObj.day}-${slotObj.time}`;
    
    // Get current availability as an array of formatted strings
    const currentAvailability = data.availability || [];
    
    if (checked) {
      // Add the formatted string to the availability array
      updateData({ 
        availability: [...currentAvailability, formattedSlot]
      });
    } else {
      // Remove the formatted string from the availability array
      const newAvailability = currentAvailability.filter(slot => slot !== formattedSlot);
      updateData({
        availability: newAvailability
      });
    }
  };

  /**
   * For unavailable date ranges input, store raw text in data.unavailableDates
   */
  const handleUnavailableDatesChange = (e) => {
    updateData({ unavailableDates: e.target.value });
  };

  /**
   * On submit, user must have at least 3 numeric IDs in availability
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const countSelected = (data.availability || []).length;
    if (countSelected < 3) {
      setError("Please select at least 3 timeslots.");
      return;
    }
    setError("");
    
    // Submit with availability as an array
    onSubmit();
  };

  // Group by day, so we can create a 7×7 table
  const dayGroups = groupByDay(); // array of { day, slots }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-heading">Calendar Availability</h2>
      <p>
        What day/times are good for regular meetings? <br />
        <strong>(Must choose at least 3.)</strong>
      </p>

      {error && <div className="error-message">{error}</div>}

      {/* Build a 7×7 table from dayGroups */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  backgroundColor: "#F2F2F2",
                  padding: "8px",
                  width: "150px",
                }}
              >
                Day \ Time
              </th>
              {/* We'll show 7 columns for the timeslots, but to maintain the original approach, 
                  we might just show them horizontally. We'll do each day's row. */}
              {/* Actually, we have 7 times per day => 7 columns. We'll just map over the dayGroups. */}
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                7am to 9am
              </th>
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                9am to 11am
              </th>
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                11am to 1pm
              </th>
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                1pm to 3pm
              </th>
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                3pm to 5pm
              </th>
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                5pm to 7pm
              </th>
              <th style={{ backgroundColor: "#F2F2F2", padding: "8px" }}>
                7pm to 9pm
              </th>
            </tr>
          </thead>
          <tbody>
            {dayGroups.map((group) => (
              <tr key={group.day}>
                {/* First column is the day name */}
                <td
                  style={{
                    padding: "8px",
                    fontWeight: "bold",
                    backgroundColor: "#FFF",
                  }}
                >
                  {group.day}
                </td>
                {/* Now we show 7 time slots in columns for that day. 
                    We rely on the fact that group.slots is sorted by id/time. */}
                {group.slots.map((slotObj) => {
                  const numericId = slotObj.id;
                  return (
                    <td
                      key={numericId}
                      style={{ textAlign: "center", padding: "8px" }}
                    >
                      <input
                        type="checkbox"
                        value={numericId}
                        // Check if data.availability includes the formatted string
                        checked={(data.availability || []).includes(`${slotObj.day}-${slotObj.time}`)}
                        onChange={handleCheckboxChange}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unavailable date ranges */}
      {/* <div style={{ marginTop: "20px" }}>
        <label htmlFor="unavailableDates" style={{ fontWeight: "bold" }}>
          What are specific date ranges that you are NOT available?
        </label>
        <p style={{ fontSize: "0.9rem", marginTop: "5px" }}>
          Please enter in <strong>YYYYMMDD format</strong> with commas between
          each date or date range. Use a dash (<strong>-</strong>) to specify a
          range.
          <br />
          <em>Example: 20231001,20231005-20231007,20231225</em>
        </p>
        <input
          type="text"
          id="unavailableDates"
          name="unavailableDates"
          className="floating-input"
          style={{ width: "100%", marginTop: "5px" }}
          placeholder="e.g. 20231001,20231005-20231007"
          value={data.unavailableDates || ""}
          onChange={handleUnavailableDatesChange}
        />
      </div> */}

      <button
        type="submit"
        className="form-button"
        style={{ marginTop: "20px" }}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default Section4;
