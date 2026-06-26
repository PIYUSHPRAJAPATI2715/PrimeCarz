import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", icon: "📊", path: "/admin" },
    ],
  },
  {
    section: "Bookings",
    items: [
      {
        label: "Bookings",
        icon: "📋",
        subItems: [
          { label: "All Bookings", path: "/admin/bookings" },
          { label: "New Booking", path: "/admin/bookings/new" },
          { label: "Upcoming", path: "/admin/bookings/upcoming" },
          { label: "Completed", path: "/admin/bookings/completed" },
        ],
      },
    ],
  },
  {
    section: "Fleet",
    items: [
      {
        label: "Cars",
        icon: "🚗",
        subItems: [
          { label: "Cars List", path: "/admin/cars" },
          { label: "Add Car", path: "/admin/cars/add" },
        ],
      },
    ],
  },
  {
    section: "Business",
    items: [
      { label: "Revenue", icon: "💰", path: "/admin/revenue" },
      { label: "Coupons", icon: "🎟️", path: "/admin/coupons" },
      { label: "Enquiries", icon: "📨", path: "/admin/enquiries" },
    ],
  },
  {
    section: "Config",
    items: [
      { label: "Settings", icon: "⚙️", path: "/admin/settings" },
      { label: "FAQ", icon: "❓", path: "/admin/faq" },
      { label: "About", icon: "ℹ️", path: "/admin/about" },
    ],
  },
];

const pageTitle = (pathname) => {
  const map = {
    "/admin": "Dashboard",
    "/admin/bookings": "All Bookings",
    "/admin/bookings/new": "New Booking",
    "/admin/bookings/upcoming": "Upcoming Bookings",
    "/admin/bookings/completed": "Completed Bookings",
    "/admin/cars": "Cars List",
    "/admin/cars/add": "Add Car",
    "/admin/revenue": "Revenue",
    "/admin/coupons": "Coupons",
    "/admin/enquiries": "Enquiries",
    "/admin/settings": "Settings",
    "/admin/faq": "FAQ",
    "/admin/about": "About",
  };
  return map[pathname] || "Admin";
};

const NavGroupItem = ({ item, location }) => {
  const isSubActive = item.subItems?.some((s) => location.pathname === s.path);
  const [open, setOpen] = useState(isSubActive);

  useEffect(() => {
    if (isSubActive) setOpen(true);
  }, [isSubActive]);

  return (
    <div className="nav-group">
      <button className={`nav-group-toggle${open ? " open" : ""}`} onClick={() => setOpen(!open)}>
        <span className="nav-group-left">
          <span className="nav-item-icon">{item.icon}</span>
          {item.label}
        </span>
        <span className={`nav-group-chevron${open ? " open" : ""}`}>▾</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="nav-sub-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.subItems.map((sub) => (
              <Link
                key={sub.path}
                to={sub.path}
                className={`nav-sub-item${location.pathname === sub.path ? " active" : ""}`}
              >
                <span className="nav-sub-dot" />
                {sub.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🚗</div>
          <div>
            <div className="sidebar-brand-name">PrimeCarz</div>
            <div className="sidebar-brand-sub">Admin Panel</div>
          </div>
        </div>

        {/* Admin info */}
        <div className="sidebar-admin-info">
          <div className="sidebar-admin-avatar">{initials}</div>
          <div>
            <div className="sidebar-admin-name">{user?.name || "Admin"}</div>
            <div className="sidebar-admin-role">Administrator</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) =>
                item.subItems ? (
                  <NavGroupItem key={item.label} item={item} location={location} />
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item${location.pathname === item.path ? " active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              style={{ display: "none", background: "none", border: "none", color: "var(--text-primary)", fontSize: "1.3rem", cursor: "pointer" }}
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div>
              <div className="admin-topbar-title">{pageTitle(location.pathname)}</div>
            </div>
          </div>
          <div className="admin-topbar-right">
            <span className="topbar-time">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &nbsp;|&nbsp;{" "}
              {time.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <div className="topbar-avatar" title={user?.name}>{initials}</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
