import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem("token");

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};
