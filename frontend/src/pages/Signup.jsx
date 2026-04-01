import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Briefcase, UserPlus, ShieldCheck } from "lucide-react";
import API from "../services/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/users", {
        email,
        password,
        role
      });
      navigate("/");
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10 m-4">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg border border-indigo-500 mb-4 inline-flex">
            <UserPlus className="h-7 w-7 text-indigo-50" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create account
          </h2>
          <p className="text-slate-500 mt-2 text-sm text-center">
            Join AI HirePro and experience the next generation of hiring
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">
              I am a
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
              </div>
              <select
                className="block w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all sm:text-sm appearance-none"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              >
                <option value="candidate">Candidate (Looking for jobs)</option>
                <option value="recruiter">Recruiter (Hiring talent)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 font-medium transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span>Already have an account?</span>
          <button
            onClick={() => navigate("/")}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in instead
          </button>
        </div>

      </div>
    </div>
  );
}