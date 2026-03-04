import { useEffect, useState } from "react";
import API from "../services/api";

export default function JobBrowser() {
  const [jobs, setJobs] = useState([]);
  const [selectedResume, setSelectedResume] = useState({});
  const [applicationResults, setApplicationResults] = useState({});
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch {
      alert("Failed to fetch jobs");
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await API.get("/my-applications");

      // Store job IDs already applied
      const jobIds = res.data.map(app => app.job_id);
      setAppliedJobs(jobIds);

      // Optional: preload AI results if needed
      const resultsMap = {};
      res.data.forEach(app => {
        resultsMap[app.job_id] = {
          ai_score: app.ai_score
        };
      });
      setApplicationResults(resultsMap);

    } catch {
      console.log("Could not fetch previous applications");
    }
  };

  const handleFileChange = (jobId, file) => {
    setSelectedResume(prev => ({
      ...prev,
      [jobId]: file
    }));
  };

  const apply = async (jobId) => {
    if (appliedJobs.includes(jobId)) return;

    const resume = selectedResume[jobId];

    if (!resume) {
      alert("Please upload resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const res = await API.post(
        `/jobs/${jobId}/apply`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Mark as applied
      setAppliedJobs(prev => [...prev, jobId]);

      // Store AI result
      setApplicationResults(prev => ({
        ...prev,
        [jobId]: res.data
      }));

    } catch {
      alert("Application failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Available Jobs</h1>

      {jobs.map(job => {
        const skillsArray = job.skills
          ? job.skills.split(",").map(skill => skill.trim())
          : [];

        const alreadyApplied = appliedJobs.includes(job.id);
        const result = applicationResults[job.id];

        return (
          <div
            key={job.id}
            style={{
              border: "1px solid #ddd",
              padding: 20,
              marginBottom: 20,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <h2 style={{ marginBottom: 10 }}>
              {job.title}
              {alreadyApplied && (
                <span
                  style={{
                    marginLeft: 10,
                    fontSize: 12,
                    padding: "4px 8px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: 12
                  }}
                >
                  Already Applied
                </span>
              )}
            </h2>

            <p>
              <strong>Description:</strong><br />
              {job.description}
            </p>

            <p><strong>Skills Required:</strong></p>

            <div style={{ marginBottom: 10 }}>
              {skillsArray.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    display: "inline-block",
                    padding: "5px 10px",
                    margin: "4px",
                    borderRadius: 20,
                    backgroundColor: "#f0f0f0",
                    fontSize: 12
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <p>
              <strong>Location:</strong><br />
              {job.location}
            </p>

            <p>
              <strong>Salary:</strong><br />
              ₹ {job.salary}
            </p>

            <hr />

            {!alreadyApplied && (
              <>
                <input
                  type="file"
                  onChange={e => handleFileChange(job.id, e.target.files[0])}
                />

                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => apply(job.id)}
                >
                  Apply
                </button>
              </>
            )}

            {result && (
              <div
                style={{
                  marginTop: 15,
                  padding: 10,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 6
                }}
              >
                <strong>AI Evaluation</strong>
                <p>AI Score: {result.ai_score}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}