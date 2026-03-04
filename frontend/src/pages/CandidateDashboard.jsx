import { useEffect, useState } from "react";
import API from "../services/api";

export default function CandidateDashboard() {

  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [resumeFiles, setResumeFiles] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
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
      alert("Upload resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {

      setLoading(true);

      await API.post(`/jobs/${jobId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Application submitted");

      fetchMyApplications();

    } catch (err) {

      alert("Application failed");

    } finally {

      setLoading(false);

    }
  };

  const isAlreadyApplied = (jobId) => {
    return myApplications.some(app => app.job_id === jobId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold text-gray-800 mb-10">
        Candidate Dashboard
      </h1>

      {/* JOB LIST */}

      <h2 className="text-xl font-semibold mb-6">
        Available Jobs
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {jobs.map(job => (

          <div
            key={job.id}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition border"
          >

            <h3 className="text-lg font-semibold text-gray-800">
              {job.title}
            </h3>

            <p className="text-sm text-gray-500">
              {job.company_name}
            </p>

            {/* Description */}

            <p className="text-sm text-gray-600 mt-2">
              {job.description}
            </p>

            <p className="text-gray-500 text-sm mt-2">
              {job.location} • ₹{job.salary} LPA
            </p>

            {/* Skills */}

            <div className="flex flex-wrap gap-2 mt-3">

              {job.skills?.split(",").map((skill,i)=>(
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full"
                >
                  {skill.trim()}
                </span>
              ))}

            </div>

            {/* Apply section */}

            <div className="mt-5">

              {isAlreadyApplied(job.id) ? (

                <div className="text-green-600 font-medium text-sm">
                  ✓ Already Applied
                </div>

              ) : (

            <div className="flex items-center gap-3">
            
              <label className="bg-gray-200 px-3 py-2 rounded cursor-pointer text-sm hover:bg-gray-300">
                Upload Resume
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e)=>handleFileChange(job.id,e.target.files[0])}
                />
              </label>
            
              {resumeFiles[job.id] && (
                <span className="text-xs text-gray-500">
                  {resumeFiles[job.id].name}
                </span>
              )}
            
              <button
                onClick={()=>applyToJob(job.id)}
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Apply
              </button>
            
            </div>
            
                          )}
            
                        </div>
            
                      </div>
            
                    ))}
            
                  </div>

        {/* APPLICATIONS TABLE */}
  
        <h2 className="text-xl font-semibold mt-12 mb-6">
          My Applications
        </h2>
  
        {myApplications.length === 0 ? (
  
          <p className="text-gray-400 text-sm">
            No applications yet.
          </p>
  
        ) : (

        <div className="bg-white rounded-2xl shadow border overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-50">

              <tr>
                <th className="p-3 text-left">Job</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">AI Score</th>
              </tr>

            </thead>

            <tbody>

              {myApplications.map(app => (

                <tr
                  key={app.application_id}
                  className="border-t"
                >

                  <td className="p-3">
                    {app.job_title}
                  </td>

                  <td className="p-3">

                    <span
                      className={
                        app.status === "hired"
                        ? "text-green-600"
                        : app.status === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                      }
                    >

                      {app.status}

                    </span>

                  </td>

                  <td className="p-3">
                    {app.ai_score}%
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}