import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../components/animations/Reveal.jsx';
import Seo, { siteSchema } from '../components/Seo.jsx';
import ContactDetails from '../components/ContactDetails.jsx';
function OfferCard({ offer }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        background: offer.image ? 'transparent' : 'var(--primary)',
      }}
    >
      {offer.image && (
        <motion.img
          src={imageUrl(offer.image)}
          alt={offer.title || ''}
          draggable={false}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 4.5, ease: "easeOut" }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {(!offer.image || offer.showText) && (
        <div style={{
          position: 'absolute', inset: 0,
          background: offer.image ? 'linear-gradient(to top, rgba(26,20,22,0.85) 0%, transparent 55%)' : 'var(--primary)',
          zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28,
        }}>
          {offer.badge && <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ display: 'inline-block', marginBottom: 10, alignSelf: 'flex-start', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2 }}>{offer.badge}</motion.span>}
          {offer.title && <motion.h3 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{offer.title}</motion.h3>}
          {offer.description && <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>{offer.description}</motion.p>}
        </div>
      )}
    </motion.div>
  );
}

function OfferCarousel({ offers }) {
  const [index, setIndex] = useState(0);
  const hoverRef = useRef(false);
  const dragRef = useRef(null);
  const rootRef = useRef(null);
  const timerRef = useRef(null);
  function scheduleAutoplay() {
    clearTimeout(timerRef.current);
    if (offers.length < 2) return;
    timerRef.current = setTimeout(() => { if (!hoverRef.current) setIndex((i) => (i + 1) % offers.length); scheduleAutoplay(); }, 4500);
  }
  useEffect(() => { scheduleAutoplay(); return () => clearTimeout(timerRef.current); }, [offers.length]);
  function goPrev() { setIndex((i) => (i - 1 + offers.length) % offers.length); }
  function goNext() { setIndex((i) => (i + 1) % offers.length); }
  function endDrag(x) {
    const startX = dragRef.current; dragRef.current = null; hoverRef.current = false; scheduleAutoplay();
    if (startX == null || offers.length < 2) return;
    const delta = x - startX;
    if (delta > 40) goPrev(); else if (delta < -40) goNext();
  }
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    let startX = null, startY = null, axis = null;
    function onStart(e) { const t = e.touches[0]; startX = t.clientX; startY = t.clientY; axis = null; dragRef.current = startX; hoverRef.current = true; }
    function onMove(e) { if (startX == null) return; const t = e.touches[0]; const dx = t.clientX - startX, dy = t.clientY - startY; if (axis == null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; } if (axis === 'x') e.preventDefault(); }
    function onEnd(e) { if (axis === 'x') endDrag(e.changedTouches[0].clientX); else { dragRef.current = null; hoverRef.current = false; scheduleAutoplay(); } startX = null; startY = null; axis = null; }
    el.addEventListener('touchstart', onStart, { passive: true }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onEnd); el.addEventListener('touchcancel', onEnd);
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); el.removeEventListener('touchcancel', onEnd); };
  }, [offers.length]);
  function onMouseDown(e) { dragRef.current = e.clientX; hoverRef.current = true; const onMove2 = (ev) => ev.preventDefault(); const onUp = (ev) => { endDrag(ev.clientX); window.removeEventListener('mousemove', onMove2); window.removeEventListener('mouseup', onUp); }; window.addEventListener('mousemove', onMove2); window.addEventListener('mouseup', onUp); }
  return (
    <div ref={rootRef} onMouseDown={onMouseDown} style={{ cursor: offers.length > 1 ? 'grab' : 'default', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <AnimatePresence>
          {offers.length > 0 && (
            <OfferCard key={offers[index].id} offer={offers[index]} />
          )}
        </AnimatePresence>
      </div>
      {offers.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {offers.map((o, i) => (
            <motion.button key={o.id} type="button" aria-label={`Show offer ${i + 1}`} onClick={() => { setIndex(i); scheduleAutoplay(); }}
              animate={{
                width: i === index ? 24 : 8,
                background: i === index ? 'var(--primary)' : 'var(--outline-variant)'
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: 8, borderRadius: 999, border: 'none', padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [offers, setOffers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sortBy] = useState('createdAt,desc');
  const [productsLoading, setProductsLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/store/offers').then((r) => setOffers(r.data)).catch(() => { });
    api.get('/store/settings').then((r) => setSettings(r.data)).catch(() => { });
  }, []);


  const loadFeaturedProducts = useCallback(() => {
    setProductsLoading(true);
    api.get('/store/products', { params: { size: 10, sort: sortBy } })
      .then((r) => {
        if (r.data && Array.isArray(r.data.content)) setFeaturedProducts(r.data.content);
        else if (Array.isArray(r.data)) setFeaturedProducts(r.data);
      })
      .catch(() => { }).finally(() => setProductsLoading(false));
  }, [sortBy]);

  useEffect(() => { loadFeaturedProducts(); }, [loadFeaturedProducts]);

  useEffect(() => {
    if (window.location.hash === '#our-story' || window.location.hash === '#about-us') {
      const timer = setTimeout(() => {
        const el = document.getElementById('about-us') || document.getElementById('our-story');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="home-page">
      <Seo title="Mangaluru Sweets, Halwas & Chakkuli" description={"Discover Komal's Sweet Palace for traditional Mangaluru sweets, halwas, chakkuli and savouries. Explore fresh, authentic favourites for every celebration."} schema={siteSchema} />
      {/* {offers.length > 0 && (
        <section aria-label="Special Offers" style={{ background: 'var(--primary)', paddingTop: '32px' }}>
          <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
            <OfferCarousel offers={offers} />
          </div>
        </section>
      )} */}

      <section
        aria-label={offers.length > 0 ? "Special Offers" : "Welcome"}
        style={{
          background: 'var(--background)',
          paddingTop: '32px',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          {offers.length > 0 ? (
            <OfferCarousel offers={offers} />
          ) : (
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              src="/komals-banner.png"
              alt="Komal's Sweet Palace"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: 'var(--radius)',
                objectFit: 'cover',
              }}
            />
          )}
        </div>
      </section>
      {/* <section className="hero-section" aria-label="Hero">
        <div className="hero-section__inner container">
          <div className="hero-section__content">
            <span className="section-eyebrow">Traditional in Taste &middot; Timeless in Every Bite</span>
            <h1 className="hero-section__heading">Crafted with<br /><em>Love &amp; Tradition</em></h1>
            <p className="hero-section__sub">At Komal&apos;s Sweet Palace, we bring you the finest Indian sweets, made with pure ingredients and generations of tradition.</p>
            <div className="hero-section__ctas">
              <Link to="/categories" className="btn-primary">Explore Sweets <ArrowRight size={14} /></Link>
              <Link to="/contact" className="btn-outline hero-section__cta-secondary">Visit Us</Link>
            </div>
          </div>
          <div className="hero-section__image-wrap">
            <div className="hero-section__image-frame">
              <img src={heroImage ? imageUrl(heroImage) : '/hero_sweets.jpg'} alt="Premium Indian sweets" className="hero-section__image" />
            </div>
            <div className="hero-deco-circle" />
          </div>
        </div>
        <div className="hero-section__gold-line" />
      </section> */}

      <section className="promise-strip" aria-label="Brand promises">
        <div className="container">
          <div className="promise-strip__inner">
            <span className="promise-item__text">Traditional &bull; Authentic &bull; Fresh &bull; Premium</span>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="section home-products" aria-label="Featured products">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Our Signature</span>
                <h2 className="section-heading">Our Sweet Picks</h2>
              </div>
              <Link to="/products" className="section-header__link">View all <ArrowRight size={14} /></Link>
            </div>
            {productsLoading ? (
              <div className="desktop-grid-mobile-scroll">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton product-skeleton__img" />
                    <div style={{ padding: '14px 16px' }}>
                      <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                className="desktop-grid-mobile-scroll"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {featuredProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    variants={{
                      hidden: { opacity: 0, y: 25 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </motion.div>
            )}
            <div className="prod-action-wrap"><Link to="/products" className="btn-outline">View All Products <ArrowRight size={14} /></Link></div>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section id="our-story" className="story-section" aria-label="Our story">
          <div id="about-us" />
          <div className="container">
            <div className="story-section__inner">

              <div className="story-section__text">
                <span className="section-eyebrow story-item-eyebrow">
                  {settings?.storyEyebrow ?? 'Our Story'}
                </span>
                <h2 className="story-section__heading story-item-heading">
                  {settings?.storyHeading != null ? (
                    settings.storyHeading.split(' ').map((word, i, arr) =>
                      i === arr.length - 1 ? <em key={i}>{word}</em> : `${word} `
                    )
                  ) : (
                    <>A Legacy of<br /><em>Sweet Moments</em></>
                  )}
                </h2>
                <p className="story-section__body story-item-body">
                  {settings?.storyBody ?? "Komal's Sweet Palace has been a part of your celebrations for generations. From our humble beginnings to today, we continue to craft sweets that bring people together — because every moment deserves something sweet."}
                </p>
              </div>

              <div className="story-section__deco story-item-image">
                {settings?.storyImage ? (
                  <img src={imageUrl(settings.storyImage)} alt="Our Story" style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 'var(--radius)' }} />
                ) : (
                  <svg viewBox="0 0 200 200" className="story-deco-svg" aria-hidden="true">
                    <circle cx="100" cy="100" r="96" fill="none" stroke="var(--primary)" strokeWidth="0.8" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="var(--primary)" strokeWidth="0.4" opacity="0.5" />
                    <path d="M100 10 L110 90 L190 100 L110 110 L100 190 L90 110 L10 100 L90 90 Z" fill="none" stroke="var(--primary)" strokeWidth="0.6" opacity="0.7" />
                  </svg>
                )}
              </div>

            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section" aria-labelledby="mangaluru-sweets-heading">
          <div className="container" style={{ maxWidth: 900 }}>
            <span className="section-eyebrow">A taste of coastal Karnataka</span>
            <h2 id="mangaluru-sweets-heading" className="section-heading">Traditional Mangaluru sweets and savouries</h2>
            <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8, maxWidth: 760 }}>
              Komal&apos;s Sweet Palace brings together the flavours people look for in Mangalore and Mangaluru: rich halwas, crisp chakkuli, festive sweets and everyday savouries. Browse our collection for treats to share at home, take to family gatherings or add to your festival table.
            </p>
            <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8, maxWidth: 760 }}>
              Whether you search for Mangaluru sweets, Mangalore halwa or chakkuli, our catalogue helps you find the products you love quickly. Each product page includes clear details and an enquiry option.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="contact" className="section home-contact" aria-label="Contact">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Get in Touch</span>
                <h2 className="section-heading">Visit or Call Us</h2>
              </div>
            </div>
            {settings && <ContactDetails settings={settings} />}
          </div>
        </section>
      </Reveal>

      {/* <section className="gifting-section" aria-label="Gifting">
        <div className="container">
          <div className="gifting-section__inner">
            <span className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>Perfect for Every</span>
            <h2 className="gifting-section__heading">Celebration</h2>
            <p className="gifting-section__sub">Weddings &middot; Festivals &middot; Gifting &middot; Special Moments</p>
            <Link to="/categories" className="btn-primary gifting-section__cta" style={{ borderColor: 'var(--gold)', color: 'var(--gold)', background: 'transparent' }}>
              Shop Gifting <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section> */}

      <style>{`
       .home-page { overflow-x: clip; }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }
        .section-header__link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--primary);
          white-space: nowrap; flex-shrink: 0; padding-bottom: 4px;
        }
        .section-header__link:hover { color: var(--primary-dark); }
        .prod-action-wrap { text-align: center; margin-top: 36px; }
        .hero-section { background: var(--primary); position: relative; overflow: hidden; min-height: 520px; display: flex; flex-direction: column; }
        .hero-section__inner { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding-top: 72px; padding-bottom: 72px; flex: 1; }
        .hero-section__content .section-eyebrow { color: var(--gold-light); opacity: 0.9; }
        .hero-section__heading { font-family: var(--font-serif); font-size: clamp(38px, 5.5vw, 68px); font-weight: 600; color: #fff; line-height: 1.05; margin: 14px 0 20px; }
        .hero-section__heading em { font-style: italic; color: var(--gold-light); }
        .hero-section__sub { font-size: 15px; color: rgba(255,255,255,0.78); line-height: 1.7; max-width: 400px; margin-bottom: 36px; }
        .hero-section__ctas { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .hero-section__cta-secondary { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.35); }
        .hero-section__cta-secondary:hover { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.6); }
        .hero-section__image-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .hero-section__image-frame { position: relative; width: 100%; max-width: 480px; aspect-ratio: 4/3; border-radius: 12px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.35); z-index: 2; }
        .hero-section__image { width: 100%; height: 100%; object-fit: cover; }
        .hero-deco-circle { position: absolute; width: 90%; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(201,168,76,0.2); z-index: 1; }
        .hero-section__gold-line { height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.4; }
        .promise-strip { background: var(--ivory); border-bottom: 1px solid var(--outline-variant); padding: 22px 0; }
        .promise-strip__inner { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
        .promise-item { display: flex; align-items: center; gap: 10px; padding: 8px 32px; }
        .promise-item__icon { color: var(--primary); flex-shrink: 0; }
        .promise-item__text { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--on-surface-variant); white-space: nowrap; }
        .promise-sep { width: 1px; height: 28px; background: var(--outline-variant); }
        .home-products { background: var(--surface); }
        .product-skeleton { background: var(--ivory); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--outline-variant); flex: 0 0 calc((100% - 60px) / 4); }
        .product-skeleton__img { width: 100%; aspect-ratio: 4/5; }
        
        .story-section { background: var(--surface); padding: 80px 0; border-top: 1px solid var(--outline-variant); border-bottom: 1px solid var(--outline-variant); }
        .story-section__inner { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 48px; }
        .story-section__text { display: flex; flex-direction: column; }
        .story-section__heading { font-family: var(--font-serif); font-size: clamp(32px, 4vw, 52px); font-weight: 600; line-height: 1.1; margin: 12px 0 20px; }
        .story-section__heading em { font-style: italic; color: var(--primary); }
        .story-section__body { font-size: 15px; color: var(--on-surface-variant); line-height: 1.8; max-width: 520px; margin-bottom: 32px; }
        .story-section__deco { width: 280px; flex-shrink: 0; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-md); background: #ffffff; border: 1px solid var(--outline-variant); }
        .story-section__deco img { width: 100%; height: auto; object-fit: contain; display: block; }
        .story-deco-svg { width: 100%; height: 100%; }

        .gifting-section { background: var(--primary); padding: 80px 0; }
        .gifting-section__inner { max-width: 600px; }
        .gifting-section__heading { font-family: var(--font-serif); font-size: clamp(42px, 6vw, 72px); font-weight: 600; color: #fff; line-height: 1; margin: 8px 0 16px; }
        .gifting-section__sub { font-size: 13px; color: rgba(255,255,255,0.65); letter-spacing: 0.06em; margin-bottom: 36px; }
        .offers-section { background: var(--surface); }

        /* Horizontal product rail at all widths */
        .desktop-grid-mobile-scroll {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 12px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .desktop-grid-mobile-scroll::-webkit-scrollbar { display: none; }
        .desktop-grid-mobile-scroll > div {
          flex: 0 0 calc((100% - 60px) / 4);
          scroll-snap-align: start;
        }

        .home-contact { background: var(--surface-container-lowest); border-top: 1px solid var(--outline-variant); }

        /* Hide prices on home page product cards */
        .home-products [class*="price"],
        .home-products .product-card__price {
          display: none !important;
        }

        @media (max-width: 900px) {
          .hero-section__inner { grid-template-columns: 1fr; gap: 36px; padding-top: 52px; padding-bottom: 52px; }
          .hero-section__image-wrap { display: none; }
          .desktop-grid-mobile-scroll > div { flex: 0 0 calc((100% - 40px) / 3); }
          
          /* Story section mobile reordering: Eyebrow -> Title -> Image -> Description */
          .story-section { padding: 40px 0; }
          .story-section__inner { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            text-align: center; 
            gap: 16px; 
          }
          .story-section__text { 
            display: contents; 
          }
          .story-item-eyebrow {
            order: 1; 
          }
          .story-item-heading {
            order: 2; 
            font-size: clamp(26px, 6vw, 36px);
            margin: 0;
          }
          .story-item-image {
            order: 3;
            width: 100%;
            max-width: 280px;
            margin: 4px 0;
            flex-shrink: 0;
          }
          .story-item-body {
            order: 4; 
            max-width: 100%;
            font-size: 14.5px;
            line-height: 1.7;
            margin: 0;
          }
        }

        @media (max-width: 640px) {
          .promise-sep { display: none; }
          .promise-item { padding: 8px 18px; }
          .hero-section__heading { font-size: 36px; }
          .hero-section__ctas { flex-direction: column; align-items: flex-start; }
          .gifting-section__heading { font-size: 42px; }
          .section-header { margin-bottom: 22px; }
          .prod-action-wrap { margin-top: 28px; }

          /* Mobile: single-card peeking swipe */
          .desktop-grid-mobile-scroll { gap: 16px; }
          .desktop-grid-mobile-scroll > div {
            flex: 0 0 72%;
            scroll-snap-align: center;
          }
        }
          

      `}</style>
    </div >
  );
}
