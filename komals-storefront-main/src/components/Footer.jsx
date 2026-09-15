import { Link } from 'react-router-dom';
import { Phone, Headphones, Mail, MapPin, Clock, Users, Facebook, Instagram, Navigation } from 'lucide-react';
import { useSettings } from '../lib/useSettings.js';
import { imageUrl } from '../lib/api.js';

export default function Footer() {
  const settings = useSettings();
  const siteName = settings?.siteName || "Komal's Sweet Palace";
  const year = new Date().getFullYear();

  return (
    <footer className="ksp-footer">
      {/* Top strip */}
      <div className="ksp-footer__strip">
        <div className="container ksp-footer__strip-inner">
          <span>Pure Ingredients</span>
          <span className="footer-dot" aria-hidden="true">✦</span>
          <span>Authentic Recipes</span>
          <span className="footer-dot" aria-hidden="true">✦</span>
          <span>Handcrafted with Love</span>
        </div>
      </div>

      {/* Main footer */}
      <div className="container ksp-footer__main">
        {/* Brand column */}
        <div className="ksp-footer__brand">
          {settings?.logo && (
            <img
              src={imageUrl(settings.logo)}
              alt={siteName}
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
          )}
          <div className="ksp-footer__wordmark">
            <span className="ksp-footer__wordmark-name">{siteName}</span>
            {/* <span className="ksp-footer__wordmark-sub">Sweet Palace</span> */}
          </div>
          {/* <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-primary, #fff)', fontFamily: 'var(--font-serif)' }}>
            {siteName}
          </span> */}


          <p className="ksp-footer__brand-desc">
            Celebrating every moment with authentic Indian sweets, made with love and tradition.
          </p>

          {/* Social links */}
          <div className="ksp-footer__socials">
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="ksp-footer__social-link" aria-label="Instagram">
                <Instagram size={16} />
              </a>
            )}
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="ksp-footer__social-link" aria-label="Facebook">
                <Facebook size={16} />
              </a>
            )}
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="ksp-footer__social-link ksp-footer__social-link--wa"
                aria-label="WhatsApp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Nav column
        <div className="ksp-footer__col">
          <h3 className="ksp-footer__col-heading">Explore</h3>
          <nav aria-label="Footer navigation">
            <Link className="ksp-footer__nav-link" to="/">  Home </Link>
            <Link className="ksp-footer__nav-link" to="/sweets">  Sweets  </Link>
            <Link className="ksp-footer__nav-link" to="/offers">  Offers  </Link>
            <Link className="ksp-footer__nav-link" to="/contact"> Contact </Link>
          </nav>
        </div> */}

        {/* Contact column */}
        {(settings?.address || settings?.contactPhone || settings?.contactEmail || settings?.storeHours) && (
          <div className="ksp-footer__col">
            <h3 className="ksp-footer__col-heading">Visit Us</h3>
            <div className="ksp-footer__contact-list">
              {settings?.address && (
                <span className="ksp-footer__contact-item">
                  <MapPin size={13} /> {settings.address}
                </span>
              )}
              {settings?.storeHours && (
                <span className="ksp-footer__contact-item">
                  <Clock size={13} /> {settings.storeHours}
                </span>
              )}
              {settings?.contactPhone && (
                <a href={`tel:${settings.contactPhone}`} className="ksp-footer__contact-item ksp-footer__contact-link">
                  <Phone size={13} /> {settings.contactPhone}
                </a>
              )}
              {settings?.supportPhone && (
                <a href={`tel:${settings.supportPhone}`} className="ksp-footer__contact-item ksp-footer__contact-link">
                  <Headphones size={13} /> {settings.supportPhone}
                </a>
              )}
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="ksp-footer__contact-item ksp-footer__contact-link">
                  <Mail size={13} /> {settings.contactEmail}
                </a>
              )}
              {settings?.mapsUrl && (
                <a href={settings.mapsUrl} target="_blank" rel="noreferrer" className="ksp-footer__contact-item ksp-footer__contact-link">
                  <Navigation size={13} /> Get Directions
                </a>
              )}
              {settings?.whatsappCommunityUrl && (
                <a href={settings.whatsappCommunityUrl} target="_blank" rel="noreferrer" className="ksp-footer__contact-item ksp-footer__contact-link">
                  <Users size={13} /> Join WhatsApp Community
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="ksp-footer__bottom">
        <div className="container ksp-footer__bottom-inner">
          <p className="ksp-footer__copyright">
            © {year} {siteName}. All rights reserved.
          </p>
          <div className="ksp-footer__legal">
            <Link to="/terms-and-conditions" className="ksp-footer__legal-link">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="ksp-footer__legal-link">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <style>{`
        .ksp-footer {
          /* On the dark footer only, the muted page accent reads as warm cream. */
          --gold: #D9C9A8;
          --gold-light: #EFE6D2;
          background: var(--primary-dark);
          color: rgba(255,255,255,0.75);
          margin-top: 0;
        }

        /* ── Top Strip ── */
        .ksp-footer__strip {
          background: rgba(0,0,0,0.15);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 14px 0;
        }
        .ksp-footer__strip-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          font-family: var(--font-sans);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold-light);
          opacity: 0.85;
        }
        .footer-dot {
          color: var(--gold);
          opacity: 0.5;
          font-size: 8px;
        }

        /* ── Main ── */
        .ksp-footer__main {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr;
          gap: 36px;
          padding-top: 40px;
          padding-bottom: 32px;
        }

        /* ── Brand ── */
        .ksp-footer__brand-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.ksp-footer__logo {
  height: 52px;
  width: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--gold, #c9a84c);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  margin-bottom: 4px;
}

.ksp-footer__wordmark {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.ksp-footer__wordmark-name {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 30%, var(--gold-light, #f3e5ab) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.03em;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.ksp-footer__wordmark-sub {
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-light);
  margin-top: 4px;
  opacity: 0.85;
}
        .ksp-footer__brand-desc {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.58);
          max-width: 300px;
          margin-bottom: 16px;
        }
        .ksp-footer__socials {
          display: flex;
          gap: 10px;
        }
        .ksp-footer__social-link {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .ksp-footer__social-link:hover {
          color: var(--gold-light);
          border-color: var(--gold);
          background: rgba(201,168,76,0.1);
        }
        .ksp-footer__social-link--wa {
          width: auto;
          border-radius: 999px;
          padding: 0 14px;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
        }

        /* ── Columns ── */
        .ksp-footer__col-heading {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 10px;
        }
        .ksp-footer__nav-link {
          display: block;
          font-size: 13.5px;
          color: rgba(255,255,255,0.62);
          padding: 3px 0;
          transition: color 0.2s, padding-left 0.2s;
          text-decoration: none;
        }
        .ksp-footer__nav-link:hover {
          color: #fff;
          padding-left: 4px;
        }
        .ksp-footer__contact-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ksp-footer__contact-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.4;
        }
        .ksp-footer__contact-item svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--gold);
          opacity: 0.8;
        }
        .ksp-footer__contact-link {
          text-decoration: none;
          transition: color 0.2s;
        }
        .ksp-footer__contact-link:hover {
          color: var(--gold-light);
        }

        /* ── Bottom ── */
        .ksp-footer__bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 18px 0;
        }
        .ksp-footer__bottom-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ksp-footer__copyright {
          font-size: 12px;
          color: rgba(255,255,255,0.38);
          margin: 0;
        }
        .ksp-footer__legal {
          display: flex;
          gap: 20px;
        }
        .ksp-footer__legal-link {
          font-size: 12px;
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ksp-footer__legal-link:hover {
          color: rgba(255,255,255,0.7);
          text-decoration: underline;
        }

        /* ── Responsive ── */
        @media (max-width: 540px) {
  .ksp-footer__main {
    grid-template-columns: 1fr;
    gap: 20px;
    padding-top: 28px;
    padding-bottom: 24px;
  }

  /* Explore links in one line */
  .ksp-footer__nav {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: nowrap;
  }

  .ksp-footer__nav-link {
    display: inline-block;
    padding: 0;
    font-size: 13px;
    white-space: nowrap;
  }

  .ksp-footer__nav-link + .ksp-footer__nav-link {
    margin-left: 16px;
  }

  .ksp-footer__bottom-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
      `}</style>
    </footer>
  );
}
