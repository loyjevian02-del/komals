import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ArrowRight, Gem, Clock, Leaf, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../components/animations/Reveal.jsx';
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
          background: offer.image ? 'linear-gradient(to top, rgba(74,13,24,0.85) 0%, transparent 55%)' : 'var(--primary)',
          zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28,
        }}>
          {offer.badge && <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ display: 'inline-block', marginBottom: 10, alignSelf: 'flex-start', background: 'var(--gold)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2 }}>{offer.badge}</motion.span>}
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
                background: i === index ? 'var(--gold)' : 'var(--outline-variant)'
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
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [totalElements, setTotalElements] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/store/offers').then((r) => setOffers(r.data)).catch(() => { });
    api.get('/store/categories').then((r) => setCategories(r.data)).catch(() => { });
    api.get('/store/settings').then((r) => setSettings(r.data)).catch(() => { });
  }, []);


  const loadFeaturedProducts = useCallback(() => {
    setProductsLoading(true);
    api.get('/store/products', { params: { size: 4, sort: sortBy } })
      .then((r) => {
        if (r.data && Array.isArray(r.data.content)) { setFeaturedProducts(r.data.content); setTotalElements(r.data.totalElements || r.data.content.length); }
        else if (Array.isArray(r.data)) { setFeaturedProducts(r.data); setTotalElements(r.data.length); }
      })
      .catch(() => { }).finally(() => setProductsLoading(false));
  }, [sortBy]);

  useEffect(() => { loadFeaturedProducts(); }, [loadFeaturedProducts]);

  const heroImage = offers.find(o => o.image)?.image;
  function handleStoryClick(e) {
    setMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('our-story');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  return (
    <div className="home-page">
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
            <div className="promise-item"><Gem size={20} className="promise-item__icon" /><span className="promise-item__text">Handcrafted Daily</span></div>
            <div className="promise-sep" />
            <div className="promise-item"><Star size={20} className="promise-item__icon" /><span className="promise-item__text">Authentic Recipes</span></div>
            <div className="promise-sep" />
            <div className="promise-item"><Leaf size={20} className="promise-item__icon" /><span className="promise-item__text">Pure Ingredients</span></div>
            <div className="promise-sep" />
            <div className="promise-item"><Clock size={20} className="promise-item__icon" /><span className="promise-item__text">Freshly Packed</span></div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <Reveal>
          <section className="section home-categories" aria-label="Sweet collection">
            <div className="container">
              <div className="section-header">
                <span className="section-eyebrow">Our Collection</span>
                <h2 className="section-heading">What Are You Craving Today?</h2>
                <div className="gold-divider" />
              </div>
              <motion.div
                className="cat-grid"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    variants={{
                      hidden: { opacity: 0, y: 25 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link to={`/categories/${cat.slug}`} className="cat-card" aria-label={cat.name}>
                      <div className="cat-card__img-wrap">
                        {cat.image ? <img src={imageUrl(cat.image)} alt={cat.name} className="cat-card__img" loading="lazy" /> : <div className="cat-card__placeholder"><span>{cat.name[0]}</span></div>}
                        <div className="cat-card__overlay" />
                      </div>
                      <div className="cat-card__body">
                        <span className="cat-card__name">{cat.name}</span>
                        <ArrowRight size={14} className="cat-card__arrow" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              <div className="cat-action-wrap"><Link to="/categories" className="btn-outline">View All Categories <ArrowRight size={14} /></Link></div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal>
        <section className="section home-products" aria-label="Featured products" style={{ background: 'var(--surface-container-lowest)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Our Signature</span>
              <h2 className="section-heading">Assortments Galore</h2>
              <div className="gold-divider" />
            </div>
            <div className="sort-bar">
              <span className="sort-bar__count">{totalElements > 0 ? `${totalElements} Handpicked Delicacies` : ''}</span>
              <div className="sort-bar__right">
                <label htmlFor="home-sort" className="sort-bar__label">Sort by</label>
                <select id="home-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  <option value="createdAt,desc">Newest First</option>
                  <option value="title,asc">Alphabetical (A-Z)</option>
                  {/* <option value="price,asc">Price: Low to High</option> */}
                  {/* <option value="price,desc">Price: High to Low</option> */}
                </select>
              </div>
            </div>
            {productsLoading ? (
              <div className="desktop-grid-mobile-scroll">
                {Array.from({ length: 4 }).map((_, i) => (
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
            <div className="prod-action-wrap"><Link to="/categories" className="btn-primary">Shop All Sweets <ArrowRight size={14} /></Link></div>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section id="our-story" className="story-section" aria-label="Our story">
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
                  <img src={imageUrl(settings.storyImage)} alt="Our Story" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                ) : (
                  <svg viewBox="0 0 200 200" className="story-deco-svg" aria-hidden="true">
                    <circle cx="100" cy="100" r="96" fill="none" stroke="var(--gold)" strokeWidth="0.8" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="var(--gold)" strokeWidth="0.4" opacity="0.5" />
                    <path d="M100 10 L110 90 L190 100 L110 110 L100 190 L90 110 L10 100 L90 90 Z" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.7" />
                  </svg>
                )}
              </div>

            </div>
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
        .section-header { text-align: center; margin-bottom: 48px; }
        .cat-action-wrap { text-align: center; margin-top: 44px; }
        .prod-action-wrap { text-align: center; margin-top: 48px; }
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
        .promise-item__icon { color: var(--gold); flex-shrink: 0; }
        .promise-item__text { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--on-surface-variant); white-space: nowrap; }
        .promise-sep { width: 1px; height: 28px; background: var(--outline-variant); }
        .home-categories { background: var(--surface); }
        .cat-grid { 
          display: flex; 
          flex-wrap: wrap; 
          justify-content: center; 
          gap: 24px; 
        }
        .cat-grid > div {
          width: 100%;
          max-width: 260px;
          min-width: 200px;
          flex: 1 1 220px;
        }
        .cat-card { display: flex; flex-direction: column; height: 100%; text-decoration: none; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--outline-variant); background: var(--ivory); transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        @media (hover: hover) and (pointer: fine) {
          .cat-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: var(--gold); }
          .cat-card:hover .cat-card__img { transform: scale(1.05); }
          .cat-card:hover .cat-card__arrow { opacity: 1; transform: translateX(0); }
        }
        .cat-card__img-wrap { position: relative; aspect-ratio: 4/3; background: var(--surface-container-low); overflow: hidden; }
        .cat-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .cat-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--primary-container); font-family: var(--font-serif); font-size: 48px; font-weight: 600; color: var(--primary); }
        .cat-card__overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(74,13,24,0.18) 0%, transparent 60%); }
        .cat-card__body { padding: 16px 18px; display: flex; align-items: center; gap: 8px; }
        .cat-card__name { font-family: var(--font-serif); font-size: 17px; font-weight: 600; color: var(--on-surface); flex: 1; }
        .cat-card__arrow { color: var(--primary); opacity: 0; transform: translateX(-4px); transition: opacity 0.25s ease, transform 0.25s ease; }
        .home-products { background: var(--surface-container-lowest); }
        .sort-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 12px; }
        .sort-bar__count { font-size: 13px; color: var(--on-surface-variant); font-weight: 500; }
        .sort-bar__right { display: flex; align-items: center; gap: 10px; }
        .sort-bar__label { font-size: 12px; color: var(--on-surface-variant); }
        .sort-select { padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid var(--outline-variant); background: var(--ivory); color: var(--on-surface); font-family: var(--font-sans); font-size: 13px; cursor: pointer; outline: none; }
        .product-skeleton { background: var(--ivory); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--outline-variant); }
        .product-skeleton__img { width: 100%; aspect-ratio: 4/5; }
        
        .story-section { background: var(--surface); padding: 80px 0; border-top: 1px solid var(--outline-variant); border-bottom: 1px solid var(--outline-variant); }
        .story-section__inner { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 48px; }
        .story-section__text { display: flex; flex-direction: column; }
        .story-section__heading { font-family: var(--font-serif); font-size: clamp(32px, 4vw, 52px); font-weight: 600; line-height: 1.1; margin: 12px 0 20px; }
        .story-section__heading em { font-style: italic; color: var(--primary); }
        .story-section__body { font-size: 15px; color: var(--on-surface-variant); line-height: 1.8; max-width: 520px; margin-bottom: 32px; }
        .story-section__deco { width: 280px; flex-shrink: 0; aspect-ratio: 4 / 3; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-md); background: #ffffff; border: 1px solid var(--outline-variant); }
        .story-section__deco img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .story-deco-svg { width: 100%; height: 100%; }

        .gifting-section { background: var(--primary); padding: 80px 0; }
        .gifting-section__inner { max-width: 600px; }
        .gifting-section__heading { font-family: var(--font-serif); font-size: clamp(42px, 6vw, 72px); font-weight: 600; color: #fff; line-height: 1; margin: 8px 0 16px; }
        .gifting-section__sub { font-size: 13px; color: rgba(255,255,255,0.65); letter-spacing: 0.06em; margin-bottom: 36px; }
        .offers-section { background: var(--surface); }

        /* Desktop: Exactly 4 columns in a clean grid */
        .desktop-grid-mobile-scroll {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* Hide prices on home page product cards */
        .home-products [class*="price"],
        .home-products .product-card__price {
          display: none !important;
        }

        @media (max-width: 900px) {
          .hero-section__inner { grid-template-columns: 1fr; gap: 36px; padding-top: 52px; padding-bottom: 52px; }
          .hero-section__image-wrap { display: none; }
          
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
            aspect-ratio: 4 / 3;
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
          .cat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .cat-grid > div { max-width: none; min-width: 0; }
          .hero-section__ctas { flex-direction: column; align-items: flex-start; }
          .gifting-section__heading { font-size: 42px; }
          .section-header { margin-bottom: 32px; }
          .cat-action-wrap { margin-top: 28px; }
          .prod-action-wrap { margin-top: 36px; }

          /* Mobile: Switch to single-card peeking horizontal swipe */
          .desktop-grid-mobile-scroll {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 12px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .desktop-grid-mobile-scroll::-webkit-scrollbar {
            display: none;
          }
          .desktop-grid-mobile-scroll > div {
            flex: 0 0 82% !important;
            scroll-snap-align: center;
          }
        }
          

      `}</style>
    </div >
  );
}
