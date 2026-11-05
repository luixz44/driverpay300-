import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, Car, Navigation, CreditCard,
  Cpu, FileText, User, LogOut, Menu, X
} from "lucide-react";
import { ThemeToggle } from '../ui/ThemeToggle';

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/vehicles", icon: Car, label: "Veículos" },
  { to: "/rides", icon: Navigation, label: "Corridas" },
  { to: "/expenses", icon: CreditCard, label: "Despesas" },
  { to: "/obd2", icon: Cpu, label: "OBD2" },
  { to: "/reports", icon: FileText, label: "Relatórios" },
  { to: "/profile", icon: User, label: "Perfil" },
];

const pageTitles = {
  "/": "Dashboard",
  "/vehicles": "Veículos",
  "/rides": "Corridas",
  "/expenses": "Despesas",
  "/obd2": "OBD2 Bluetooth",
  "/reports": "Relatórios",
  "/profile": "Meu Perfil",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = window.location.pathname;
  const title = pageTitles[path] || "DriverApp";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="app-layout">

      {/* Overlay escuro no mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="sidebar-overlay"
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Car size={20} color="white" />
          </div>
          <div>
            <h1>DriverApp</h1>
            <span>Gestão de Motoristas</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <ThemeToggle />

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item btn"
            style={{ width: "100%", border: "none", background: "none" }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={22} />
          </button>

          <span className="topbar-title">{title}</span>

          <div className="topbar-user">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="topbar-user-info">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{user?.email}</div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}