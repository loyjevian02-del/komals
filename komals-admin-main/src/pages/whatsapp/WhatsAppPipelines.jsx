import { useState, useEffect } from 'react';
import { GitFork, Plus, RefreshCw, DollarSign, User, Calendar, Trash2, CheckCircle2, ChevronRight, X, ArrowRight, IndianRupee } from 'lucide-react';
import { whatsappService, friendlyError } from '../../lib/whatsappApi.js';

export default function WhatsAppPipelines() {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    value: '',
    stage_id: '',
    contact_id: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let pList = await whatsappService.getPipelines();
      if (pList.length === 0) {
        // If empty, auto-create default pipeline
        const created = await whatsappService.createPipeline?.({ name: 'Store Sales & Inquiries' });
        pList = await whatsappService.getPipelines();
      }

      setPipelines(pList);
      const activeP = selectedPipeline || pList[0];
      if (activeP) {
        setSelectedPipeline(activeP);
        const [sList, dList, cList] = await Promise.all([
          whatsappService.getPipelineStages(activeP.id),
          whatsappService.getDeals(activeP.id),
          whatsappService.getContacts(),
        ]);
        setStages(sList);
        setDeals(dList);
        setContacts(cList);
        if (sList.length > 0 && !form.stage_id) {
          setForm((prev) => ({ ...prev, stage_id: sList[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load pipeline board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedPipeline) return;

    setSaving(true);
    try {
      await whatsappService.createDeal(selectedPipeline.id, {
        title: form.title.trim(),
        value: form.value ? String(form.value) : '0',
        stage_id: form.stage_id || stages[0]?.id,
        contact_id: form.contact_id || null,
        notes: form.notes.trim() || null,
        currency: 'INR',
      });

      setShowModal(false);
      setForm({ title: '', value: '', stage_id: stages[0]?.id || '', contact_id: '', notes: '' });
      await fetchData();
    } catch (err) {
      console.error('Failed to create deal:', err);
      alert(friendlyError(err, 'create deal'));
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStage = async (dealId, newStageId) => {
    try {
      const isWon = stages.find((s) => s.id === newStageId)?.name?.toLowerCase() === 'won';
      await whatsappService.updateDeal(dealId, {
        stage_id: newStageId,
        status: isWon ? 'won' : 'open',
      });
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId, stageId: newStageId } : d))
      );
    } catch (err) {
      console.error('Failed to move deal:', err);
      alert(friendlyError(err, 'move deal'));
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await whatsappService.deleteDeal(dealId);
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err) {
      alert(friendlyError(err, 'delete deal'));
    }
  };

  const totalValue = deals.reduce((acc, d) => acc + (parseFloat(d.value) || 0), 0);
  const wonDeals = deals.filter((d) => {
    const stName = stages.find((s) => s.id === (d.stage_id || d.stageId))?.name?.toLowerCase();
    return stName === 'won' || d.status === 'won';
  });
  const wonValue = wonDeals.reduce((acc, d) => acc + (parseFloat(d.value) || 0), 0);

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitFork size={24} color="var(--primary)" />
            Sales Pipeline & Deal Tracking
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Track customer WhatsApp inquiries, quotes, and converted store purchases
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
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
            <Plus size={16} /> New Deal
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Active Deals</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'var(--on-surface)' }}>{deals.length}</div>
        </div>

        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Pipeline Value</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'var(--primary)' }}>
            ₹{totalValue.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Won Revenue</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#16a34a' }}>
            ₹{wonValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stages.length || 5}, minmax(260px, 1fr))`,
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 16,
        alignItems: 'start',
      }}>
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => (d.stage_id || d.stageId) === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + (parseFloat(d.value) || 0), 0);

          return (
            <div
              key={stage.id}
              style={{
                background: 'var(--surface-container-low)',
                borderRadius: 14,
                border: '1px solid var(--outline-variant)',
                padding: '16px 14px',
                minHeight: 450,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Stage Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color || 'var(--primary)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>{stage.name}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 12,
                    background: 'var(--surface-container-high)',
                    color: 'var(--on-surface-variant)',
                  }}>
                    {stageDeals.length}
                  </span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--outline)' }}>
                  ₹{stageTotal.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Deal Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {stageDeals.length === 0 ? (
                  <div style={{
                    padding: '30px 10px',
                    textAlign: 'center',
                    color: 'var(--outline)',
                    fontSize: 12.5,
                    border: '1px dashed var(--outline-variant)',
                    borderRadius: 10,
                  }}>
                    No deals in this stage
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const contact = contacts.find((c) => c.id === (deal.contact_id || deal.contactId));

                    return (
                      <div
                        key={deal.id}
                        style={{
                          background: 'var(--surface)',
                          borderRadius: 10,
                          padding: '14px',
                          border: '1px solid var(--outline-variant)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--on-surface)', wordBreak: 'break-word' }}>
                            {deal.title}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteDeal(deal.id)}
                            title="Delete deal"
                            style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 2 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {contact && (
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <User size={13} color="var(--primary)" />
                            <span>{contact.name || contact.phone}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 750, color: 'var(--primary)' }}>
                            ₹{parseFloat(deal.value || 0).toLocaleString('en-IN')}
                          </span>

                          {/* Quick Stage Mover */}
                          <select
                            value={stage.id}
                            onChange={(e) => handleMoveStage(deal.id, e.target.value)}
                            style={{
                              fontSize: 11,
                              padding: '3px 6px',
                              borderRadius: 6,
                              border: '1px solid var(--outline-variant)',
                              background: 'var(--surface-container-low)',
                              color: 'var(--on-surface)',
                              cursor: 'pointer',
                            }}
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move → {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
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
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Create New Sales Deal</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Deal Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bulk Grocery Order or 55-inch TV Inquiry"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Estimated Value (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Pipeline Stage</label>
                  <select
                    value={form.stage_id}
                    onChange={(e) => setForm({ ...form, stage_id: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Customer / Contact</label>
                <select
                  value={form.contact_id}
                  onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                >
                  <option value="">Select a contact (optional)…</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || 'Unnamed'} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Customer requested quote for Diwali corporate gifting hampers."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  disabled={saving || !form.title.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} /> {saving ? 'Creating…' : 'Create Deal'}
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
