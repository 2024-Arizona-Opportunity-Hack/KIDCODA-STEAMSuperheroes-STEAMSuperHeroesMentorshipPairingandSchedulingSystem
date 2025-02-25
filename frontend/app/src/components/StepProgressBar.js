import React from "react";
import "../styling/StepProgressBar.css"; // We'll define some minimal styling below

/**
 * Example:
 *  - totalSteps = 4
 *  - step       = 2 (means we are on the second step)
 */
function StepProgressBar({ step, totalSteps, stepLabels, role }) {
  // stepLabels is an array of labels for each step, e.g. ["Basic Info", "Mentor Profile", "Mentee Profile", "Calendar"]
  // If not provided, we’ll create a default array: ["Step 1", "Step 2", ...]
  const defaultLabels = Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`);
  const labels = stepLabels && stepLabels.length === totalSteps ? stepLabels : defaultLabels;

  return (
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
  );
}

export default StepProgressBar;
