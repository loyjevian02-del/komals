import { useState, useEffect } from 'react';
import { Radio, Plus, CheckCircle, RefreshCw, Send, Users, FileText, Check, AlertCircle, X } from 'lucide-react';
import { whatsappService, friendlyError } from '../../lib/whatsappApi.js';

export default function WhatsAppBroadcasts() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', templateName: '', audienceTag: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.allSettled([
        whatsappService.getBroadcasts(),
        whatsappService.getTemplates(),
      ]);
      setBroadcasts(bRes.status === 'fulfilled' ? bRes.value : []);
      setTemplates(tRes.status === 'fulfilled' ? tRes.value : []);
    } catch (err) {
      console.error('Failed to load broadcasts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncTemplates = async () => {
    setSyncing(true);
    try {
      await whatsappService.syncTemplates();
      await fetchData();
    } catch (err) {
      console.error('Failed to sync templates:', err);
      alert(friendlyError(err, 'sync templates'));
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.templateName) return;
    setSaving(true);
    try {
      // 1. Fetch contacts to broadcast to
      const contacts = await whatsappService.getContacts();
      const audienceTag = (form.audienceTag || '').trim().toLowerCase();

      // Filter by tag if specified
      const targetContacts = audienceTag
        ? contacts.filter((c) => {
            const tags = Array.isArray(c.tags) ? c.tags.map((t) => (typeof t === 'string' ? t : t.name).toLowerCase()) : [];
            const nameMatch = (c.name || '').toLowerCase().includes(audienceTag);
            return tags.includes(audienceTag) || nameMatch;
          })
        : contacts;

      const phoneNumbers = targetContacts
        .map((c) => c.phone)
        .filter((p) => p && typeof p === 'string' && p.trim().length > 0);

      if (phoneNumbers.length === 0) {
        alert(audienceTag 
          ? `No contacts found matching '${form.audienceTag}'. Please make sure contacts with this name or tag exist in Contacts & Leads.`
          : 'No contacts found with phone numbers. Please add contacts in Contacts & Leads first.'
        );
        setSaving(false);
        return;
      }

      // 2. Dispatch broadcast
      const selectedTpl = templates.find((t) => t.name === form.templateName);
      const res = await whatsappService.createBroadcast({
        name: form.name.trim(),
        template_name: form.templateName,
        template_language: selectedTpl?.language || 'en_US',
        phone_numbers: phoneNumbers,
      });

      if (res?.error) {
        alert('Broadcast failed: ' + res.error);
      } else {
        alert(`Broadcast campaign dispatched to ${res.sent ?? phoneNumbers.length} recipient(s)!`);
        setShowModal(false);
        setForm({ name: '', templateName: '', audienceTag: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to launch broadcast campaign:', err);
      alert(friendlyError(err, 'launch broadcast campaign'));
    } finally {
      setSaving(false);
    }
  };

  const selectedTemplateObj = templates.find((t) => t.name === form.templateName);

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={24} color="var(--primary)" />
            WhatsApp Broadcast Campaigns
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Send bulk marketing offers, catalog updates, and order announcements to customers
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handleSyncTemplates}
            disabled={syncing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing…' : 'Sync Meta Templates'}
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> New Broadcast
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '18px 20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Total Campaigns</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: 'var(--on-surface)' }}>{broadcasts.length}</div>
        </div>

        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '18px 20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Approved Meta Templates</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#16a34a' }}>{templates.length}</div>
        </div>
      </div>

      {/* Broadcasts Table */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
              <th style={{ padding: '12px 18px' }}>Campaign Name</th>
              <th style={{ padding: '12px 18px' }}>Template</th>
              <th style={{ padding: '12px 18px' }}>Status</th>
              <th style={{ padding: '12px 18px' }}>Audience</th>
              <th style={{ padding: '12px 18px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--outline)' }}>
                  Loading campaigns…
                </td>
              </tr>
            ) : broadcasts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  No broadcast campaigns created yet. Click &quot;New Broadcast&quot; to launch your first WhatsApp campaign.
                </td>
              </tr>
            ) : (
              broadcasts.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--surface-container-high)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 650 }}>{b.name}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--on-surface-variant)' }}>
                    <code>{b.template_name || b.templateName || 'Custom'}</code>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {(() => {
                      const st = (b.status || 'sent').toLowerCase();
                      const isFailed = st === 'failed';
                      const isPending = st === 'sending' || st === 'scheduled' || st === 'draft';

                      return (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: isFailed ? '#fee2e2' : isPending ? '#fef3c7' : 'rgba(22, 163, 74, 0.1)',
                          color: isFailed ? '#dc2626' : isPending ? '#d97706' : '#16a34a',
                        }}>
                          {isFailed ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
                          {b.status || 'sent'}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--on-surface-variant)' }}>
                    {b.tag || (b.total_recipients || b.totalRecipients ? `${b.sent_count ?? b.sentCount ?? b.total_recipients ?? b.totalRecipients} Recipient(s)` : 'All Contacts')}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--outline)' }}>
                    {b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Broadcast Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: '24px 28px',
            width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--outline-variant)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Launch WhatsApp Broadcast</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Campaign Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Special Offers"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>WhatsApp Template *</label>
                <select
                  value={form.templateName}
                  onChange={(e) => setForm({ ...form, templateName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                >
                  <option value="">Select an approved template…</option>
                  {templates.map((t) => (
                    <option key={t.id || t.name} value={t.name}>
                      {t.name} ({t.category || 'Approved'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplateObj && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                  fontSize: 12.5,
                  color: 'var(--on-surface)',
                  lineHeight: 1.5,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Template Message Preview
                  </div>
                  {selectedTemplateObj.body_text || selectedTemplateObj.bodyText || selectedTemplateObj.header_content || 'Pre-approved WhatsApp Template'}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Target Audience Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. VIP (leave blank to send to all contacts)"
                  value={form.audienceTag}
                  onChange={(e) => setForm({ ...form, audienceTag: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.name.trim() || !form.templateName}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={14} /> {saving ? 'Launching…' : 'Launch Broadcast'}
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
