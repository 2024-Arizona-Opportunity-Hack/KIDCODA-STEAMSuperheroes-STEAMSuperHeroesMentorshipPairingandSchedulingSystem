import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styling/StepProgressBar.css";

function StepProgressBar({ step, totalSteps, stepLabels, role }) {
  const navigate = useNavigate();
  const defaultLabels = Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`);
  const labels = stepLabels && stepLabels.length === totalSteps ? stepLabels : defaultLabels;

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="step-progress-wrapper">
      {/* Home button at the start of the progress bar */}
      <button 
        className="home-button-progress" 
        onClick={handleHomeClick}
        title="Return to Dashboard"
      >
        <FaHome size={18} />
      </button>
      
      <div className="step-progress-container">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          // "active" if it's the current step, "completed" if it's behind the current step
          const isActive = stepNumber === step;
          const isCompleted = stepNumber < step;

          let status = "";

          if (stepNumber < step) {
            status = "completed";
          } else if (stepNumber === step) {
            status = "active";
          } else {
            status = "inactive";
          }

          // Specific handling for Mentor/Mentee steps
          if (label.toLowerCase().includes("mentor")) {
            if (role === "mentee") {
              status = "inactive-specific";
            }
          } else if (label.toLowerCase().includes("mentee")) {
            if (role === "mentor") {
              status = "inactive-specific";
            }
          }

          return (
            <div key={stepNumber} className="step-item">
              <div
                className={`step-circle ${status}`}
              >
                {stepNumber}
              </div>
              <div className={`step-label ${status === "inactive-specific" ? "strikethrough" : ""}`}>
                  {label}    
              </div>
              {/* Draw a connector line except for the last step */}
              {stepNumber < totalSteps && <div className={`step-connector ${status === "inactive-specific" ? "connector-inactive" : ""}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgressBar;
