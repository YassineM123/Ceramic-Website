import { ShoppingBag, Search, Menu, Heart, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

type Page = 'home' | 'shop' | 'product' | 'about' | 'contact' | 'checkout';

interface NavigationProps {
  onCartClick: () => void;
  cartCount: number;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Navigation({ onCartClick, cartCount, currentPage, onPageChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const adminDashboardUrl =
    import.meta.env.VITE_ADMIN_DASHBOARD_URL ||
    (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:5174/admin/login'
      : '/admin/login');

  const navigate = (page: Page) => {
    onPageChange(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{ label: string; page: Page }> = [
    { label: 'Boutique', page: 'shop' },
    { label: 'Collections', page: 'home' },
    { label: 'Notre histoire', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  return (
    <nav className="fixed top-10 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#17324D]/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button
              onClick={() => navigate('home')}
              className="text-2xl lg:text-3xl font-serif text-[#17324D] tracking-tight"
            >
              Le Monde Céramique
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.page)}
                className={`transition-colors duration-300 ${
                  currentPage === item.page ? 'text-[#075D9A]' : 'text-[#17324D] hover:text-[#075D9A]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('shop')}
              className="text-[#17324D] hover:text-[#075D9A] transition-colors duration-300"
              aria-label="Rechercher des produits"
            >
              <Search className="w-5 h-5" />
            </button>
            <a
              href={adminDashboardUrl}
              className="text-[#17324D] hover:text-[#075D9A] transition-colors duration-300"
              aria-label="Ouvrir le tableau de bord admin"
              title="Admin dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </a>
            <button className="text-[#17324D] hover:text-[#075D9A] transition-colors duration-300" aria-label="Favoris">
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={onCartClick}
              className="relative text-[#17324D] hover:text-[#075D9A] transition-colors duration-300"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#075D9A] text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-[#17324D] hover:text-[#075D9A] transition-colors duration-300"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-[#17324D]/10">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.page)}
                  className={`text-left transition-colors duration-300 ${
                    currentPage === item.page ? 'text-[#075D9A]' : 'text-[#17324D] hover:text-[#075D9A]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href={adminDashboardUrl}
                className="text-left text-[#17324D] hover:text-[#075D9A] transition-colors duration-300"
              >
                Admin dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
