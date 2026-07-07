import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FormPage from "./pages/FormPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ApplyPage from "./pages/dashboard/ApplyPage";
import AdminPage from "./pages/admin/AdminPage";
import IshtirokchilarPage from "./pages/IshtirokchilarPage";
import { ProtectedRoute, AdminRoute } from "./components/RouteGuards";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const App = () => {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ──────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/forms/:type" element={<FormPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/ishtirokchilar" element={<IshtirokchilarPage />} />

          {/* ── Applicant portal (auth required) ───────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/apply"
            element={
              <ProtectedRoute>
                <ApplyPage />
              </ProtectedRoute>
            }
          />

          {/* ── Admin panel (admin role required) ──────────── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
