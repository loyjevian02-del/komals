import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Phone, Menu, X } from 'lucide-react';
import { imageUrl } from '../lib/api.js';
import { useSettings } from '../lib/useSettings.js';

export default function Header() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const settings = useSettings();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isTypingRef = useRef(false);
  const searchInputRef = useRef(null);

  // Sync input value with URL when on /search
  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(searchParams.get('q') || '');
    } else {
      isTypingRef.current = false;
    }
  }, [location.pathname, searchParams]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  function handleInputChange(e) {
    const val = e.target.value;
    setQuery(val);
    isTypingRef.current = true;
    const trimmed = val.trim();
    if (trimmed.length >= 3) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleClear() {
    setQuery('');
    isTypingRef.current = false;
    if (location.pathname === '/search') navigate('/');
  }

  function handleStoryClick(e) {
    setMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('about-us') || document.getElementById('our-story');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function onSearch(e) {
    e.preventDefault();
    isTypingRef.current = false;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const siteName = settings?.siteName || "Komal's Sweet Palace";

  return (
    <>
      <header className={`ksp-header${scrolled ? ' ksp-header--scrolled' : ''}`}>
        <div className="ksp-header__inner container">
          {/* ── Logo & Name ── */}
          <Link to="/" className="ksp-logo" aria-label={siteName} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            {settings?.logo && (
              <img
                src={imageUrl(settings.logo)}
                alt={siteName}
                className="ksp-logo__img"
              />
            )}
            <div className="ksp-logo__wordmark">
              <span className="ksp-logo__name">{siteName}</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="ksp-nav" aria-label="Main navigation">
            <Link to="/" className={`ksp-nav__link${isActive('/') ? ' ksp-nav__link--active' : ''}`}>Home</Link>
            <Link to="/categories" className={`ksp-nav__link${isActive('/categories') || isActive('/products') ? ' ksp-nav__link--active' : ''}`}>Products</Link>
            <Link to="/#our-story" onClick={handleStoryClick} className="ksp-nav__link">About us</Link>
            <Link to="/contact" className={`ksp-nav__link${isActive('/contact') ? ' ksp-nav__link--active' : ''}`}>Contact</Link>
          </nav>

          {/* ── Desktop Actions ── */}
          <div className="ksp-header__actions">
            <button
              type="button"
              className="ksp-icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={18} />
            </button>
            {settings?.contactPhone && (
              <a
                href={`tel:${settings.contactPhone}`}
                className="ksp-icon-btn"
                aria-label="Call us"
              >
                <Phone size={18} />
              </a>
            )}
          </div>

          {/* ── Mobile Burger ── */}
          <button
            type="button"
            className="ksp-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Desktop Search Bar (slide-down) ── */}
        {searchOpen && (
          <div className="ksp-search-bar">
            <form onSubmit={onSearch} className="ksp-search-bar__form container">
              <Search size={16} className="ksp-search-bar__icon" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={handleInputChange}
                placeholder="Search for sweets, gifts, occasions…"
                className="ksp-search-bar__input"
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ksp-search-bar__clear"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <button type="submit" className="ksp-search-bar__submit btn-primary">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── Mobile Menu Drawer ── */}
      {menuOpen && (
        <div className="ksp-mobile-menu" aria-label="Mobile navigation">
          <nav>
            <Link to="/" className={`ksp-mobile-menu__link${isActive('/') ? ' ksp-mobile-menu__link--active' : ''}`} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/categories" className={`ksp-mobile-menu__link${isActive('/categories') || isActive('/products') ? ' ksp-mobile-menu__link--active' : ''}`} onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            <Link to="/#our-story" onClick={handleStoryClick} className="ksp-mobile-menu__link">
              About us
            </Link>
            <Link to="/contact" className={`ksp-mobile-menu__link${isActive('/contact') ? ' ksp-mobile-menu__link--active' : ''}`} onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </nav>
          {/* Mobile search */}
          <form onSubmit={(e) => { onSearch(e); setMenuOpen(false); }} className="ksp-mobile-menu__search">
            <Search size={15} />
            <input
              value={query}
              onChange={handleInputChange}
              placeholder="Search sweets…"
              aria-label="Search"
            />
            {query && (
              <button type="button" onClick={handleClear} aria-label="Clear">
                <X size={14} />
              </button>
            )}
          </form>
          {settings?.contactPhone && (
            <a href={`tel:${settings.contactPhone}`} className="ksp-mobile-menu__phone">
              <Phone size={14} /> {settings.contactPhone}
            </a>
          )}
        </div>
      )}

      <style>{`
        /* ── Header Shell ── */
        .ksp-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--surface-container-lowest);
          border-bottom: 1px solid var(--outline-variant);
          transition: box-shadow 0.3s ease;
        }
        .ksp-header--scrolled {
          box-shadow: var(--shadow-sm);
        }

        .ksp-header__inner {
          display: flex;
          align-items: center;
          height: 68px;
          gap: 20px;
        }

        /* ── Logo ── */
        /* ── Corrected Logo Styling (Full Width) ── */
.ksp-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}

.ksp-logo__img {
  height: 40px;
  width: auto; /* Crucial: This allows the width to scale proportionally */
  object-fit: contain;
  border-radius: 0;
  transition: transform 0.3s ease;
}

.ksp-logo:hover .ksp-logo__img {
  transform: scale(1.02); /* Gentle hover effect */
}

        .ksp-logo__wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .ksp-logo__name {
          font-family: var(--font-serif);
          font-size: 21px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        /* ── Desktop Nav ── */
        .ksp-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 auto;
        }
        .ksp-nav__link {
          font-family: var(--font-sans);
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--on-surface-variant);
          padding: 8px 14px;
          border-radius: 4px;
          position: relative;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .ksp-nav__link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 18px;
          height: 1.5px;
          background: var(--primary);
          transition: transform 0.25s ease;
        }
        .ksp-nav__link:hover {
          color: var(--on-surface);
        }
        .ksp-nav__link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        .ksp-nav__link--active {
          color: var(--primary);
          font-weight: 600;
        }
        .ksp-nav__link--active::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* ── Desktop Actions ── */
        .ksp-header__actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .ksp-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--outline-variant);
          background: transparent;
          color: var(--on-surface-variant);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          text-decoration: none;
        }
        .ksp-icon-btn:hover {
          background: var(--surface-container-low);
          border-color: var(--outline);
          color: var(--primary);
        }

        /* ── Hamburger (mobile only) ── */
        .ksp-burger {
          display: none;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: var(--on-surface);
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* ── Search Bar (slide-down) ── */
        .ksp-search-bar {
          background: var(--surface-container-lowest);
          border-top: 1px solid var(--outline-variant);
          padding: 12px 0;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ksp-search-bar__form {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 640px;
        }
        .ksp-search-bar__icon {
          color: var(--on-surface-variant);
          flex-shrink: 0;
        }
        .ksp-search-bar__input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--on-surface);
          font-family: var(--font-sans);
          font-size: 15px;
          min-width: 0;
        }
        .ksp-search-bar__input::placeholder {
          color: var(--on-surface-variant);
        }
        .ksp-search-bar__clear {
          background: none;
          border: none;
          color: var(--on-surface-variant);
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .ksp-search-bar__submit {
          padding: 8px 20px;
          font-size: 11px;
        }

        /* ── Mobile Menu ── */
        .ksp-mobile-menu {
          display: none;
          flex-direction: column;
          background: var(--surface-container-lowest);
          padding: 8px 0 20px;
          border-bottom: 1px solid var(--outline-variant);
          position: sticky;
          top: 68px;
          z-index: 99;
          box-shadow: var(--shadow-md);
        }
        .ksp-mobile-menu__link {
          display: block;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--on-surface-variant);
          padding: 13px 24px;
          border-bottom: 1px solid var(--outline-variant);
          transition: color 0.15s ease, background 0.15s ease;
        }
        .ksp-mobile-menu__link:hover,
        .ksp-mobile-menu__link--active {
          color: var(--primary);
          background: var(--surface-container-low);
        }
        .ksp-mobile-menu__search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 14px 20px 0;
          background: var(--surface-container-low);
          border: 1px solid var(--outline-variant);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          color: var(--on-surface-variant);
        }
        .ksp-mobile-menu__search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--on-surface);
          font-family: var(--font-sans);
          font-size: 14px;
          min-width: 0;
        }
        .ksp-mobile-menu__search input::placeholder {
          color: var(--on-surface-variant);
        }
        .ksp-mobile-menu__search button {
          background: none;
          border: none;
          color: var(--on-surface-variant);
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .ksp-mobile-menu__phone {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 20px 0;
          font-size: 13px;
          color: var(--primary);
        }

        /* ── Responsive ── */
        @media (max-width: 820px) {
          .ksp-nav { display: none; }
          .ksp-header__actions { display: none; }
          .ksp-burger { display: flex; }
          .ksp-mobile-menu { display: flex; }
        }

        @media (max-width: 480px) {
          .ksp-header__inner { height: 58px; }
          .ksp-logo__name { font-size: 17px; }
          .ksp-logo__sub { font-size: 8px; }
          .ksp-mobile-menu { top: 58px; }
        }
      `}</style>
    </>
  );
}
