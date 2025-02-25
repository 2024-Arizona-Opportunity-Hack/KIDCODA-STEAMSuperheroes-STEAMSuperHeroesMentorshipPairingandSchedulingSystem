// src/components/MultiStepForm.jsx

import React, { useState, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Section1 from "./Section1";
import Section2Mentor from "./Section2Mentor";
import Section3Mentee from "./Section3Mentee";
import Section4 from "./Section4";
import StepProgressBar from "./StepProgressBar";
import { FaArrowLeft } from "react-icons/fa";
import "../styling/Form.css";
import { AuthContext } from "../context/AuthContext";
import { registerMentor, registerMentee } from "../api"; // Your API functions

function MultiStepForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  /**
   * formData with numeric IDs for checkboxes/radios
   */
  const [formData, setFormData] = useState({
    // ====== Section 1 fields ======
    email: "",
    name: "",
    ageBracket: 0,
    phoneNumber: "",
    city: "",
    state: "",
    ethnicities: [],
    sessionPreferences: [],
    ethnicityPreference: 0,
    gender: [],
    genderPreference: 0,
    methods: [],
    role: "", // 'mentor' or 'mentee'

    // ====== Section 2 (Mentor) fields ======
    steamBackground: 0,
    academicLevel: 0,
    professionalTitle: "",
    currentEmployer: "",
    reasonsForMentoring: 0,
    willingToAdvise: 1,

    // ====== Section 3 (Mentee) fields ======
    grade: 0,
    reasonsForMentor: [],
    reasonsForMentorOther: "",
    interests: [],
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
    if (formData.role === "mentor") {
      setStep(2);
      navigate("/form/section2");
    } else if (formData.role === "mentee") {
      setStep(3);
      navigate("/form/section3");
    } else {
      alert("Please select a role (Mentor or Mentee) in Section 1.");
    }
  };

  const handleNextFromSection2 = () => {
    setStep(4);
    navigate("/form/section4");
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
      let payload;
      let isMentor = formData.role === "mentor";

      if (isMentor) {
        payload = {
          // Basic info
          email: formData.email,
          name: formData.name,
          phone_number: formData.phoneNumber,
          city: formData.city,
          state: formData.state,

          // numeric approach
          age_bracket: formData.ageBracket,
          ethnicities: formData.ethnicities,
          ethnicity_preference: formData.ethnicityPreference,
          gender: formData.gender,
          gender_preference: formData.genderPreference,
          methods: formData.methods,
          session_preferences: formData.sessionPreferences,
          role: formData.role, // "mentor"

          // mentor-specific
          steam_background: formData.steamBackground,
          academic_level: formData.academicLevel,
          professional_title: formData.professionalTitle,
          current_employer: formData.currentEmployer,
          reasons_for_mentoring: formData.reasonsForMentoring,
          willing_to_advise: formData.willingToAdvise,

          // section4
          availability: formData.availability,
          unavailable_dates: formData.unavailableDates,

          // Additional
          match_pair_ids: [],
          is_available_for_matching: true,
          mentoring_sessions_completed: 0,
        };
        console.log(payload.email);
        console.log(payload.ageBracket);
        console.log(payload.availability);
        console.log(payload.unavailableDates);

      } else if (formData.role === "mentee") {
        payload = {
          // Basic info
          email: formData.email,
          name: formData.name,
          phone_number: formData.phoneNumber,
          city: formData.city,
          state: formData.state,

          // numeric approach
          age_bracket: formData.ageBracket,
          ethnicities: formData.ethnicities,
          ethnicity_preference: formData.ethnicityPreference,
          gender: formData.gender,
          gender_preference: formData.genderPreference,
          methods: formData.methods,
          sessionPreferences: formData.sessionPreferences,
          role: formData.role, // "mentee"

          // mentee-specific
          grade: formData.grade,
          reasons_for_mentoring: formData.reasonsForMentor,
          interests: formData.interests,
          availability: formData.availability,
          unavailableDates: formData.unavailableDates,

          match_pair_ids: [],
          is_available_for_matching: true,
          mentoring_sessions_completed: 0,
        };

        // If "Other…" reason => attach text
        if (formData.reasonsForMentor.includes(4)) {
          payload.reasons_for_mentoring = [
            ...payload.reasons_for_mentoring,
            formData.reasonsForMentorOther,
          ];
        } else {
          payload.reasons_for_mentoring = [""];
        }

        // If "Other…" interest => attach text
        if (formData.interests.includes(8)) {
          payload.interests = [
            ...payload.interests,
            formData.interestsOther,
          ];
        } else {
          payload.interestsOther = [""];
        }

        console.log(payload.email);
        console.log(payload.ageBracket);
        console.log(payload.availability);
        console.log(payload.unavailableDates);

      } else {
        throw new Error("Invalid role selected.");
      }
      console.log(payload);
      // Download CSV with array fields as JSON
      if (isMentor) {
        downloadCSV(payload, "mentor_form_data.csv");
      } else {
        downloadCSV(payload, "mentee_form_data.csv");
      }

      // Then call the API
      let response;
      if (isMentor) {
        try {
          response = await registerMentor(payload);
        } 
        catch(err) {
          if (err.response?.status === 422) {
            console.error("422 Error detail:", err.response.data.detail);
          }
          console.error(err);
        }
      } else {
        try {
          response = await registerMentee(payload);
        } 
        catch(err) {
          if (err.response?.status === 422) {
            console.error("422 Error detail:", err.response.data.detail);
          }
          console.error(err);
        }
      }

      console.log("Registration successful:", response.data);
      alert("Form submitted successfully! Your data has been uploaded.");

      // final step
      logout();
      navigate("/login");

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
      if (formData.role === "mentor") {
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
        role={formData.role}
      />

      {step > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="back-button"
        >
          <FaArrowLeft size={16} style={{ marginRight: "5px" }} />
          Back
        </button>
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
            formData.role === "mentor" ? (
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
            formData.role === "mentee" ? (
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
