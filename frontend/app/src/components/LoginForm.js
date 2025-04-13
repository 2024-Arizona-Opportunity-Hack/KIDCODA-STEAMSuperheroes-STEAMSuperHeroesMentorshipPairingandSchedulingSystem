// src/components/LoginForm.js

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styling/LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setIsAdmin, setAccessToken } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1) First call: authenticate via OAuth endpoint
      const formData = new URLSearchParams();
      formData.append("username", email); // 'username' param, even though it's an email
      formData.append("password", password);

      const response = await fetch("/api/v1/login/oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed; please check your credentials.");
      }

      const data = await response.json(); // { access_token, refresh_token, token_type, ... }
      if (!data.access_token) {
        throw new Error("No access token returned from the server.");
      }

      // Store the access token (and refreshToken if desired)
      localStorage.setItem("accessToken", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
      }

      // Update AuthContext with the new access token and mark user as authenticated
      setAccessToken(data.access_token);
      setIsAuthenticated(true);

      // 2) Second call: fetch user details to check is_superuser
      const userResponse = await fetch("/api/v1/users/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.access_token}`,
        },
      });

      if (!userResponse.ok) {
        // If we fail here, you may want to handle it (logout, show error, etc.)
        throw new Error("Failed to retrieve user details.");
      }

      const userData = await userResponse.json();
      // userData = { is_superuser, email, etc. }

      const isSuperuser = userData.is_superuser === true;
      setIsAdmin(isSuperuser);

      // Redirect based on admin or regular user
      if (isSuperuser) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAccessToken(null);
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
          <h2 className="form-title">Sign In To Your Account</h2>
          <p className="form-subtitle">Let's sign in to your account and get started.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

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
                <span className="icon">👤</span>
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="********"
                  required
                />
                <span className="icon">🔒</span>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="links">
            <p>
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <div className="divider">
            <hr /> <span>OR</span> <hr />
          </div>

          {/* Social Login Buttons (optional) */}
          {/* <div className="social-login">
            <button className="social-btn facebook">Facebook</button>
            <button className="social-btn twitter">Twitter</button>
            <button className="social-btn google">Google</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
