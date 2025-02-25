// src/utils.js

/**
 * Converts a JSON object to a CSV string.
 * @param {Object} data - The JSON data to convert.
 * @returns {string} - The CSV formatted string.
 */
export function convertToCSV(data) {
    const headers = Object.keys(data);
    const rows = [];
  
    // Prepare headers
    const headerRow = headers.map(header => `"${header}"`).join(",");
    rows.push(headerRow);
  
    // Prepare data rows
    const dataRow = headers.map(header => {
      let value = data[header];
  
      if (Array.isArray(value)) {
        // Join array items with semicolon or comma
        value = value.join("; ");
      }
  
      // Handle undefined or null values
      if (value === undefined || value === null) {
        value = "";
      }
  
      // Escape double quotes by doubling them
      if (typeof value === "string") {
        value = value.replace(/"/g, '""');
      }
  
      return `"${value}"`;
    }).join(",");
  
    rows.push(dataRow);
  
    return rows.join("\n");
  }
   