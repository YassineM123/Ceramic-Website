import { lazy, Suspense, useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { Navigation } from './components/Navigation';
import { FeaturedCollections } from './components/FeaturedCollections';
import { BestSellers } from './components/BestSellers';
import { Craftsmanship } from './components/Craftsmanship';
import { WhyChooseUs } from './components/WhyChooseUs';
import { InteriorGallery } from './components/InteriorGallery';
import { Testimonials } from './components/Testimonials';
import { InstagramShowcase } from './components/InstagramShowcase';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { QuickView } from './components/QuickView';
import { AnnouncementBar } from './components/AnnouncementBar';
import { ScrollToTop } from './components/ScrollToTop';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { CartItem, Product } from './data/products';
import { useStorefrontData } from './hooks/useStorefrontData';
import { createPublicOrder, PublicOrderPayload } from './services/storefrontApi';

const ShopPage = lazy(() => import('./components/ShopPage').then((module) => ({ default: module.ShopPage })));
const ProductDetailPage = lazy(() =>
  import('./components/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage }))
);
const AboutPage = lazy(() => import('./components/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./components/ContactPage').then((module) => ({ default: module.ContactPage })));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));

type Page = 'home' | 'shop' | 'product' | 'about' | 'contact' | 'checkout' | 'order-success' | 'not-found';

function productSlug(product: Product) {
  const slug = product.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'product'}-${product.id}`;
}

export default function App() {
  const { data, isLoading, error } = useStorefrontData();
  const products = data.products;
  const activeFeaturedProduct =
    products.find((item) => String(item.id) === String(data.content.homepage.featuredProductId)) ||
    products[2] ||
    products[0];
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(activeFeaturedProduct || null);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; total?: number } | null>(null);

  const routeToState = () => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return { page: 'home' as Page };
    if (path === '/shop') return { page: 'shop' as Page };
    if (path === '/about') return { page: 'about' as Page };
    if (path === '/contact') return { page: 'contact' as Page };
    if (path === '/checkout') return { page: 'checkout' as Page };
    if (path.startsWith('/order-success/')) {
      return { page: 'order-success' as Page, orderId: decodeURIComponent(path.split('/').filter(Boolean)[1] || '') };
    }
    if (path.startsWith('/product/')) {
      const slug = decodeURIComponent(path.split('/').filter(Boolean)[1] || '');
      const product = products.find((item) => productSlug(item) === slug || String(item.id) === slug || slug.endsWith(`-${item.id}`));
      return product ? { page: 'product' as Page, product } : { page: 'not-found' as Page };
    }
    return { page: 'not-found' as Page };
  };

  const applyRoute = () => {
    const route = routeToState();
    setCurrentPage(route.page);
    if (route.product) setSelectedProduct(route.product);
    if (route.orderId) setOrderSuccess((current) => ({ id: route.orderId || current?.id || '', total: current?.total }));
  };

  useEffect(() => {
    setSelectedProduct((current) =>
      current && products.some((item) => String(item.id) === String(current.id)) ? current : activeFeaturedProduct || null
    );
  }, [activeFeaturedProduct, products]);

  useEffect(() => {
    applyRoute();
    const handlePopState = () => applyRoute();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id));
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const pathForPage = (page: Page, product?: Product, orderId?: string) => {
    if (page === 'home') return '/';
    if (page === 'product' && product) return `/product/${encodeURIComponent(productSlug(product))}`;
    if (page === 'order-success') return `/order-success/${encodeURIComponent(orderId || orderSuccess?.id || '')}`;
    if (page === 'not-found') return '/404';
    return `/${page}`;
  };

  const navigate = (page: Page, options: { product?: Product; orderId?: string; total?: number } = {}) => {
    if (options.product) setSelectedProduct(options.product);
    if (page === 'order-success') setOrderSuccess({ id: options.orderId || '', total: options.total });
    setCurrentPage(page);
    window.history.pushState({}, '', pathForPage(page, options.product, options.orderId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('checkout');
  };

  const handleViewProduct = (product: Product) => {
    navigate('product', { product });
  };

  const handleOpenFeaturedProduct = (productId: string | number) => {
    const product = products.find((item) => String(item.id) === String(productId)) ?? activeFeaturedProduct;
    if (product) handleViewProduct(product);
  };

  const submitOrder = (payload: PublicOrderPayload) => createPublicOrder(payload);
  const handleOrderComplete = (order?: { id: string; total: number }) => {
    setCartItems([]);
    if (order?.id) {
      navigate('order-success', { orderId: order.id, total: order.total });
    }
  };

  const renderHome = () => (
    <>
      <Hero
        content={data.content.homepage}
        featuredProduct={activeFeaturedProduct}
        onShop={() => navigate('shop')}
        onStory={() => navigate('about')}
      />
      <FeaturedCollections
        content={data.content.homepage}
        collections={data.collections}
        onOpenProduct={handleOpenFeaturedProduct}
      />
      <BestSellers products={products.slice(0, 8)} onAddToCart={addToCart} onQuickView={setQuickViewProduct} onViewDetails={handleViewProduct} />
      <Craftsmanship />
      <WhyChooseUs />
      <InteriorGallery />
      <Testimonials reviews={data.reviews} />
      <InstagramShowcase />
      <Newsletter content={data.content.homepage} />
    </>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBFA] px-6 text-center">
        <div>
          <h1 className="mb-3 text-3xl font-serif text-[#17324D]">Boutique indisponible</h1>
          <p className="text-[#5E6F73]">{error}</p>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBFA] px-6 text-center">
        <div>
          <h1 className="mb-3 text-3xl font-serif text-[#17324D]">Aucun produit disponible</h1>
          <p className="text-[#5E6F73]">La boutique ne contient actuellement aucun produit actif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBFA]">
      <AnnouncementBar />
      <Navigation
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((count, item) => count + item.quantity, 0)}
        currentPage={currentPage}
        onPageChange={navigate}
      />

      {currentPage === 'home' && renderHome()}
      {currentPage !== 'home' && (
        <Suspense fallback={<LoadingSpinner />}>
          {currentPage === 'shop' && (
            <ShopPage
              products={products}
              categories={data.categories}
              onAddToCart={addToCart}
              onQuickView={setQuickViewProduct}
              onViewDetails={handleViewProduct}
            />
          )}
          {currentPage === 'product' && (
            selectedProduct ? (
              <ProductDetailPage
                product={selectedProduct}
                relatedProducts={products.filter((item) => String(item.id) !== String(selectedProduct.id)).slice(0, 4)}
                reviews={data.reviews}
                shippingZones={data.shippingZones}
                onAddToCart={addToCart}
                onCheckout={handleCheckout}
              />
            ) : null
          )}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'contact' && <ContactPage contact={data.content.contact} />}
          {currentPage === 'checkout' && (
            <CheckoutPage
              cartItems={cartItems}
              shippingZones={data.shippingZones}
              taxRates={data.taxRates}
              onSubmitOrder={submitOrder}
              onOrderComplete={handleOrderComplete}
              onContinueShopping={() => navigate('shop')}
            />
          )}
          {currentPage === 'order-success' && (
            <main className="min-h-screen bg-[#F8FBFA] pt-28 pb-16">
              <div className="max-w-3xl mx-auto px-6 text-center">
                <div className="bg-white rounded-3xl p-10 lg:p-14 shadow-xl">
                  <h1 className="text-4xl lg:text-5xl font-serif text-[#17324D] mb-4">Commande confirmee</h1>
                  <p className="text-[#5E6F73] text-lg leading-relaxed mb-8">
                    Merci pour votre commande. Reference commande: {orderSuccess?.id || 'confirmee'}
                    {typeof orderSuccess?.total === 'number' ? ` - Total confirme: ${orderSuccess.total} DT` : ''}
                  </p>
                  <button
                    onClick={() => navigate('shop')}
                    className="bg-[#075D9A] text-white px-10 py-4 rounded-full hover:bg-[#B86F3B] transition-colors duration-300"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </div>
            </main>
          )}
          {currentPage === 'not-found' && (
            <main className="min-h-screen bg-[#F8FBFA] pt-28 pb-16">
              <div className="max-w-3xl mx-auto px-6 text-center">
                <h1 className="text-4xl font-serif text-[#17324D] mb-3">Page introuvable</h1>
                <button onClick={() => navigate('home')} className="text-[#075D9A] underline">Retour a l'accueil</button>
              </div>
            </main>
          )}
        </Suspense>
      )}

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          setCartItems((prev) =>
            quantity === 0
              ? prev.filter((item) => item.id !== id)
              : prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity } : item))
          );
        }}
        onCheckout={handleCheckout}
      />

      <QuickView
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        onAddToCart={addToCart}
        onViewDetails={(product) => {
          navigate('product', { product });
        }}
      />

      <ScrollToTop />
    </div>
  );
}
