import { useEffect, useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  Upload, 
  Send,
  FileText,
  Clock,
  Briefcase,
  ShieldCheck
} from "lucide-react";

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [resumeFiles, setResumeFiles] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${decoded.user_id}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "evaluation_complete") {
          toast.success("AI Evaluation Complete!", {
            icon: '🤖',
            duration: 6000
          });
          fetchMyApplications();
        }
      };

      return () => ws.close();
    } catch (err) {
      console.error("Failed to connect to notifications", err);
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await API.get("/my-applications");
      setMyApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (jobId, file) => {
    if(!file) return;
    setResumeFiles(prev => ({
      ...prev,
      [jobId]: file
    }));
  };

  const applyToJob = async (jobId) => {
    const file = resumeFiles[jobId];
    if (!file) {
      toast.error("Please select a resume (PDF) first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      await API.post(`/jobs/${jobId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Application submitted! AI is analyzing your resume.", { icon: '🚀' });
      fetchMyApplications();
    } catch (err) {
      toast.error("Application failed. Please make sure you uploaded a valid PDF.");
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyApplied = (jobId) => {
    return myApplications.some(app => app.job_id === jobId);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "hired":
        return { color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Hired" };
      case "rejected":
        return { color: "text-rose-700 bg-rose-50 border-rose-200", label: "Rejected" };
      case "processing":
        return { color: "text-indigo-700 bg-indigo-50 border-indigo-200", label: "Analyzing" };
      default:
        return { color: "text-amber-700 bg-amber-50 border-amber-200", label: "In Review" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Discover opportunities and track your applications.</p>
      </div>

      {/* JOB LISTINGS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">Available Opportunities</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
             <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500 text-sm">
               No jobs available right now. Check back later!
             </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    {job.is_verified && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300 shadow-sm">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Company
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-sm mt-2">
                    <Building2 className="h-4 w-4" />
                    {job.company_name}
                  </div>

                  <p className="text-sm text-slate-500 mt-4 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <IndianRupee className="h-4 w-4 text-slate-400 mr-2" />
                      {job.salary} LPA
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {job.skills?.split(",").map((skill, i) => (
                      <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl mt-auto">
                  {isAlreadyApplied(job.id) ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      Application Submitted
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          id={`resume-${job.id}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(job.id, e.target.files[0])}
                        />
                        <label 
                          htmlFor={`resume-${job.id}`}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                            resumeFiles[job.id] 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Upload className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">
                            {resumeFiles[job.id] ? resumeFiles[job.id].name : "Select Resume (PDF)"}
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={() => applyToJob(job.id)}
                        disabled={loading || !resumeFiles[job.id]}
                        className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        Apply Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* APPLICATIONS TABLE */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">Application History</h2>
          </div>
          <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            {myApplications.length} applied
          </span>
        </div>

        {myApplications.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500 text-sm">
            You haven't applied to any jobs yet. Your applications will appear here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Role & Company</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">AI Fit Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myApplications.map(app => (
                    <tr key={app.application_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{app.job_title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusConfig(app.status).color}`}>
                          {app.status === 'hired' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {getStatusConfig(app.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.status === 'processing' ? (
                          <div className="flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                             <span className="font-medium text-slate-500 italic">Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${app.ai_score >= 70 ? 'bg-emerald-500' : app.ai_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                style={{ width: `${app.ai_score}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-slate-700">{app.ai_score}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}