import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Briefcase, LogOut, UserCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

function Layout({ children, onLogout, role }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-inner border border-indigo-500">
                <Briefcase className="h-5 w-5 text-indigo-50" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-900 tracking-tight">
                AI HirePro
              </span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <UserCircle className="h-4 w-4 text-indigo-500" />
                <span className="capitalize hidden sm:inline">{role || 'User'}</span>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors p-2 sm:p-0 rounded-lg hover:bg-rose-50 sm:hover:bg-transparent"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

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
            <Route 
              path="/" 
              element={
                <Layout onLogout={handleLogout} role="Recruiter">
                  <RecruiterDashboard />
                </Layout>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {token && role === "candidate" && (
          <>
            <Route 
              path="/" 
              element={
                <Layout onLogout={handleLogout} role="Candidate">
                  <CandidateDashboard />
                </Layout>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, className: 'text-sm font-medium' }} />
    </BrowserRouter>
  );
}