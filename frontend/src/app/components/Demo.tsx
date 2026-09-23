import { useState } from 'react';
import { X } from 'lucide-react';
import { ShopPage } from './ShopPage';
import { ProductDetailPage } from './ProductDetailPage';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';

type Page = 'home' | 'shop' | 'product' | 'about' | 'contact';

interface DemoProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Demo({ currentPage, onPageChange }: DemoProps) {
  const [showMenu, setShowMenu] = useState(true);

  return (
    <div className="relative">
      {/* Floating Navigation Menu */}
      {showMenu && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-4">
          <span className="text-sm text-[#5E6F73] font-medium">Voir page :</span>
          <button
            onClick={() => onPageChange('home')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              currentPage === 'home'
                ? 'bg-[#075D9A] text-white'
                : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => onPageChange('shop')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              currentPage === 'shop'
                ? 'bg-[#075D9A] text-white'
                : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
            }`}
          >
            Boutique
          </button>
          <button
            onClick={() => onPageChange('product')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              currentPage === 'product'
                ? 'bg-[#075D9A] text-white'
                : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
            }`}
          >
            Produit
          </button>
          <button
            onClick={() => onPageChange('about')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              currentPage === 'about'
                ? 'bg-[#075D9A] text-white'
                : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
            }`}
          >
            Histoire
          </button>
          <button
            onClick={() => onPageChange('contact')}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              currentPage === 'contact'
                ? 'bg-[#075D9A] text-white'
                : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setShowMenu(false)}
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F8FBFA] transition-colors duration-300"
          >
            <X className="w-5 h-5 text-[#5E6F73]" />
          </button>
        </div>
      )}

      {/* Show Menu Button (when hidden) */}
      {!showMenu && (
        <button
          onClick={() => setShowMenu(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#075D9A] text-white px-6 py-3 rounded-full shadow-2xl hover:bg-[#B86F3B] transition-colors duration-300"
        >
          Afficher la navigation
        </button>
      )}

      {/* Page Content */}
      <div>
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'product' && <ProductDetailPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
      </div>
    </div>
  );
}
