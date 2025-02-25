// src/components/ForgotPasswordForm.js

import React, { useState } from "react";
import "../styling/LoginForm.css"; // reuse same styling as LoginForm
import { useNavigate, Link } from "react-router-dom";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // We'll call POST /recover/{email}
      const response = await fetch(`http://localhost/api/v1/login/recover/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Body is typically empty for this endpoint. If needed, pass an empty JSON:
        body: JSON.stringify({}),
      });

      // If successful (status 200), display success message
      if (response.ok) {
        // The response might be {"claim": "..."} or {"msg": "..."} etc.
        // We don't need the token for now, just show success
        setSuccess("Your password has been sent to your email.");
      } else {
        // Otherwise parse and display error
        const errorData = await response.json();
        // If there's a message or detail
        setError(errorData.detail || "Failed to recover password. Try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Recover Password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="login-left">
        <h1 className="logo">STEAM Superheroes</h1>
        <p className="tagline">Empowering Mentors and Mentees in STEAM Fields. 🦸‍♂️🦸‍♀️</p>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="form-wrapper">
          <h2 className="form-title">Forgot Password</h2>
          <p className="form-subtitle">Enter your email to recover your password.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="yourEmail@host.com"
                  required
                />
                <span className="icon">✉️</span>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Recovery Email"}
            </button>
          </form>

          <div className="links">
            <p>
              Remembered your password? <Link to="/login">Sign In</Link>
            </p>
            <Link to="/signup">Don’t have an account? Sign Up</Link>
          </div>

          <div className="divider">
            <hr /> <span>OR</span> <hr />
          </div>

          {/* Social Login Buttons (optional) */}
          <div className="social-login">
            <button className="social-btn facebook">Facebook</button>
            <button className="social-btn twitter">Twitter</button>
            <button className="social-btn google">Google</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
