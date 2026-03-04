import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../auth/auth";

function ProtectedRoute({ children, requiredRole }) {
  const token = getToken();
  const role = getUserRole();

  if (!token) {
    return <Navigate to="/" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
