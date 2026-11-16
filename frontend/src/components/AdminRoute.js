import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./UI";
export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: "/admin" }} replace />;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
