import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { ReactNode } from "react";

const Spinner = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isLight ? "bg-[#f6f8fb]" : "bg-[#000001]"
      }`}
    >
      <div className={`w-9 h-9 border-3 rounded-full animate-spin ${
        isLight ? "border-slate-200 border-t-[#00A8FF]" : "border-white/20 border-t-[#00A8FF]"
      }`} />
    </div>
  );
};

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
