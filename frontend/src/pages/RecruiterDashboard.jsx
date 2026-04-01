import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Users, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download 
} from "lucide-react";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company_name: "",
    description: "",
    skills: "",
    location: "",
    salary: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/recruiter/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post("/jobs", form);
      setForm({
        title: "",
        company_name: "",
        description: "",
        skills: "",
        location: "",
        salary: "",
      });
      setIsCreatingJob(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to create job");
    }
  };

  const handleViewApplications = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    try {
      const res = await api.get(`/recruiter/jobs/${jobId}/applications`);
      setApplications((prev) => ({
        ...prev,
        [jobId]: res.data,
      }));
      setExpandedJob(jobId);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      const res = await api.get(`/recruiter/jobs/${expandedJob}/applications`);
      setApplications((prev) => ({
        ...prev,
        [expandedJob]: res.data,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const downloadResume = async (applicationId) => {
    try {
      const res = await api.get(`/applications/${applicationId}/resume`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "hired":
        return { color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 };
      case "rejected":
        return { color: "text-rose-700 bg-rose-50 border-rose-200", icon: XCircle };
      default:
        return { color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your job postings and review AI-ranked candidates.</p>
        </div>
        <button
          onClick={() => setIsCreatingJob(!isCreatingJob)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-indigo-500/25"
        >
          {isCreatingJob ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isCreatingJob ? "Cancel" : "Post a Job"}
        </button>
      </div>

      {isCreatingJob && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Create New Job Posting</h2>
          </div>

          <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Remote, or New York, NY"
                  className="w-full border border-slate-200 rounded-xl p-3 pl-9 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Job Description</label>
              <textarea
                placeholder="Describe the responsibilities, requirements, and benefits..."
                rows="4"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all resize-none placeholder:text-slate-400"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Required Skills</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Salary (LPA)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="e.g. 15"
                  className="w-full border border-slate-200 rounded-xl p-3 pl-9 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm"
              >
                Create Job Posting
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center bg-white border border-slate-200 border-dashed rounded-2xl py-12">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No jobs posted yet</h3>
            <p className="text-slate-500 text-sm mt-1">Create your first job posting to start evaluating candidates.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{job.title}</h2>
                    <p className="text-indigo-600 font-medium text-sm mt-1">{job.company_name}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-4 w-4 text-slate-400" />
                        {job.salary} LPA
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-slate-400" />
                        {job.applications_count} Candidates
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewApplications(job.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      expandedJob === job.id 
                        ? "bg-slate-50 border-slate-200 text-slate-700" 
                        : "bg-white border-slate-200 text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    {expandedJob === job.id ? (
                      <><ChevronUp className="h-4 w-4" /> Close details</>
                    ) : (
                      <><Users className="h-4 w-4" /> View Applicants</>
                    )}
                  </button>
                </div>
                
                <div className="mt-5">
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.split(",").map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* APPLICATIONS LIST */}
              {expandedJob === job.id && (
                <div className="bg-slate-50/50 border-t border-slate-200 p-6">
                  {applications[job.id]?.length > 0 ? (
                    <div className="space-y-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <Bot className="h-5 w-5 text-indigo-500" />
                          AI Ranked Candidates
                        </h3>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          Sorted by AI Score
                        </span>
                      </div>
                      
                      {applications[job.id].map((app) => {
                        const StatusIcon = getStatusConfig(app.status).icon;
                        
                        return (
                        <div key={app.application_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-indigo-200 transition-colors">
                          <div className="p-5 flex flex-col lg:flex-row gap-6">
                            
                            {/* Candidate Summary */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm border border-indigo-200">
                                    #{app.rank}
                                  </div>
                                  <h4 className="font-medium text-slate-900 truncate">{app.candidate_email}</h4>
                                </div>
                                
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${getStatusConfig(app.status).color}`}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {app.status}
                                </span>
                              </div>
                              
                              <div className="mt-4 flex flex-wrap items-center gap-3">
                                <select
                                  value={app.status}
                                  onChange={(e) => updateStatus(app.application_id, e.target.value)}
                                  className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white text-slate-700 font-medium"
                                >
                                  <option value="pending">Mark Pending</option>
                                  <option value="hired">Mark Hired</option>
                                  <option value="rejected">Mark Rejected</option>
                                </select>
                                
                                <button
                                  onClick={() => downloadResume(app.application_id)}
                                  className="flex items-center gap-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium"
                                >
                                  <Download className="h-4 w-4" />
                                  Resume
                                </button>
                              </div>
                            </div>

                            {/* AI Insights Panel */}
                            {app.explanation && (() => {
                              let explanation;
                              try {
                                explanation = typeof app.explanation === "string" ? JSON.parse(app.explanation) : app.explanation;
                              } catch {
                                return null;
                              }

                              const scoreColor = app.ai_score >= 75 ? "text-emerald-600" : app.ai_score >= 50 ? "text-amber-600" : "text-rose-600";
                              
                              return (
                                <div className="lg:w-1/2 bg-gradient-to-br from-indigo-50/50 to-white rounded-lg border border-indigo-100/60 p-4">
                                  
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-sm">
                                      <Bot className="h-4 w-4 text-indigo-500" />
                                      AI Evaluation
                                    </div>
                                    <div className={`text-2xl font-bold tracking-tight ${scoreColor}`}>
                                      {app.ai_score}<span className="text-sm font-medium text-slate-400">%</span>
                                    </div>
                                  </div>

                                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 mb-4 space-y-2.5">
                                    <div className="flex gap-2">
                                      <div className="min-w-[4px] bg-indigo-500 rounded-full mt-1.5 h-1.5 w-1.5"></div>
                                      <p className="text-slate-600 text-sm leading-snug">
                                        <span className="font-medium text-slate-800">Matched Skills:</span> {explanation.skill_match.matched_skills.length > 0 ? explanation.skill_match.matched_skills.join(", ") : "None"}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="min-w-[4px] bg-indigo-500 rounded-full mt-1.5 h-1.5 w-1.5"></div>
                                      <p className="text-slate-600 text-sm leading-snug">
                                        <span className="font-medium text-slate-800">Experience:</span> {explanation.experience.years_detected} years {explanation.experience.years_detected >= explanation.experience.required_years ? <span className="text-emerald-600 font-medium">(Meets Requirement)</span> : <span className="text-rose-600 font-medium">(Below Requirement)</span>}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="min-w-[4px] bg-indigo-500 rounded-full mt-1.5 h-1.5 w-1.5"></div>
                                      <p className="text-slate-600 text-sm leading-snug">
                                        <span className="font-medium text-slate-800">Recommendation:</span> <span className="font-semibold">{explanation.overall_fit}</span> fit for the role.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                                    <div className="bg-white border border-slate-200 rounded p-2 shadow-sm">
                                      <span className="block text-slate-400 mb-0.5">Skills Matched</span>
                                      <span className="font-semibold text-slate-700">{explanation.skill_match.matched_count}/{explanation.skill_match.total_required}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded p-2 shadow-sm">
                                      <span className="block text-slate-400 mb-0.5">Experience Detected</span>
                                      <span className="font-semibold text-slate-700">{explanation.experience.years_detected} years</span>
                                    </div>
                                  </div>

                                  {explanation.skill_match.missing_skills?.length > 0 && (
                                    <div className="text-xs text-rose-700/90 bg-rose-50 border border-rose-100 rounded p-2.5 shadow-sm mt-3">
                                      <span className="font-semibold flex items-center gap-1.5 mb-1.5">
                                        <XCircle className="h-3.5 w-3.5" />
                                        Missing Requirements
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {explanation.skill_match.missing_skills.map((skill, i) => (
                                          <span key={i} className="bg-white px-2 py-0.5 rounded shadow-sm border border-rose-200/50">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No applications received yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}