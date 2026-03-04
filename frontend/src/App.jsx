import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

export default function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);

      // Check expiry
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setRole(decoded.role);
    } catch {
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode(newToken);
    setToken(newToken);
    setRole(decoded.role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      {token && (
        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "10px 16px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            zIndex: 1000
          }}
        >
          Logout
        </button>
      )}
      <Routes>

        {!token && (
          <>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {token && role === "recruiter" && (
          <>
            <Route path="/" element={<RecruiterDashboard onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {token && role === "candidate" && (
          <>
            <Route path="/" element={<CandidateDashboard onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}