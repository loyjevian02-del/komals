import { useState, useEffect } from 'react';
import { Users, Search, Plus, Phone, MessageSquare, Trash2, Tag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { whatsappService, friendlyError } from '../../lib/whatsappApi.js';

export default function WhatsAppContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await whatsappService.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!form.phone.trim()) return;
    setSaving(true);
    try {
      await whatsappService.createContact({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setShowModal(false);
      setForm({ name: '', phone: '', email: '', tags: '' });
      fetchContacts();
    } catch (err) {
      alert(friendlyError(err, 'save contact'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await whatsappService.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(friendlyError(err, 'delete contact'));
    }
  };

  const filtered = contacts.filter((c) => {
    const term = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) ||
           (c.phone || '').includes(term) ||
           (c.email || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} color="var(--primary)" />
            Customer Contacts & Leads
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Manage customer database, phone numbers, and communication history
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={fetchContacts}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{ background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Contacts</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>{contacts.length}</div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Active WhatsApp Reach</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
            {contacts.filter((c) => c.phone).length}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface-container-lowest)',
        borderRadius: 10,
        border: '1px solid var(--outline-variant)',
        padding: '10px 14px',
        gap: 10,
        marginBottom: 16,
        maxWidth: 400,
      }}>
        <Search size={16} color="var(--outline)" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13.5 }}
        />
      </div>

      {/* Contacts Table */}
      <div style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 12,
        border: '1px solid var(--outline-variant)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Phone Number</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tags</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && contacts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--outline)' }}>
                  Loading contacts…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  No contacts found. Click &quot;Add Contact&quot; to create one.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--surface-container-high)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--on-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container-high)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                        color: 'var(--primary)'
                      }}>
                        {(c.name || c.phone || 'C').charAt(0).toUpperCase()}
                      </div>
                      {c.name || 'Unnamed Contact'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--on-surface)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color="var(--outline)" />
                      {c.phone}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--on-surface-variant)' }}>
                    {c.email || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Array.isArray(c.tags) && c.tags.length > 0 ? (
                        c.tags.map((t, idx) => (
                          <span key={idx} style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--surface-container-high)',
                            color: 'var(--on-surface-variant)',
                          }}>
                            {t}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--outline)', fontSize: 12 }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => navigate('/whatsapp/inbox')}
                        title="Chat on WhatsApp"
                        style={{
                          background: 'rgba(211, 31, 38, 0.08)',
                          color: 'var(--primary)',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12.5,
                          fontWeight: 600,
                        }}
                      >
                        <MessageSquare size={13} /> Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        title="Delete contact"
                        style={{
                          background: 'transparent',
                          color: 'var(--error)',
                          border: 'none',
                          padding: '6px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: '24px 28px',
            width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-xl)',
          }}>
            <h2 style={{ fontSize: 18, margin: '0 0 16px', fontWeight: 700 }}>Add New Customer Contact</h2>
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Customer Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Phone Number (with Country Code) *</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98000 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. VIP, Wholesale, Electronics"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving…' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
