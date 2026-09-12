import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Megaphone,
  Store,
  Settings,
  Menu,
  X,
  TrendingUp,
  LogOut,
  Users,
  MessageSquare,
  Radio,
  GitFork,
  FileText,
  History,
} from 'lucide-react';
import { clearToken, getUser, getRole } from '../lib/api.js';

const navSections = [
  {
    title: 'STORE & CATALOG',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, allowedRoles: ['ADMIN'] },
      { to: '/products', label: 'Products', icon: Package, end: false, allowedRoles: ['ADMIN', 'PRODUCT_MANAGER'] },
      { to: '/categories', label: 'Categories', icon: FolderTree, end: false, allowedRoles: ['ADMIN'] },
      { to: '/offers', label: 'Offers', icon: Megaphone, end: false, allowedRoles: ['ADMIN'] },
      { to: '/insights', label: 'Insights', icon: TrendingUp, end: false, allowedRoles: ['ADMIN'] },
    ],
  },
  // {
  //   title: 'WHATSAPP CRM',
  //   items: [
  //     { to: '/whatsapp/inbox', label: 'Live Inbox', icon: MessageSquare, end: false, allowedRoles: ['ADMIN', 'WHATSAPP_MANAGER'] },
  //     { to: '/whatsapp/broadcasts', label: 'Broadcasts', icon: Radio, end: false, allowedRoles: ['ADMIN', 'WHATSAPP_MANAGER'] },
  //     { to: '/whatsapp/templates', label: 'Templates', icon: FileText, end: false, allowedRoles: ['ADMIN', 'WHATSAPP_MANAGER'] },
  //     { to: '/whatsapp/contacts', label: 'Contacts & Leads', icon: Users, end: false, allowedRoles: ['ADMIN', 'WHATSAPP_MANAGER'] },
  //     { to: '/whatsapp/pipelines', label: 'Pipelines & Deals', icon: GitFork, end: false, allowedRoles: ['ADMIN', 'WHATSAPP_MANAGER'] },
  //     { to: '/whatsapp/settings', label: 'WhatsApp Config', icon: Settings, end: false, allowedRoles: ['ADMIN', 'WHATSAPP_MANAGER'] },
  //   ],
  // },
  {
    title: 'ADMINISTRATION',
    items: [
      { to: '/users', label: 'Users & Staff', icon: Users, end: false, allowedRoles: ['ADMIN'] },
      { to: '/audit-logs', label: 'Activity Log', icon: History, end: false, allowedRoles: ['ADMIN'] },
      { to: '/settings', label: 'Site Settings', icon: Settings, end: false, allowedRoles: ['ADMIN'] },
    ],
  },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getUser();
  const currentRole = getRole();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  function handleLogout() {
    clearToken();
    navigate('/login', { replace: true });
  }

  const roleLabel =
    currentRole === 'ADMIN'
      ? 'Administrator'
      : currentRole === 'WHATSAPP_MANAGER'
        ? 'WhatsApp CRM Manager'
        : 'Product Manager';

  const roleColor =
    currentRole === 'ADMIN'
      ? '#c084fc'
      : currentRole === 'WHATSAPP_MANAGER'
        ? '#86efac'
        : '#93c5fd';

  return (
    <div className="admin-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12, zIndex: 40,
          background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)',
          border: 'none', borderRadius: 10, width: 40, height: 40,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Menu size={20} />
      </button>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`} style={{
        width: 228,
        height: '100vh',
        background: 'var(--inverse-surface)',
        color: 'var(--inverse-on-surface)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 650,
          letterSpacing: '-0.3px',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={20} color="var(--primary-container)" />
            Komal's Sweet Palace Admin
          </span>
          <button
            type="button"
            className="mobile-close-toggle"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ display: 'none', background: 'none', border: 'none', color: 'inherit' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Structured Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) => item.allowedRoles.includes(currentRole));
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{
                  padding: '4px 10px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                }}>
                  {section.title}
                </div>
                {filteredItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8.5px 12px',
                      borderRadius: 9,
                      fontSize: 13,
                      fontWeight: 500,
                      color: isActive ? 'var(--on-primary)' : 'var(--inverse-on-surface)',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      transition: 'background 0.15s ease',
                    })}
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px 8px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          {currentUser && (
            <div style={{ padding: '2px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--inverse-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </span>
              <span style={{ fontSize: 11, color: roleColor, fontWeight: 500 }}>
                {roleLabel}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 4px', borderRadius: 6,
              fontSize: 12.5, fontWeight: 500, background: 'transparent',
              border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', background: 'var(--surface)', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="admin-content" style={{ padding: '24px 32px', width: '100%', minHeight: '100%' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 860px) {
          .mobile-menu-toggle { display: flex !important; }
          .mobile-close-toggle { display: flex !important; align-items: center; justify-content: center; }

          .admin-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: var(--shadow-lg);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 45;
          }

          .admin-content {
            padding: 20px 16px 32px !important;
            padding-top: 64px !important;
            max-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .admin-content { padding: 16px 12px 28px !important; padding-top: 60px !important; }
        }
      `}</style>
    </div>
  );
}
