import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import ProductForm from './pages/ProductForm.jsx';
import ProductImport from './pages/ProductImport.jsx';
import Categories from './pages/Categories.jsx';
import CategoryForm from './pages/CategoryForm.jsx';
import Offers from './pages/Offers.jsx';
import OfferForm from './pages/OfferForm.jsx';
import Gallery from './pages/Gallery.jsx';
import GalleryForm from './pages/GalleryForm.jsx';
import SiteSettings from './pages/SiteSettings.jsx';
import Insights from './pages/Insights.jsx';
import Users from './pages/Users.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import WhatsAppInbox from './pages/whatsapp/WhatsAppInbox.jsx';
import WhatsAppBroadcasts from './pages/whatsapp/WhatsAppBroadcasts.jsx';
import WhatsAppTemplates from './pages/whatsapp/WhatsAppTemplates.jsx';
import WhatsAppContacts from './pages/whatsapp/WhatsAppContacts.jsx';
import WhatsAppPipelines from './pages/whatsapp/WhatsAppPipelines.jsx';
import WhatsAppConfig from './pages/whatsapp/WhatsAppConfig.jsx';
import { getToken, isAdmin, canManageProducts, canManageWhatsApp, getRole } from './lib/api.js';
import './components/ui.css';

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function RoleHomeRedirect() {
  const role = getRole();
  if (role === 'WHATSAPP_MANAGER') return <Navigate to="/whatsapp/inbox" replace />;
  if (role === 'PRODUCT_MANAGER') return <Navigate to="/products" replace />;
  return <Dashboard />;
}

function AdminOnly({ children }) {
  const role = getRole();
  const fallback = role === 'WHATSAPP_MANAGER' ? '/whatsapp/inbox' : '/products';
  return isAdmin() ? children : <Navigate to={fallback} replace />;
}

function ProductManagerOrAdmin({ children }) {
  return canManageProducts() ? children : <Navigate to="/whatsapp/inbox" replace />;
}

function WhatsAppManagerOrAdmin({ children }) {
  return canManageWhatsApp() ? children : <Navigate to="/products" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<RoleHomeRedirect />} />

        {/* Products & Catalog (Admin + Product Manager) */}
        <Route path="/products" element={<ProductManagerOrAdmin><Products /></ProductManagerOrAdmin>} />
        <Route path="/products/import" element={<ProductManagerOrAdmin><ProductImport /></ProductManagerOrAdmin>} />
        <Route path="/products/:id" element={<ProductManagerOrAdmin><ProductForm /></ProductManagerOrAdmin>} />

        {/* Admin-Only Sections */}
        <Route path="/categories" element={<AdminOnly><Categories /></AdminOnly>} />
        <Route path="/categories/:id" element={<AdminOnly><CategoryForm /></AdminOnly>} />
        <Route path="/offers" element={<AdminOnly><Offers /></AdminOnly>} />
        <Route path="/offers/:id" element={<AdminOnly><OfferForm /></AdminOnly>} />
        <Route path="/gallery" element={<AdminOnly><Gallery /></AdminOnly>} />
        <Route path="/gallery/:id" element={<AdminOnly><GalleryForm /></AdminOnly>} />
        <Route path="/users" element={<AdminOnly><Users /></AdminOnly>} />
        <Route path="/audit-logs" element={<AdminOnly><AuditLogs /></AdminOnly>} />
        <Route path="/settings" element={<AdminOnly><SiteSettings /></AdminOnly>} />
        <Route path="/insights" element={<AdminOnly><Insights /></AdminOnly>} />

        {/* WhatsApp CRM (Admin + WhatsApp Manager) */}
        <Route path="/whatsapp" element={<WhatsAppManagerOrAdmin><WhatsAppInbox /></WhatsAppManagerOrAdmin>} />
        <Route path="/whatsapp/inbox" element={<WhatsAppManagerOrAdmin><WhatsAppInbox /></WhatsAppManagerOrAdmin>} />
        <Route path="/whatsapp/broadcasts" element={<WhatsAppManagerOrAdmin><WhatsAppBroadcasts /></WhatsAppManagerOrAdmin>} />
        <Route path="/whatsapp/templates" element={<WhatsAppManagerOrAdmin><WhatsAppTemplates /></WhatsAppManagerOrAdmin>} />
        <Route path="/whatsapp/contacts" element={<WhatsAppManagerOrAdmin><WhatsAppContacts /></WhatsAppManagerOrAdmin>} />
        <Route path="/whatsapp/pipelines" element={<WhatsAppManagerOrAdmin><WhatsAppPipelines /></WhatsAppManagerOrAdmin>} />
        <Route path="/whatsapp/settings" element={<WhatsAppManagerOrAdmin><WhatsAppConfig /></WhatsAppManagerOrAdmin>} />
      </Route>
    </Routes>
  );
}
