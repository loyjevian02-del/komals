import { useSettings } from '../lib/useSettings.js';
import ContactDetails from '../components/ContactDetails.jsx';

export default function Contact() {
  const settings = useSettings();

  if (!settings) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div className="skeleton" style={{ height: 18, width: 200, borderRadius: 4, margin: '0 auto 12px' }} />
      <div className="skeleton" style={{ height: 14, width: 300, borderRadius: 3, margin: '0 auto' }} />
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="contact-page-header">
        <div className="container">
          <span className="section-eyebrow">Get in Touch</span>
          <h1 className="contact-page-header__title">Contact Us</h1>
          <p className="contact-page-header__sub">
            Reach out to {settings.siteName || "Komal's Sweet Palace"} — we're happy to help.
          </p>
        </div>
      </div>

      <div className="container contact-container">
        <ContactDetails settings={settings} />
      </div>

      <style>{`
        .contact-page-header {
          background: var(--surface-container-lowest);
          border-bottom: 1px solid var(--outline-variant);
          padding: 52px 0 48px;
        }
        .contact-page-header__title {
          font-family: var(--font-serif);
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 600;
          color: var(--on-surface);
          margin: 10px 0 10px;
        }
        .contact-page-header__sub {
          font-size: 14px;
          color: var(--on-surface-variant);
          max-width: 420px;
        }
        .contact-container {
          padding-top: 56px;
          padding-bottom: 80px;
        }
      `}</style>
    </div>
  );
}
