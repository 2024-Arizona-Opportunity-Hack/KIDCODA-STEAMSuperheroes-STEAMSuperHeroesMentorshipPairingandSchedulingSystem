// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm.js";
import Dashboard from "./components/Dashboard.js";
import MultiStepForm from "./components/MultiStepForm.js";
import AdminDashboard from "./components/AdminDashboard.js"; // New Admin Dashboard
import { AuthProvider, AuthContext } from "./context/AuthContext.js";
import MentorMenteeMatchings from "./components/MentorMenteeMatchings.js"; // New Component
import CreateSessionPage from "./components/CreateSessionPage.js";
import MenteesPage from "./components/MenteesPage.js";
import SessionDetails from "./components/SessionDetails.js";
import MentorsPage from "./components/MentorsPage.js";
import RegisterForm from "./components/RegisterForm.js"; // Import the RegisterForm
import ForgotPasswordForm from "./components/ForgetPassword.js";
import AllUsersPage from "./components/AllUsersPage.js";
import CityAutocomplete from "./components/CityAutoComplete.js";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<RegisterForm />} /> {/* Add this line */}
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                  {/* View Only Sessions Route */}
        <Route path="/admin/sessions/:sessionId" element={<SessionDetails />} />
        <Route path="/city-auto-complete" element={<CityAutocomplete/>}/>

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute adminOnly={false}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          /> 

          {/* Mentor-Mentee Matchings (Protected Admin Only) */}
          <Route
            path="/admin/matchings"
            element={
              <PrivateRoute adminOnly={true}>
                <MentorMenteeMatchings />
              </PrivateRoute>
            }
          />

          {/* Mentor-Mentee Matchings (Protected Admin Only) */}
          <Route
            path="/admin/create-session"
            element={
              <PrivateRoute adminOnly={true}>
                <CreateSessionPage />
              </PrivateRoute>
            }
          />

          {/* Mentors Page (Protected Admin Only) */}
          <Route
            path="/admin/mentors"
            element={
              <PrivateRoute adminOnly={true}>
                <MentorsPage />
              </PrivateRoute>
            }
          />

          {/* Mentees Page (Protected Admin Only) */}
          <Route
            path="/admin/mentees"
            element={
              <PrivateRoute adminOnly={true}>
                <MenteesPage />
              </PrivateRoute>
            }
          />


          <Route
            path="/admin/all-users"
            element={
              <PrivateRoute adminOnly={true}>
                <AllUsersPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/form/*"
            element={
              <PrivateRoute>
                <MultiStepForm />
              </PrivateRoute>
            }
          />

          {/* Redirect any unknown routes to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// PrivateRoute component to protect routes
const PrivateRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin } = React.useContext(AuthContext);
  if(!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if(adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default App;
