import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import RidesPage from "./pages/RidesPage";
import ExpensesPage from "./pages/ExpensesPage";
import OBD2Page from "./pages/OBD2Page";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
// 1. IMPORTANTE: Adicione o import do ThemeProvider no topo do arquivo junto com os outros contextos
import { ThemeProvider } from "./contexts/ThemeContext"; 
import { ThemeToggle } from './components/ui/ThemeToggle'; 

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* <- Adicionado aqui para envolver todo o sistema */}
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<DashboardPage />} />
                     <Route index element={<DashboardPage />} />
                     <Route path="vehicles" element={<VehiclesPage />} />
                     <Route path="rides" element={<RidesPage />} />
                     <Route path="expenses" element={<ExpensesPage />} />
                     <Route path="obd2" element={<OBD2Page />} />
                     <Route path="profile" element={<ProfilePage />} />
                     <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Carregando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Carregando...</div>;
  return !user ? children : <Navigate to="/" replace />;
}

