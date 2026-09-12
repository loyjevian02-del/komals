import { Phone, Mail, MapPin, Clock, Users, Facebook, Instagram, Headphones, Navigation } from 'lucide-react';
import { useSettings } from '../lib/useSettings.js';
import WhatsAppIcon from '../components/WhatsAppIcon.jsx';

function ContactRow({ icon: Icon, children }) {
  return (
    <div className="contact-row">
      <div className="contact-row__icon" aria-hidden="true">
        <Icon size={16} />
      </div>
      <div className="contact-row__content">{children}</div>
    </div>
  );
}

export default function Contact() {
  const settings = useSettings();

  if (!settings) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div className="skeleton" style={{ height: 18, width: 200, borderRadius: 4, margin: '0 auto 12px' }} />
      <div className="skeleton" style={{ height: 14, width: 300, borderRadius: 3, margin: '0 auto' }} />
    </div>
  );

  const hasAnyContact = settings.contactPhone || settings.supportPhone || settings.contactEmail
    || settings.address || settings.mapsUrl || settings.storeHours
    || settings.whatsappNumber || settings.whatsappCommunityUrl
    || settings.facebookUrl || settings.instagramUrl;

  return (
    <div>
      {/* Page Header */}
      <div className="contact-page-header">
        <div className="container">
          <span className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>Get in Touch</span>
          <h1 className="contact-page-header__title">Contact Us</h1>
          <p className="contact-page-header__sub">
            Reach out to {settings.siteName || "Komal's Sweet Palace"} — we're happy to help.
          </p>
        </div>
      </div>

      <div className="container contact-container">
        <div className="contact-layout">
          {/* Left: Contact Details */}
          <div className="contact-card">
            <h2 className="contact-card__heading">Our Details</h2>
            <div className="contact-card__divider" />

            {!hasAnyContact ? (
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Contact details coming soon.</p>
            ) : (
              <div className="contact-rows">
                {settings.address && (
                  <ContactRow icon={MapPin}>{settings.address}</ContactRow>
                )}
                {settings.storeHours && (
                  <ContactRow icon={Clock}>{settings.storeHours}</ContactRow>
                )}
                {settings.contactPhone && (
                  <ContactRow icon={Phone}>
                    Business: <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
                  </ContactRow>
                )}
                {settings.supportPhone && (
                  <ContactRow icon={Headphones}>
                    Support: <a href={`tel:${settings.supportPhone}`}>{settings.supportPhone}</a>
                  </ContactRow>
                )}
                {settings.contactEmail && (
                  <ContactRow icon={Mail}>
                    <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                  </ContactRow>
                )}
                {settings.whatsappNumber && (
                  <ContactRow icon={WhatsAppIcon}>
                    <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                      WhatsApp: {settings.whatsappNumber}
                    </a>
                  </ContactRow>
                )}
                {settings.whatsappCommunityUrl && (
                  <ContactRow icon={Users}>
                    <a href={settings.whatsappCommunityUrl} target="_blank" rel="noreferrer">
                      Join our WhatsApp Community
                    </a>
                  </ContactRow>
                )}
                {settings.facebookUrl && (
                  <ContactRow icon={Facebook}>
                    <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
                  </ContactRow>
                )}
                {settings.instagramUrl && (
                  <ContactRow icon={Instagram}>
                    <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
                  </ContactRow>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="contact-ctas">
              {settings.contactPhone && (
                <a href={`tel:${settings.contactPhone}`} className="btn-primary">
                  <Phone size={14} /> Call Us
                </a>
              )}
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-wa-btn"
                >
                  <WhatsAppIcon size={15} /> WhatsApp
                </a>
              )}
              {settings.mapsUrl && (
                <a href={settings.mapsUrl} target="_blank" rel="noreferrer" className="btn-outline">
                  <Navigation size={14} /> Directions
                </a>
              )}
            </div>
          </div>

          {/* Right: Brand message
          <div className="contact-brand">
            <svg viewBox="0 0 200 200" className="contact-brand__svg" aria-hidden="true">
              <circle cx="100" cy="100" r="96" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
              <circle cx="100" cy="100" r="78" fill="none" stroke="var(--gold)" strokeWidth="0.3" opacity="0.6" />
              <path d="M100 15 L112 88 L185 100 L112 112 L100 185 L88 112 L15 100 L88 88 Z" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.5" />
            </svg>
            <blockquote className="contact-brand__quote">
              "Every visit to Komal's Sweet Palace is a celebration. We'd love to hear from you."
            </blockquote>
          </div> */}
        </div>
      </div>

      <style>{`
        .contact-page-header {
          background: var(--primary);
          padding: 52px 0 48px;
        }
        .contact-page-header__title {
          font-family: var(--font-serif);
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 600;
          color: #fff;
          margin: 10px 0 10px;
        }
        .contact-page-header__sub {
          font-size: 14px;
          color: rgba(255,255,255,0.72);
          max-width: 420px;
        }
        .contact-container {
          padding-top: 56px;
          padding-bottom: 80px;
        }
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 64px;
          align-items: start;
        }
        .contact-card {
          max-width: 520px;
        }
        .contact-card__heading {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 600;
          color: var(--on-surface);
          margin: 0 0 12px;
        }
        .contact-card__divider {
          width: 48px;
          height: 1.5px;
          background: var(--gold);
          margin-bottom: 28px;
        }
        .contact-rows {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 28px;
        }
        .contact-row {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid var(--outline-variant);
        }
        .contact-row:last-child {
          border-bottom: none;
        }
        .contact-row__icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--primary-container);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .contact-row__content {
          font-size: 14px;
          color: var(--on-surface);
          line-height: 1.6;
          padding-top: 7px;
        }
        .contact-row__content a {
          color: var(--primary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .contact-row__content a:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }
        .contact-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .contact-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: #25D366;
          color: #fff;
          border: 1.5px solid #25D366;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .contact-wa-btn:hover {
          background: #1db954;
          border-color: #1db954;
          transform: translateY(-1px);
        }
        .contact-brand {
          width: 200px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .contact-brand__svg {
          width: 160px;
          height: 160px;
          opacity: 0.35;
        }
        .contact-brand__quote {
          font-family: var(--font-serif);
          font-size: 15px;
          font-style: italic;
          color: var(--on-surface-variant);
          text-align: center;
          line-height: 1.7;
          border: none;
          padding: 0;
          margin: 0;
        }
        @media (max-width: 820px) {
          .contact-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .contact-brand {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .contact-ctas {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
