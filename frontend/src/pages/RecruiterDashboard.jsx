import { useEffect, useState } from "react";
import api from "../services/api";

export default function RecruiterDashboard() {

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);

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
      alert("Failed to fetch jobs");
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
      alert("Failed to fetch applications");
    }
  };

  const updateStatus = async (applicationId, status) => {

    try {
      await api.patch(`/applications/${applicationId}/status`, { status });

      // refresh applications without collapsing
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

      const res = await api.get(
        `/applications/${applicationId}/resume`,
        { responseType: "blob" }
      );

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

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Recruiter Dashboard
        </h1>

        {/* CREATE JOB */}

        <div className="bg-white shadow-md rounded-xl p-6 mb-10">

          <h2 className="text-xl font-semibold mb-6">
            Create New Job
          </h2>

          <form onSubmit={handleCreateJob} className="space-y-4">

            <input
              type="text"
              placeholder="Job Title"
              className="w-full border rounded-lg p-3"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Company Name"
              className="w-full border rounded-lg p-3"
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Job Description"
              className="w-full border rounded-lg p-3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Skills (comma separated)"
              className="w-full border rounded-lg p-3"
              value={form.skills}
              onChange={(e) =>
                setForm({ ...form, skills: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Location"
              className="w-full border rounded-lg p-3"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Salary(LPA)"
              className="w-full border rounded-lg p-3"
              value={form.salary}
              onChange={(e) =>
                setForm({ ...form, salary: e.target.value })
              }
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Job
            </button>

          </form>

        </div>

        {/* JOB LIST */}

        {jobs.map((job) => (

          <div
            key={job.id}
            className="bg-white shadow-md rounded-xl p-6 mb-8"
          >

            {/* JOB HEADER */}

            <div className="mb-4">

              <h2 className="text-2xl font-semibold">
                {job.title}
              </h2>

              <p className="text-gray-500 text-sm">
                {job.company_name}
              </p>

            </div>

            {/* JOB INFO */}

            <div className="grid md:grid-cols-2 gap-3">

              <p>
                <strong>Description:</strong> {job.description}
              </p>

              <p>
                <strong>Skills:</strong> {job.skills}
              </p>

              <p>
                <strong>Location:</strong> {job.location}
              </p>

              <p>
                <strong>Salary:</strong> ₹{job.salary} LPA
              </p>

            </div>

            <p className="mt-4 font-semibold">
              Total Applications: {job.applications_count}
            </p>

            <button
              onClick={() => handleViewApplications(job.id)}
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
            >
              {expandedJob === job.id
                ? "Hide Applications"
                : "View Applications"}
            </button>

            {/* APPLICATIONS */}

            {expandedJob === job.id && (

              <div className="mt-8 space-y-6">

                {applications[job.id]?.length > 0 ? (

                  applications[job.id].map((app) => (

                    <div
                      key={app.application_id}
                      className="bg-white border rounded-xl p-6 shadow-sm grid grid-cols-3 gap-6"
                    >

                      {/* LEFT SIDE */}

                      <div className="col-span-2">

                        <h3 className="font-semibold text-lg mb-1">
                          Rank #{app.rank}
                        </h3>

                        <p className="text-gray-500 text-sm mb-2">
                          Candidate: {app.candidate_email}
                        </p>

                        <p className="text-sm mb-2">
                          Status: <span className="font-medium">{app.status}</span>
                        </p>

                        <p className="text-indigo-600 font-semibold mb-4">
                          AI Score: {app.ai_score}%
                        </p>

                        <div className="flex gap-4">

                          <select
                            value={app.status}
                            onChange={(e) =>
                              updateStatus(app.application_id, e.target.value)
                            }
                            className="border px-4 py-2 rounded-lg"
                          >

                            <option value="pending">Pending</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>

                          </select>

                          <button
                            onClick={() =>
                              downloadResume(app.application_id)
                            }
                            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                          >
                            Download Resume
                          </button>

                        </div>

                      </div>

                      {/* AI EXPLANATION */}
                    {app.explanation && (() => {
                    
                      let explanation;
                    
                      try {
                        explanation =
                          typeof app.explanation === "string"
                            ? JSON.parse(app.explanation)
                            : app.explanation;
                      } catch {
                        return null;
                      }
                    
                      return (
                    
                        <div className="bg-gray-50 border rounded-xl p-4 text-sm">
                    
                          <h4 className="font-semibold mb-3">
                            AI Explanation
                          </h4>

                          <p className="text-gray-600 mb-2">
                            {explanation.summary}
                          </p>
                    
                          <p>
                            Skill Match: {explanation.skill_match.matched_count}/
                            {explanation.skill_match.total_required}
                          </p>
                    
                          <p>
                            Semantic Score: {explanation.semantic_score}%
                          </p>
                    
                          <p>
                            Experience: {explanation.experience.years_detected} years
                          </p>
                    
                          <p className="font-semibold mt-2">
                            Overall Fit: {explanation.overall_fit}
                          </p>
                    
                          {explanation.skill_match.missing_skills.length > 0 && (
                    
                            <p className="text-red-500 mt-2">
                              Missing: {explanation.skill_match.missing_skills.join(", ")}
                            </p>
                    
                          )}
                    
                        </div>
                    
                      );
                    
                    })()}

                    </div>

                  ))

                ) : (

                  <p>No applications yet.</p>

                )}

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );
}