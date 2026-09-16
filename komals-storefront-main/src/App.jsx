import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloatButton from './components/WhatsAppFloatButton.jsx';
import ScrollProgressBar from './components/animations/ScrollProgressBar.jsx';
import ScrollToTopButton from './components/animations/ScrollToTopButton.jsx';
import SmoothScrollProvider from './lib/SmoothScrollProvider.jsx';
import Home from './pages/Home.jsx';
import Offers from './pages/Offers.jsx';
import Categories from './pages/Categories.jsx';
import CategoryProducts from './pages/CategoryProducts.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import SearchResults from './pages/SearchResults.jsx';
import Contact from './pages/Contact.jsx';
import Terms from './pages/Terms.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import { useTrackVisit } from './lib/useTrackVisit.js';
import Seo from './components/Seo.jsx';

export default function App() {
  useTrackVisit();

  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Seo description="Komal's Sweet Palace offers traditional Mangaluru sweets, halwas, chakkuli and savouries made with authentic recipes." />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<CategoryProducts />} />
            <Route path="/categories/:slug" element={<CategoryProducts />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppFloatButton />
        <ScrollToTopButton />
      </div>
    </SmoothScrollProvider>
  );
}
