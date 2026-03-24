import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import HomePage        from "./pages/HomePage";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import PaymentPage     from "./pages/PaymentPage";
import DashboardPage   from "./pages/DashboardPage";
import AdminPage       from "./pages/AdminPage";

// ─── ROUTE GUARDS ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (!user.subscriptionActive && window.location.pathname !== "/subscribe")
    return <Navigate to="/subscribe" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0A0A08",
    }}>
      <span style={{
        width: 32, height: 32,
        border: "2px solid rgba(201,168,76,0.2)",
        borderTopColor: "#C9A84C",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

// ─── UNAUTHORIZED LISTENER ────────────────────────────────────────────────────
function UnauthorizedHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const handle = () => navigate("/login");
    window.addEventListener("pg:unauthorized", handle);
    return () => window.removeEventListener("pg:unauthorized", handle);
  }, [navigate]);
  return null;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <UnauthorizedHandler />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/login"     element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"  element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/subscribe" element={<PaymentPage />} />

        {/* Member dashboard */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />

        {/* Admin panel */}
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
