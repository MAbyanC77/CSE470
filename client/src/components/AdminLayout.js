import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: '📊',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'User Management'
    },
    {
      path: '/admin/universities',
      icon: '',
      label: 'Universities'
    },
    {
      path: '/admin/scholarships',
      icon: '🎓',
      label: 'Scholarships'
    },
    {
      path: '/admin/applications',
      icon: '📋',
      label: 'Applications'
    }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">⚙️</span>
            {!sidebarCollapsed && <span className="logo-text">Admin Panel</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path}
                  className={`nav-link ${
                    isActiveRoute(item.path, item.exact) ? 'active' : ''
                  }`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/" className="back-to-site">
            <span className="nav-icon">🏠</span>
            {!sidebarCollapsed && <span className="nav-label">Back to Site</span>}
          </Link>
        </div>
      </aside>
      
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;