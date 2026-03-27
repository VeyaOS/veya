import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import NotificationBell from '../../components/NotificationBell';
import './Admin.css';

function AdminLayout() {
  const userStr = localStorage.getItem('user');
  let initIsAdmin = false;
  try {
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') initIsAdmin = true;
    }
  } catch(e) {}

  const [isAdmin, setIsAdmin] = useState(initIsAdmin);
  const [loading, setLoading] = useState(!initIsAdmin);
  const location = useLocation();

  useEffect(() => {
    if (!initIsAdmin) checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await api.get('/auth/me');
      const isAdminUser = response.data.role === 'ADMIN' || response.data.role === 'SUPER_ADMIN';
      setIsAdmin(isAdminUser);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const currentPath = location.pathname;
  const getPageTitle = () => {
    if (currentPath === '/admin') return 'Overview';
    if (currentPath.includes('merchants')) return 'Merchants';
    if (currentPath.includes('invoices')) return 'Invoices';
    if (currentPath.includes('audit')) return 'Audit Log';
    return 'Admin';
  };

  if (loading) return (
    <div className="admin-loader-container">
      <div className="admin-spinner"></div>
      <p>Authenticating Command Center...</p>
    </div>
  );
  
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="veya-admin-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-wrap">
          <div className="logo">
            <div className="logo-mark"><span className="logo-v">V</span></div>
            <div className="logo-wordmark">
              <div className="logo-name">V<em>eya</em></div>
              <div className="logo-tag">Admin Console</div>
            </div>
          </div>
        </div>
        <div className="admin-pill">
          <div className="admin-dot"></div>
          <span className="admin-label">Super Admin</span>
        </div>
        <nav className="nav">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <Link to="/admin" className={`nav-item ${currentPath === '/admin' ? 'active' : ''}`}>
              <span>⬡</span> Overview
            </Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Operations</div>
            <Link to="/admin/merchants" className={`nav-item ${currentPath.includes('/admin/merchants') ? 'active' : ''}`}>
              <span>◎</span> Merchants
            </Link>
            <Link to="/admin/invoices" className={`nav-item ${currentPath.includes('/admin/invoices') ? 'active' : ''}`}>
              <span>◫</span> Invoices
            </Link>
            <Link to="/admin/support" className={`nav-item ${currentPath.includes('/admin/support') ? 'active' : ''}`}>
              <span>◈</span> Support
            </Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">System</div>
            <Link to="/admin/system" className={`nav-item ${currentPath.includes('/admin/system') ? 'active' : ''}`}>
              <span>⊡</span> System
            </Link>
            <Link to="/admin/flags" className={`nav-item ${currentPath.includes('/admin/flags') ? 'active' : ''}`}>
              <span>⚑</span> Feature Flags
            </Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Compliance</div>
            <Link to="/admin/audit" className={`nav-item ${currentPath.includes('/admin/audit') ? 'active' : ''}`}>
              <span>◷</span> Audit Log
            </Link>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/dashboard" style={{textDecoration: 'none'}}>
            <div className="user-card">
              <div className="avatar">B</div>
              <div style={{flex: 1, minWidth: 0}}>
                <div className="user-name">Logout / Back</div>
                <div className="user-role">Super Admin</div>
              </div>
              <span style={{color: 'var(--text3)', fontSize: '11px'}}>⋯</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <div className="topbar">
          <div className="page-title">{getPageTitle()}</div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search merchants, invoices..." />
            </div>
            <NotificationBell />
            <button className="btn btn-red btn-sm">⚡ Quick Action</button>
          </div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
