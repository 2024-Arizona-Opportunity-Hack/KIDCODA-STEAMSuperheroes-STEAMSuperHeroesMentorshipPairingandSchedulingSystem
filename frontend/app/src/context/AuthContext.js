// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";

// Create the AuthContext with default values
export const AuthContext = createContext({
  isAuthenticated: false,
  isAdmin: false,
  accessToken: null,
  username: null,

  login: async () => {},
  logout: () => {},
  fetchWithAuth: async () => {},

  // Must include these so components can call them
  setIsAuthenticated: () => {},
  setIsAdmin: () => {},
  setAccessToken: () => {},
});

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem("isAdmin");
    return storedAdmin ? JSON.parse(storedAdmin) : false;
  });

  const [accessToken, setAccessToken] = useState(() => {
    const storedToken = localStorage.getItem("accessToken");
    return storedToken || null;
  });

  const [username, setUsername] = useState(() => {
    const storedUsername = localStorage.getItem("username");
    return storedUsername || null;
  });

  // Sync localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    localStorage.setItem("isAdmin", JSON.stringify(isAdmin));

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }

    if (username) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }
  }, [isAuthenticated, isAdmin, accessToken, username]);

  const login = async (inputUsername, password) => {
    try {
      // This is a legacy example. If you're using LoginForm for fetch, you might not need this.
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: inputUsername, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const { access_token, role } = data;
        setIsAuthenticated(true);
        setIsAdmin(role === "admin");
        setAccessToken(access_token);
        setUsername(inputUsername);
        return { success: true };
      } else {
        return { success: false, message: data.detail || "Login failed." };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An error occurred during login." };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAccessToken(null);
    setUsername(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
  };

  const fetchWithAuth = async (url, options = {}) => {
    const headers = options.headers || {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        accessToken,
        username,
        login,
        logout,
        fetchWithAuth,

        setIsAuthenticated,
        setIsAdmin,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
