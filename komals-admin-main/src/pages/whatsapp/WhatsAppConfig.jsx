import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Phone, Copy, Check, RefreshCw } from 'lucide-react';
import { whatsappService, friendlyError } from '../../lib/whatsappApi.js';

export default function WhatsAppConfig() {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    displayPhoneNumber: '',
    metaAppId: '',
    metaAppSecret: '',
    verifyToken: '',
  });
  const [hasMetaAppSecret, setHasMetaAppSecret] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [verifiedInfo, setVerifiedInfo] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // wacrm lives under /crm on this same domain in production (no
  // separate subdomain — avoids a DNS/cert change). Local dev still
  // points at wacrm's own dev server on :3000, no /crm prefix there.
  const webhookUrl = import.meta.env.DEV
    ? `${window.location.origin.replace(':5174', ':3000')}/api/whatsapp/webhook`
    : `${window.location.origin}/crm/api/whatsapp/webhook`;

  const fetchConfigStatus = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await whatsappService.getConfig();
      if (data) {
        setIsConnected(Boolean(data.connected));
        setVerifiedInfo(data.phone_info || null);
        setStatusMessage(data.message || '');

        const cfg = data.config || {};
        setConfig((prev) => ({
          phoneNumberId: cfg.phone_number_id || prev.phoneNumberId || '',
          wabaId: cfg.waba_id || prev.wabaId || '',
          accessToken: prev.accessToken || '',
          displayPhoneNumber: prev.displayPhoneNumber || (data.phone_info?.display_phone_number || ''),
          metaAppId: cfg.meta_app_id || prev.metaAppId || '',
          metaAppSecret: prev.metaAppSecret || '',
        }));
        setHasMetaAppSecret(Boolean(cfg.has_meta_app_secret));
      }
    } catch (err) {
      console.error('Failed to load config:', err);
      setIsConnected(false);
      setStatusMessage(friendlyError(err, 'load WhatsApp configuration'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMessage('');
    try {
      const res = await whatsappService.updateConfig({
        phone_number_id: config.phoneNumberId.trim(),
        waba_id: config.wabaId.trim(),
        access_token: config.accessToken.trim(),
        display_phone_number: config.displayPhoneNumber.trim(),
        // Omitted (blank) preserves whatever's already saved — same
        // masked-placeholder behavior as access_token.
        meta_app_id: config.metaAppId.trim(),
        meta_app_secret: config.metaAppSecret.trim(),
        verify_token: config.verifyToken.trim(),
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccess(true);
        await fetchConfigStatus();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setErrorMessage(friendlyError(err, 'save WhatsApp configuration'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={24} color="var(--primary)" />
            WhatsApp Business API Configuration
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Configure Meta WhatsApp Cloud API credentials to enable live customer messaging
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConfigStatus}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Check Status
        </button>
      </div>

      {/* Real Live Status Banner */}
      <div style={{
        background: isConnected ? 'rgba(22, 163, 74, 0.05)' : 'rgba(220, 38, 38, 0.05)',
        borderRadius: 12,
        border: isConnected ? '1px solid rgba(22, 163, 74, 0.25)' : '1px solid rgba(220, 38, 38, 0.25)',
        padding: '18px 22px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: isConnected ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
            color: isConnected ? '#16a34a' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isConnected ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--on-surface)' }}>
              {isConnected ? 'WhatsApp Cloud API Status' : 'WhatsApp API Status'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {isConnected
                ? `Connected: ${verifiedInfo?.display_phone_number || config.displayPhoneNumber || 'Verified with Meta'}`
                : statusMessage || 'Disconnected. Please save valid Meta Cloud API credentials below.'}
            </div>
          </div>
        </div>

        <span style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: isConnected ? '#15803d' : '#b91c1c',
          background: isConnected ? '#dcfce7' : '#fee2e2',
          padding: '5px 12px',
          borderRadius: 999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isConnected ? '#16a34a' : '#dc2626' }} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSave} style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 12,
        border: '1px solid var(--outline-variant)',
        padding: '28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {success && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(22, 163, 74, 0.1)',
            border: '1px solid rgba(22, 163, 74, 0.25)',
            color: '#16a34a',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircle2 size={16} /> WhatsApp API settings saved and verified with Meta successfully!
          </div>
        )}

        {errorMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: '#dc2626',
            fontSize: 13.5,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>
              Phone Number ID (From Meta Developer Portal)
            </label>
            <input
              type="text"
              placeholder="e.g. 1207659282440105"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>
              WhatsApp Business Account ID (WABA ID)
            </label>
            <input
              type="text"
              placeholder="e.g. 1392847842949077"
              value={config.wabaId}
              onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13.5 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>
            Display Phone Number
          </label>
          <input
            type="text"
            placeholder="Enter business phone number with country code"
            value={config.displayPhoneNumber}
            onChange={(e) => setConfig({ ...config, displayPhoneNumber: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13.5 }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
              System User / Permanent Access Token
            </label>
            {isConnected && (
              <span style={{ fontSize: 11.5, color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
                Active & Encrypted
              </span>
            )}
          </div>
          <textarea
            rows={3}
            placeholder={isConnected ? '•••••••••••••••••••••••••••••••••••••••• (Encrypted in Database — paste new token only to change)' : 'Paste your token from Meta Developer Portal (e.g. EAAT...)'}
            value={config.accessToken}
            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
            required={!isConnected}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13, fontFamily: 'monospace' }}
          />
          <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--outline)' }}>
            For security, your access token is encrypted with AES-256 in the database and never shown in plain text.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>
              Meta App ID (From Meta Developer Portal &rarr; App Settings &rarr; Basic)
            </label>
            <input
              type="text"
              placeholder="e.g. 1234567890123456"
              value={config.metaAppId}
              onChange={(e) => setConfig({ ...config, metaAppId: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13.5 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                Meta App Secret
              </label>
              {hasMetaAppSecret && (
                <span style={{ fontSize: 11.5, color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
                  Saved &amp; Encrypted
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={hasMetaAppSecret ? '•••••••••••••••••••••••• (paste new value only to change)' : 'From App Settings → Basic → App Secret'}
              value={config.metaAppSecret}
              onChange={(e) => setConfig({ ...config, metaAppSecret: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13.5, fontFamily: 'monospace' }}
            />
            <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--outline)' }}>
              Verifies that incoming WhatsApp messages really come from Meta. Encrypted in the database, never shown in plain text.
            </p>
          </div>
        </div>

        {/* Webhook URL Copy */}
        <div style={{
          padding: '16px 18px',
          background: 'var(--surface-container-low)',
          borderRadius: 8,
          border: '1px solid var(--outline-variant)',
        }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>
            Meta Webhook Callback URL
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              readOnly
              value={webhookUrl}
              style={{ flex: 1, padding: '9px 12px', fontSize: 12.5, borderRadius: 6, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)' }}
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 14px', fontSize: 12.5 }}
            >
              {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--on-surface)' }}>
            Webhook Verify Token
          </label>
          <input
            type="text"
            placeholder="Make up any string (e.g. jmart-verify-2026) — enter the exact same value in Meta's webhook setup above"
            value={config.verifyToken}
            onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', fontSize: 13.5, fontFamily: 'monospace' }}
          />
          <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--outline)' }}>
            You invent this value yourself and enter it in two places: here, and in Meta's Webhook configuration screen. Re-enter it every time you Save this page (it isn&apos;t preserved across saves yet).
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
          >
            <Save size={16} /> {saving ? 'Verifying with Meta & Saving…' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
