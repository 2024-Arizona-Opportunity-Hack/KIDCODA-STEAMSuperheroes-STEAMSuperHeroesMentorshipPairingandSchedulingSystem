// src/components/MultiStepForm.jsx

import React, { useState, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Section1 from "./Section1";
import Section2Mentor from "./Section2Mentor";
import Section3Mentee from "./Section3Mentee";
import Section4 from "./Section4";
import StepProgressBar from "./StepProgressBar";
import "../styling/Form.css";
import { AuthContext } from "../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
 
 

function MultiStepForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { logout, accessToken, isAdmin } = useContext(AuthContext);
 
  /**
   * formData with numeric IDs for checkboxes/radios
   */
  const [formData, setFormData] = useState({
    // ====== Section 1 fields ======
    email: "",
    name: "",
    ageBracket: "",
    phoneNumber: "",
    city: "",
    state: "",
    ethnicities: [],
    ethnicityPreference: "",
    gender: [],
    genderPreference: "",
    methods: [],
    roles: [], // Change role to roles and initialize as empty array

    // ====== Section 2 (Mentor) fields ======
    steamBackground: "",
    academicLevel: "",
    professionalTitle: "",
    currentEmployer: "",
    reasonsForMentoring: "",
    willingToAdvise: 1,
    sessionPreferences: [], // Add this for mentor

    // ====== Section 3 (Mentee) fields ======
    grade: "",
    mentoringType: [],
    reasonsForMentor: "",
    reasonsForMentorOther: "",
    interests: "",
    interestsOther: "",

    // ====== Section 4 ======
    availability: [],
    unavailableDates: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 4;
  const stepLabels = ["Basic Info", "Mentor Profile", "Mentee Profile", "Calendar Availability"];

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNextFromSection1 = () => {
    if (formData.roles?.includes("mentor")) {
      setStep(2);
      navigate("/form/section2");
    } else if (formData.roles?.includes("mentee")) {
      setStep(3);
      navigate("/form/section3");
    } else {
      alert("Please select at least one role (Mentor or Mentee) in Section 1.");
    }
  };

  // Update the handleNextFromSection2 function to check for mentee role
  const handleNextFromSection2 = () => {
    // If user is also a mentee, go to Section 3 next
    if (formData.roles?.includes("mentee")) {
      setStep(3);
      navigate("/form/section3");
    } else {
      // Otherwise go directly to Section 4
      setStep(4);
      navigate("/form/section4");
    }
  };

  const handleNextFromSection3 = () => {
    setStep(4);
    navigate("/form/section4");
  };

  /**
   * Utility to convert final JSON into CSV string for download,
   * preserving arrays as JSON strings, e.g. [1,4].
   */
  const generateCSV = (finalObj) => {
    const headers = Object.keys(finalObj);
    const rows = [];

    // Header row
    rows.push(headers.join(","));

    // Data row
    const dataRow = headers
      .map((h) => {
        let val = finalObj[h];

        if (Array.isArray(val)) {
          // Convert array to JSON, e.g. [1,4,9]
          val = JSON.stringify(val);
        }
        if (val == null) {
          val = "";
        }
        if (typeof val === "string") {
          val = val.replace(/"/g, '""'); // Escape quotes
        }

        return `"${val}"`;
      })
      .join(",");

    rows.push(dataRow);
    return rows.join("\n");
  };

  /**
   * Helper to handle CSV download
   */
  const downloadCSV = (objForCSV, filename) => {
    const csvString = generateCSV(objForCSV);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and click it
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  };

  /**
   * Final submission in Section4:
   * We'll download CSV first with arrays as JSON, then call the API.
   */
  const handleSubmitFinal = async () => {
    setLoading(true);
    setError(null);

    try {
      const isMentor = formData.roles?.includes("mentor");
      const isMentee = formData.roles?.includes("mentee");
      
      // Create unified payload matching API schema
      const payload = {
        // Common fields
        email: formData.email,
        name: formData.name,
        ageBracket: formData.ageBracket,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        state: formData.state,
        ethnicities: formData.ethnicities,
        ethnicityPreference: formData.ethnicityPreference,
        gender: formData.gender,
        genderPreference: formData.genderPreference,
        methods: formData.methods,
        role: formData.roles[0], // Use the first selected role as the primary
        dateOfBirth: new Date().toISOString().split('T')[0], // Add required date field
        age: 0, // Add required age field
        availability: formData.availability || [],
        
        // Mentor data - null if not a mentor
        mentor: isMentor ? {
          mentoringType: formData.sessionPreferences,
          willingToAdvise: formData.willingToAdvise,
          currentMentees: 0,
          steamBackground: formData.steamBackground,
          academicLevel: formData.academicLevel,
          professionalTitle: formData.professionalTitle,
          currentEmployer: formData.currentEmployer,
          reasonsForMentoring: formData.reasonsForMentoring
        } : null,
        
        // Mentee data - null if not a mentee
        mentee: isMentee ? {
          grade: formData.grade,
          mentoringType: formData.sessionPreferences.map(type => ({
            type: type,
            is_match_found: false
          })),
          reasonsForMentor: formData.reasonsForMentor,
          reasonsForMentorOther: formData.reasonsForMentorOther || "",
          interests: formData.interests,
          interestsOther: formData.interestsOther || ""
        } : null
      };

      console.log("Unified payload:", payload);

      // Download CSV with unified structure
      downloadCSV(payload, "user_preferences_data.csv");

      // Call a single API endpoint for both types
      try {
        const response = await fetch('/api/v1/user_preferences/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // Special handling for 422 validation errors
          if (response.status === 422) {
            console.error("Validation error:", errorData);
            
            let errorMessage = "Please check the following fields:\n";
            
            // Handle the specific error format from your API
            if (errorData.errors) {
              errorData.errors.forEach(err => {
                const field = err.loc.slice(1).join('.');
                errorMessage += `• ${field}: ${err.msg}\n`;
              });
            } else if (errorData.detail?.errors) {
              errorData.detail.errors.forEach(err => {
                const field = err.loc.slice(1).join('.');
                errorMessage += `• ${field}: ${err.msg}\n`;
              });
            } else if (errorData.message) {
              errorMessage = `${errorData.message}`;
            } else {
              errorMessage = "Form data validation failed. Please check your inputs.";
            }
            
            setError(errorMessage);
            setLoading(false);
            return; // Don't continue
          }
          
          throw new Error(errorData.detail || "Error submitting form");
        }
        
        const responseData = await response.json();
        console.log("Registration successful:", responseData);
        alert("Form submitted successfully! Your data has been uploaded.");
        
        // final step
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
        
      } catch (err) {
        console.error("Error submitting form:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }

    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      navigate("/form/section1");
    } else if (step === 3) {
      setStep(1);
      navigate("/form/section1");
    } else if (step === 4) {
      if (formData.roles?.includes("mentor")) {
        setStep(2);
        navigate("/form/section2");
      } else {
        setStep(3);
        navigate("/form/section3");
      }
    }
  };

  return (
    <div className="page-container">
      <StepProgressBar
        step={step}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
        role={formData.roles}
        isAdmin={isAdmin} // Pass the whole array
      />

      {step > 1 && (
        <div className="navigation-buttons">
          <button
            type="button"
            onClick={handleBack}
            className="back-button"
          >
            <FaArrowLeft size={16} style={{ marginRight: "5px" }} />
            Back
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <Routes>
        <Route
          path="section1"
          element={
            <Section1
              data={formData}
              updateData={updateFormData}
              onNext={handleNextFromSection1}
            />
          }
        />
        <Route
          path="section2"
          element={
            formData.roles?.includes("mentor") ? (
              <Section2Mentor
                data={formData}
                updateData={updateFormData}
                onNext={handleNextFromSection2}
              />
            ) : (
              <Navigate to="section1" replace />
            )
          }
        />
        <Route
          path="section3"
          element={
            formData.roles?.includes("mentee") ? (
              <Section3Mentee
                data={formData}
                updateData={updateFormData}
                onNext={handleNextFromSection3}
              />
            ) : (
              <Navigate to="section1" replace />
            )
          }
        />
        <Route
          path="section4"
          element={
            <Section4
              data={formData}
              updateData={updateFormData}
              onSubmit={handleSubmitFinal}
              loading={loading}
            />
          }
        />
        {/* Redirect /form to /form/section1 */}
        <Route path="/" element={<Navigate to="section1" replace />} />
      </Routes>
    </div>
  );
}

export default MultiStepForm;
