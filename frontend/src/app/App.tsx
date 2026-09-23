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

type Page = 'home' | 'shop' | 'product' | 'about' | 'contact' | 'checkout';

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

  useEffect(() => {
    setSelectedProduct((current) =>
      current && products.some((item) => String(item.id) === String(current.id)) ? current : activeFeaturedProduct || null
    );
  }, [activeFeaturedProduct, products]);

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

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('checkout');
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate('product');
  };

  const handleOpenFeaturedProduct = (productId: string | number) => {
    const product = products.find((item) => String(item.id) === String(productId)) ?? activeFeaturedProduct;
    if (product) handleViewProduct(product);
  };

  const submitOrder = (payload: PublicOrderPayload) => createPublicOrder(payload);

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
              onOrderComplete={() => setCartItems([])}
              onContinueShopping={() => navigate('shop')}
            />
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
          setSelectedProduct(product);
          navigate('product');
        }}
      />

      <ScrollToTop />
    </div>
  );
}
