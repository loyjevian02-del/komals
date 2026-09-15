import { Phone, Mail, MapPin, Clock, Users, Facebook, Instagram, Headphones, Navigation } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon.jsx';

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

/** Contact card (address/phone/WhatsApp/socials + map). Shared by the Contact page and the Home page contact section. */
export default function ContactDetails({ settings }) {
  const hasAnyContact = settings.contactPhone || settings.supportPhone || settings.contactEmail
    || settings.address || settings.mapsUrl || settings.storeHours
    || settings.whatsappNumber || settings.whatsappCommunityUrl
    || settings.facebookUrl || settings.instagramUrl;

  return (
    <div className="contact-details">
      <div className="contact-layout">
        <div className="contact-card">
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
      </div>

      {(settings.address || settings.mapsUrl) && (
        <div className="contact-map">
          <iframe
            title="Store location"
            className="contact-map__frame"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address || settings.siteName || "Komal's Sweet Palace")}&output=embed`}
          />
        </div>
      )}

      <style>{`
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr;
          align-items: start;
        }
        .contact-card {
          max-width: 520px;
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
        .contact-map {
          margin-top: 40px;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--outline-variant);
        }
        .contact-map__frame {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          border: 0;
        }
        @media (max-width: 820px) {
          .contact-map__frame {
            aspect-ratio: 4 / 3;
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
