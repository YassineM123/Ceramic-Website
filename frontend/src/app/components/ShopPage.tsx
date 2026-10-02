import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List, Heart, ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../data/products';
import type { StorefrontCategory } from '../services/storefrontApi';

const sortOptions = ['Sélection', 'Prix croissant', 'Prix décroissant', 'Nouveautés', 'Meilleures ventes'];
const priceRanges = ['Tous les prix', 'Moins de 50 TND', '50 TND - 100 TND', '100 TND - 200 TND', 'Plus de 200 TND'];

const pageSize = 9;

function initialQueryValue(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return new URLSearchParams(window.location.search).get(name) || fallback;
}

interface ShopPageProps {
  products: Product[];
  categories: StorefrontCategory[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export function ShopPage({ products, categories, onAddToCart, onQuickView, onViewDetails }: ShopPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(() => initialQueryValue('category', 'Tous'));
  const [selectedPriceRange, setSelectedPriceRange] = useState(() => initialQueryValue('price', 'Tous les prix'));
  const [sortBy, setSortBy] = useState(() => initialQueryValue('sort', sortOptions[0]));
  const [searchTerm, setSearchTerm] = useState(() => initialQueryValue('search', ''));
  const [page, setPage] = useState(() => Math.max(1, Number(initialQueryValue('page', '1')) || 1));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Array<Product['id']>>([]);
  const productsRef = useRef<HTMLDivElement | null>(null);
  const categoryOptions = useMemo(
    () => ['Tous', ...Array.from(new Set([...(categories || []).map((category) => category.name), ...products.map((product) => product.category)]))],
    [categories, products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const inPriceRange = (product: Product) => {
      if (selectedPriceRange === 'Moins de 50 TND') return product.price < 50;
      if (selectedPriceRange === '50 TND - 100 TND') return product.price >= 50 && product.price <= 100;
      if (selectedPriceRange === '100 TND - 200 TND') return product.price > 100 && product.price <= 200;
      if (selectedPriceRange === 'Plus de 200 TND') return product.price > 200;
      return true;
    };

    return products
      .filter((product) => selectedCategory === 'Tous' || product.category === selectedCategory)
      .filter(inPriceRange)
      .filter((product) => {
        if (!normalizedSearch) return true;
        return `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortBy === 'Prix croissant') return a.price - b.price;
        if (sortBy === 'Prix décroissant') return b.price - a.price;
        if (sortBy === 'Nouveautés') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
        if (sortBy === 'Meilleures ventes') return Number(b.badge?.includes('Coup de coeur')) - Number(a.badge?.includes('Coup de coeur'));
        return String(a.id).localeCompare(String(b.id));
      });
  }, [products, searchTerm, selectedCategory, selectedPriceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (selectedCategory !== 'Tous') params.set('category', selectedCategory);
    if (selectedPriceRange !== 'Tous les prix') params.set('price', selectedPriceRange);
    if (sortBy !== sortOptions[0]) params.set('sort', sortBy);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    const next = params.toString() ? `/shop?${params.toString()}` : '/shop';
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState({}, '', next);
    }
  }, [page, selectedCategory, selectedPriceRange, sortBy, searchTerm]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(params.get('category') || 'Tous');
      setSelectedPriceRange(params.get('price') || 'Tous les prix');
      setSortBy(params.get('sort') || sortOptions[0]);
      setSearchTerm(params.get('search') || '');
      setPage(Math.max(1, Number(params.get('page') || '1') || 1));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const resetToFirstPage = () => setPage(1);

  const toggleFavorite = (id: Product['id']) => {
    setFavorites((prev) =>
      prev.some((favoriteId) => String(favoriteId) === String(id))
        ? prev.filter((favoriteId) => String(favoriteId) !== String(id))
        : [...prev, id]
    );
  };

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-serif text-[#17324D] mb-4">Recherche</h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E6F73]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetToFirstPage();
            }}
            placeholder="Rechercher une pièce..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white border-2 border-transparent focus:border-[#075D9A] outline-none transition-colors duration-300"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-serif text-[#17324D] mb-4">Catégories</h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                resetToFirstPage();
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#075D9A] text-white'
                  : 'bg-white text-[#17324D] hover:bg-[#E9D8BE]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-serif text-[#17324D] mb-4">Budget</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={selectedPriceRange === range}
                onChange={() => {
                  setSelectedPriceRange(range);
                  resetToFirstPage();
                }}
                className="w-5 h-5 accent-[#075D9A]"
              />
              <span className="text-[#17324D] group-hover:text-[#075D9A] transition-colors duration-300">
                {range}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-2xl p-6 text-white">
        <h3 className="text-xl font-serif mb-2">Nouveautés</h3>
        <p className="text-white/90 text-sm mb-4">
          Découvrez les dernières pièces façonnées pour la maison tunisienne.
        </p>
        <button
          onClick={() => {
            setSortBy('Nouveautés');
            setSelectedCategory('Tous');
            setSearchTerm('');
            setSelectedPriceRange('Tous les prix');
            setPage(1);
            setShowFilters(false);
            productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="bg-white text-[#075D9A] px-6 py-2 rounded-full hover:bg-[#F8FBFA] transition-colors duration-300 text-sm font-medium"
        >
          Voir la collection
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FBFA] pt-20">
      <div className="bg-gradient-to-r from-[#E9D8BE] to-[#F8FBFA] py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl lg:text-6xl font-serif text-[#17324D]">
              Boutique céramique
              <br />
              متجر الخزف
            </h1>
            <p className="text-lg text-[#5E6F73] max-w-2xl mx-auto">
              Céramique artisanale, vaisselle, décoration maison et cadeaux avec livraison partout en Tunisie.
              <br />
              خزف يدوي، أواني، ديكور وهدايا مع توصيل لكل تونس.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#F8FBFA] rounded-full hover:bg-[#E9D8BE] transition-colors duration-300"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filtres</span>
                </button>
                <span className="text-[#5E6F73]">{filteredProducts.length} produits</span>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    resetToFirstPage();
                  }}
                  className="px-4 py-2 rounded-full bg-[#F8FBFA] border-none outline-none focus:bg-[#E9D8BE] transition-colors duration-300 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-[#075D9A] text-white'
                        : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
                    }`}
                    aria-label="Vue grille"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                      viewMode === 'list'
                        ? 'bg-[#075D9A] text-white'
                        : 'bg-[#F8FBFA] text-[#17324D] hover:bg-[#E9D8BE]'
                    }`}
                    aria-label="Vue liste"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="lg:hidden bg-[#EAF3F2] rounded-2xl p-5 mb-8 shadow-sm">
                {filterPanel}
              </div>
            )}

            <div ref={productsRef} />

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <h2 className="text-2xl font-serif text-[#17324D] mb-3">Aucun produit trouvé</h2>
                <p className="text-[#5E6F73] mb-6">Essayez une autre recherche, catégorie ou fourchette de prix.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tous');
                    setSelectedPriceRange('Tous les prix');
                    setPage(1);
                  }}
                  className="bg-[#075D9A] text-white px-8 py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'space-y-6'
              }>
                {visibleProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onViewDetails?.(product)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onViewDetails?.(product);
                        }
                      }}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075D9A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F8FBFA] ${
                      viewMode === 'list' ? 'sm:flex sm:flex-row' : ''
                    }`}>
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'sm:w-64 sm:flex-shrink-0 aspect-square' : 'aspect-square'
                      }`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {product.badge && (
                          <div className="absolute top-4 left-4 bg-[#075D9A] text-white px-3 py-1 rounded-full text-xs">
                            {product.badge}
                          </div>
                        )}

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300"
                          aria-label={`Ajouter aux favoris ${product.name}`}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors duration-300 ${
                              favorites.some((favoriteId) => String(favoriteId) === String(product.id))
                                ? 'fill-[#075D9A] text-[#075D9A]'
                                : 'text-[#17324D]'
                            }`}
                          />
                        </button>

                        {viewMode === 'grid' && (
                          <div className="absolute inset-x-0 bottom-0 p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onAddToCart(product);
                              }}
                              className="flex-1 bg-[#075D9A] text-white py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span className="text-sm">Ajouter</span>
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onQuickView(product);
                              }}
                              className="w-12 h-12 bg-white text-[#17324D] rounded-full hover:bg-[#E9D8BE] transition-colors duration-300 flex items-center justify-center"
                              aria-label={`Aperçu rapide ${product.name}`}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : 'space-y-2'}`}>
                        <div>
                          <h3 className="font-serif text-lg text-[#17324D] group-hover:text-[#075D9A] transition-colors duration-300 mb-2">
                            {product.name}
                          </h3>
                          <div className="text-sm text-[#5E6F73] mb-2">{product.category}</div>
                          {viewMode === 'list' && (
                            <p className="text-sm text-[#5E6F73] leading-relaxed mb-4">{product.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-serif text-[#075D9A]">{product.price} TND</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 fill-[#B86F3B]" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {viewMode === 'list' && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onAddToCart(product);
                              }}
                              className="flex-1 bg-[#075D9A] text-white py-3 rounded-full hover:bg-[#B86F3B] transition-colors duration-300"
                            >
                              Ajouter au panier
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onQuickView(product);
                              }}
                              className="px-6 border-2 border-[#075D9A] text-[#075D9A] rounded-full hover:bg-[#075D9A] hover:text-white transition-colors duration-300"
                            >
                              Aperçu
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-[#E9D8BE] transition-colors duration-300 disabled:opacity-40"
                aria-label="Page precedente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    pageNumber === currentPage ? 'bg-[#075D9A] text-white' : 'bg-white text-[#17324D] hover:bg-[#E9D8BE]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-[#E9D8BE] transition-colors duration-300 disabled:opacity-40"
                aria-label="Page suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-[#E9D8BE] transition-colors duration-300" aria-label="Page précédente">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    page === 1 ? 'bg-[#075D9A] text-white' : 'bg-white text-[#17324D] hover:bg-[#E9D8BE]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-[#E9D8BE] transition-colors duration-300" aria-label="Page suivante">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

