import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

const Spinner = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#0a0a0a" }}
  >
    <div className="w-8 h-8 border-2 border-white/20 border-t-[#00A8FF] rounded-full animate-spin" />
  </div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { loading } = useAuth();
  if (loading) return <Spinner />;
  // Allow accessing the admin panel directly
  return <>{children}</>;
};
