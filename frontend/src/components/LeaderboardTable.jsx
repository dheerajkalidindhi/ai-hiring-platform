import API from "../services/api";

export default function LeaderboardTable({ applications, refresh }) {

  const updateStatus = async (id, status) => {
    await API.patch(`/applications/${id}/status`, { status });
    refresh();
  };

  const downloadResume = (applicationId) => {
    window.open(`http://127.0.0.1:8000/applications/${applicationId}/resume`, "_blank");
  };

  return (
    <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Email</th>
          <th>AI Score</th>
          <th>Status</th>
          <th>Resume</th>
        </tr>
      </thead>
      <tbody>
        {applications.map(app => (
          <tr key={app.application_id}>
            <td>{app.rank}</td>
            <td>{app.candidate_email}</td>
            <td>{app.ai_score}</td>
            <td>
              <select
                value={app.status}
                onChange={(e) => updateStatus(app.application_id, e.target.value)}
              >
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </td>
            <td>
              <button onClick={() => downloadResume(app.application_id)}>
                Download
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}