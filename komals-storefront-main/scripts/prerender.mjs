import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:8083';
const SITE_URL = 'https://komalssweetpalace.in';
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const STATIC_ROUTES = [
  '/',
  '/offers',
  '/categories',
  '/products',
  '/gallery',
  '/contact',
  '/terms-and-conditions',
  '/privacy-policy',
];

const SITEMAP_PRIORITY = {
  '/': '1.0',
  '/products': '0.9',
  '/categories': '0.8',
  '/offers': '0.7',
  '/contact': '0.6',
  '/gallery': '0.6',
  '/terms-and-conditions': '0.3',
  '/privacy-policy': '0.3',
};

async function fetchJsonWithRetry(url, { retries = 3, baseDelayMs = 2000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt;
        console.warn(`[prerender] fetch failed for ${url} (${err.message}); retrying in ${delay}ms (${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

/** Fetches every category and pages through every product (size=100 per the backend's cap). */
async function discoverRoutes() {
  console.log('[prerender] Discovering categories from /store/categories...');
  const categories = await fetchJsonWithRetry(`${API_BASE}/store/categories`);

  console.log('[prerender] Discovering products from /store/products (size=100, paginated)...');
  const products = [];
  let page = 0;
  let totalPages = 1;
  do {
    const res = await fetchJsonWithRetry(`${API_BASE}/store/products?page=${page}&size=100`);
    const content = Array.isArray(res.content) ? res.content : (Array.isArray(res) ? res : []);
    products.push(...content);
    totalPages = res.totalPages ?? 1;
    page += 1;
  } while (page < totalPages);

  const categoryRoutes = categories.filter((c) => c.slug).map((c) => `/categories/${c.slug}`);
  const productRoutes = products
    .filter((p) => p.slug || p.id)
    .map((p) => `/products/${encodeURIComponent(p.slug || p.id)}`);

  return {
    routes: [...STATIC_ROUTES, ...categoryRoutes, ...productRoutes],
    categoryCount: categories.length,
    productCount: products.length,
  };
}

function routeToFilePath(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  const clean = route.replace(/^\/+|\/+$/g, '');
  return path.join(DIST_DIR, clean, 'index.html');
}

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
      shell: true,
    });
    let ready = false;
    const onData = (data) => {
      const text = data.toString();
      process.stdout.write(`[vite preview] ${text}`);
      if (!ready && /Local:/.test(text)) {
        ready = true;
        resolve(proc);
      }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (!ready) reject(new Error(`vite preview exited early (code ${code})`));
    });
    setTimeout(() => {
      if (!ready) reject(new Error('vite preview did not start within 15s'));
    }, 15000);
  });
}

async function capturePage(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`${PREVIEW_URL}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    try {
      await page.waitForFunction(
        () => document.body?.dataset?.ssrReady === 'true',
        { timeout: 8000 },
      );
    } catch {
      console.warn(`[prerender] ssrReady flag never set for ${route} within timeout; capturing current DOM state anyway.`);
    }
    return await page.content();
  } finally {
    await page.close();
  }
}

function buildSitemap(routes) {
  const urls = routes.map((route) => {
    const priority = SITEMAP_PRIORITY[route]
      ?? (route.startsWith('/products/') || route.startsWith('/categories/') ? '0.8' : '0.5');
    const loc = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}/`;
    return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

async function main() {
  let discovery;
  try {
    discovery = await discoverRoutes();
  } catch (err) {
    console.error('[prerender] FATAL: route discovery failed — refusing to deploy an incomplete catalog.');
    console.error(err);
    process.exit(1);
  }

  const { routes, categoryCount, productCount } = discovery;
  console.log(`[prerender] Discovered ${categoryCount} categories, ${productCount} products, ${routes.length} total routes.`);

  const previewProc = await startPreviewServer();
  const browser = await puppeteer.launch({ headless: 'new' });

  const failures = [];
  try {
    for (const route of routes) {
      try {
        const html = await capturePage(browser, route);
        const filePath = routeToFilePath(route);
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, html, 'utf8');
        console.log(`[prerender] wrote ${route} -> ${path.relative(DIST_DIR, filePath)}`);
      } catch (err) {
        console.error(`[prerender] FAILED to capture ${route}:`, err.message);
        failures.push(route);
      }
    }
  } finally {
    await browser.close();
    previewProc.kill();
  }

  if (failures.length > 0) {
    console.error(`[prerender] FATAL: ${failures.length} route(s) failed to capture:`, failures);
    process.exit(1);
  }

  const sitemap = buildSitemap(routes);
  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`[prerender] sitemap.xml written with ${routes.length} URLs.`);
  console.log('[prerender] Done.');
}

main().catch((err) => {
  console.error('[prerender] FATAL: unhandled error:', err);
  process.exit(1);
});
