import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, CheckCircle2, Clock, AlertCircle, Trash2, X, Send, Sparkles } from 'lucide-react';
import { whatsappService, friendlyError } from '../../lib/whatsappApi.js';

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    header_type: 'NONE',
    header_content: '',
    body_text: '',
    footer_text: '',
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await whatsappService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await whatsappService.syncTemplates();
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to sync templates:', err);
      alert(friendlyError(err, 'sync templates'));
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.body_text.trim()) return;

    // Template names on Meta must be lowercase with underscores
    const sanitizedName = form.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    setSubmitting(true);
    try {
      const payload = {
        name: sanitizedName,
        category: form.category,
        language: form.language,
        header_type: form.header_type === 'NONE' ? null : form.header_type.toLowerCase(),
        header_content: form.header_type === 'TEXT' ? form.header_content.trim() : null,
        body_text: form.body_text.trim(),
        footer_text: form.footer_text.trim() || null,
      };

      const res = await whatsappService.createTemplate(payload);
      if (res?.error) {
        setFormError(res.error);
      } else {
        setShowModal(false);
        setForm({
          name: '',
          category: 'MARKETING',
          language: 'en_US',
          header_type: 'NONE',
          header_content: '',
          body_text: '',
          footer_text: '',
        });
        await fetchTemplates();
      }
    } catch (err) {
      console.error('Failed to submit template:', err);
      setFormError(friendlyError(err, 'submit template'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await whatsappService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(friendlyError(err, 'delete template'));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={24} color="var(--primary)" />
            WhatsApp Message Templates
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Create and manage Meta-approved message templates for broadcasts & outbound notifications
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing…' : 'Sync from Meta'}
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Create Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--outline)' }}>
          Loading templates…
        </div>
      ) : templates.length === 0 ? (
        <div style={{
          background: 'var(--surface-container-lowest)',
          borderRadius: 16,
          padding: 48,
          textAlign: 'center',
          border: '1px solid var(--outline-variant)',
        }}>
          <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.35, display: 'block' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No Templates Found</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--on-surface-variant)' }}>
            Create your first Meta WhatsApp template or sync existing templates from Meta.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleSync}
              className="btn btn-secondary"
            >
              Sync Existing from Meta
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              <Plus size={15} style={{ marginRight: 6 }} /> Create New Template
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 18,
        }}>
          {templates.map((t) => {
            const isApproved = t.status === 'APPROVED';
            const isPending = t.status === 'PENDING' || t.status === 'IN_APPEAL';

            return (
              <div
                key={t.id || t.name}
                style={{
                  background: 'var(--surface-container-lowest)',
                  borderRadius: 14,
                  border: '1px solid var(--outline-variant)',
                  padding: '20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: 14.5, fontWeight: 700, color: 'var(--on-surface)', wordBreak: 'break-all' }}>
                        {t.name}
                      </h3>
                      <div style={{ display: 'flex', gap: 6, fontSize: 11.5, color: 'var(--outline)' }}>
                        <span>{t.category || 'MARKETING'}</span>
                        <span>•</span>
                        <span>{t.language || 'en_US'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                        color: isApproved ? '#15803d' : isPending ? '#b45309' : '#b91c1c',
                      }}>
                        {isApproved ? <CheckCircle2 size={12} /> : isPending ? <Clock size={12} /> : <AlertCircle size={12} />}
                        {t.status || 'APPROVED'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        title="Delete template"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--outline)',
                          cursor: 'pointer',
                          padding: 4,
                          borderRadius: 4,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div style={{
                    background: 'var(--surface-container-low)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--on-surface)',
                    border: '1px solid var(--outline-variant)',
                    marginTop: 8,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {t.header_content && (
                      <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                        {t.header_content}
                      </div>
                    )}
                    <div>{t.body_text || t.bodyText || 'No body text'}</div>
                    {t.footer_text && (
                      <div style={{ fontSize: 11, color: 'var(--outline)', marginTop: 6 }}>
                        {t.footer_text}
                      </div>
                    )}
                  </div>
                </div>

                {t.buttons && Array.isArray(t.buttons) && t.buttons.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {t.buttons.map((b, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: 'var(--surface-container-high)',
                          color: 'var(--primary)',
                        }}
                      >
                        {b.text || 'Button'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Template Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: '24px 28px',
            width: '100%', maxWidth: 520, boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--outline-variant)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--primary)" /> Create WhatsApp Template
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                color: '#dc2626',
                fontSize: 13,
                marginBottom: 14,
              }}>
                <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Template Name (Lowercase & underscores only) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. weekend_grocery_discount"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                  >
                    <option value="MARKETING">Marketing (Promotions & Offers)</option>
                    <option value="UTILITY">Utility (Orders & Alerts)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                  >
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="kn">Kannada (kn)</option>
                    <option value="te">Telugu (te)</option>
                    <option value="ta">Tamil (ta)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Header Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Offer from Jayalakshmi Hyper Mart"
                  value={form.header_content}
                  onChange={(e) => setForm({ ...form, header_type: e.target.value ? 'TEXT' : 'NONE', header_content: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Message Body Text *
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Hello {{1}}, enjoy flat 20% off on all items this weekend! Use code {{2}} at checkout."
                  value={form.body_text}
                  onChange={(e) => setForm({ ...form, body_text: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
                <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--outline)' }}>
                  Use &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; for dynamic variables (e.g. customer name, coupon code).
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Footer Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jayalakshmi Hyper Mart • Reply STOP to unsubscribe"
                  value={form.footer_text}
                  onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
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
                  disabled={submitting || !form.name.trim() || !form.body_text.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={14} /> {submitting ? 'Submitting to Meta…' : 'Submit to Meta for Approval'}
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
