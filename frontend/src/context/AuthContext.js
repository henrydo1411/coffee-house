import { createContext, useContext, useEffect, useState } from "react";
import api, { savedSession, SESSION_KEY } from "../services/api";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedSession);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  function login(data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setUser(data);
    setSessionError("");
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }
  useEffect(() => {
    let active = true;
    const expired = () => {
      setUser(null);
      setSessionError("Your session expired. Please log in again.");
    };
    window.addEventListener("coffee-session-expired", expired);
    const session = savedSession();
    if (!session?.token) {
      setLoading(false);
    } else
      api
        .get("/auth/me")
        .then(({ data }) => {
          if (active) {
            const updated = { ...data, token: session.token };
            localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            setUser(updated);
          }
        })
        .catch((error) => {
          if (active) {
            setUser(null);
            setSessionError(
              error.response?.status === 401
                ? "Please log in again."
                : "Could not verify your session. Check the backend and log in again.",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
      window.removeEventListener("coffee-session-expired", expired);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, sessionError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
