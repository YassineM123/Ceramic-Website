import { useState } from 'react';
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, Star, Check, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { featuredProduct, type Product } from '../data/products';
import type { ShippingZone, StorefrontReview } from '../services/storefrontApi';

const reviews = [
  {
    id: 1,
    name: 'Inès Mejri',
    rating: 5,
    date: '15 mai 2026',
    text: 'Le vase est encore plus beau en vrai. Il donne une présence très élégante à mon salon.',
    verified: true,
  },
  {
    id: 2,
    name: 'Rania Gharbi',
    rating: 5,
    date: '10 mai 2026',
    text: 'Commande reçue à Sousse très bien emballée. La couleur de la terre cuite est superbe.',
    verified: true,
  },
  {
    id: 3,
    name: 'Mehdi Trabelsi',
    rating: 4,
    date: '5 mai 2026',
    text: 'Très belle qualité artisanale. Je recommande pour un cadeau de maison.',
    verified: true,
  },
];

const relatedProducts = [
  {
    id: 1,
    name: 'Assiette Artisanale | طبق خزفي يدوي',
    price: 49,
    image: 'https://images.unsplash.com/photo-1592493426177-7dd66e857e7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Bol Tradition | وعاء خزفي',
    price: 39,
    image: 'https://images.unsplash.com/photo-1495100497150-fe209c585f50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: 'Service à Café | طقم قهوة',
    price: 129,
    image: 'https://images.unsplash.com/photo-1630783098843-956335ee5275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    name: 'Plateau Artisanal | صينية خزفية',
    price: 99,
    image: 'https://images.unsplash.com/photo-1619400131077-bbdefafeae75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

interface ProductDetailPageProps {
  product?: Product;
  relatedProducts?: Product[];
  reviews?: StorefrontReview[];
  shippingZones?: ShippingZone[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onCheckout: () => void;
}

export function ProductDetailPage({
  product = featuredProduct,
  relatedProducts: liveRelatedProducts,
  reviews: liveReviews,
  shippingZones = [],
  onAddToCart,
  onCheckout,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const tabLabels = {
    description: 'Description',
    reviews: 'Avis',
    shipping: 'Livraison',
  };
  const visibleReviews = liveReviews?.length ? liveReviews : reviews;
  const visibleRelatedProducts = liveRelatedProducts?.length ? liveRelatedProducts : relatedProducts;
  const shippingZone = shippingZones[0];

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity);
    onCheckout();
  };

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-[#F8FBFA] pt-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#5E6F73] mb-8">
          <a href="#" className="hover:text-[#075D9A] transition-colors duration-300">Accueil</a>
          <span className="mx-2">/</span>
          <a href="#" className="hover:text-[#075D9A] transition-colors duration-300">Boutique</a>
          <span className="mx-2">/</span>
          <a href="#" className="hover:text-[#075D9A] transition-colors duration-300">Céramique</a>
          <span className="mx-2">/</span>
          <span className="text-[#17324D]">{product.name}</span>
        </div>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-white"
            >
              <img
                src={galleryImages[selectedImage] ?? galleryImages[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedImage === index
                      ? 'ring-4 ring-[#075D9A] scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  <img src={image} alt={`Vue produit ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#075D9A] text-white px-3 py-1 rounded-full text-xs">
                  {product.badge ?? product.category}
                </span>
                <span className="text-sm text-[#5E6F73]">Disponible</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif text-[#17324D] mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#B86F3B] text-[#B86F3B]" />
                  ))}
                </div>
                <span className="text-[#5E6F73]">4.9 (127 avis)</span>
              </div>
              <div className="text-4xl font-serif text-[#075D9A] mb-6">{product.price} TND</div>

              <p className="text-lg text-[#5E6F73] leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#075D9A]" />
                  <span className="text-[#17324D]">100% fait main par des artisans tunisiens</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#075D9A]" />
                  <span className="text-[#17324D]">Argile naturelle et émail soigné</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#075D9A]" />
                  <span className="text-[#17324D]">Dimensions indicatives selon la pièce artisanale</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#075D9A]" />
                  <span className="text-[#17324D]">Petites séries, finition unique</span>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#17324D] mb-2 block">Quantité</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F8FBFA] transition-colors duration-300"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F8FBFA] transition-colors duration-300"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#075D9A] text-white py-4 rounded-full hover:bg-[#B86F3B] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Ajouter au panier</span>
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isFavorite
                      ? 'border-[#075D9A] bg-[#075D9A] text-white'
                      : 'border-[#075D9A] text-[#075D9A] hover:bg-[#075D9A] hover:text-white'
                  }`}
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full border-2 border-[#075D9A] text-[#075D9A] py-4 rounded-full hover:bg-[#075D9A] hover:text-white transition-all duration-300"
              >
                Commander maintenant
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#17324D]/10">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-[#17324D]">Livraison offerte dès 199 TND</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-[#17324D]">Paiement sécurisé</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#075D9A] to-[#B86F3B] rounded-full flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-[#17324D]">Assistance après achat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-20">
          <div className="flex gap-6 border-b border-[#17324D]/10 mb-8">
            {(['description', 'reviews', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-serif text-lg capitalize transition-colors duration-300 ${
                  activeTab === tab
                    ? 'text-[#075D9A] border-b-2 border-[#075D9A]'
                    : 'text-[#5E6F73] hover:text-[#B86F3B]'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 lg:p-12">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-serif text-[#17324D] mb-4">Description du produit</h3>
                <p className="text-[#5E6F73] leading-relaxed mb-4">
                  Cette pièce Le Monde Céramique célèbre la céramique tunisienne avec une silhouette contemporaine, une finition chaude et une présence discrètement premium.
                  <br />
                  قطعة خزفية تونسية بتصميم عصري ولمسة فاخرة.
                </p>
                <p className="text-[#5E6F73] leading-relaxed mb-4">
                  Chaque variation de texture ou d'émail fait partie du charme artisanal. La pièce peut accompagner une table, une entrée, un salon ou un coffret cadeau.
                  <br />
                  اختلافات اللون والملمس جزء من جمال الصناعة اليدوية.
                </p>
                <h4 className="text-xl font-serif text-[#17324D] mb-3 mt-6">Conseils d'entretien</h4>
                <ul className="list-disc list-inside text-[#5E6F73] space-y-2">
                  <li>Nettoyer avec un chiffon doux ou une éponge non abrasive</li>
                  <li>Éviter les produits chimiques agressifs</li>
                  <li>Manipuler avec soin pour préserver l'émail</li>
                  <li>Sécher avant rangement</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-serif text-[#17324D] mb-2">Avis clients</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#B86F3B] text-[#B86F3B]" />
                        ))}
                      </div>
                      <span className="text-[#5E6F73]">4.9 sur 5</span>
                      <span className="text-[#5E6F73]">Basé sur 127 avis</span>
                    </div>
                  </div>
                  <button className="border-2 border-[#075D9A] text-[#075D9A] px-6 py-3 rounded-full hover:bg-[#075D9A] hover:text-white transition-colors duration-300">
                    Donner un avis
                  </button>
                </div>

                <div className="space-y-6">
                  {visibleReviews.map((review) => (
                    <div key={review.id} className="border-b border-[#17324D]/10 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-[#17324D]">{review.name}</span>
                            {review.verified && (
                              <span className="text-xs bg-[#E9D8BE] text-[#5E6F73] px-2 py-1 rounded">
                                Achat vérifié
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#B86F3B] text-[#B86F3B]" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-[#5E6F73]">{review.date}</span>
                      </div>
                      <p className="text-[#5E6F73] leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-serif text-[#17324D] mb-4">Livraison et paiement</h3>
                <div className="space-y-6">
                  {shippingZone && (
                    <div className="rounded-2xl border border-[#17324D]/10 bg-white p-5">
                      <h4 className="text-xl font-serif text-[#17324D] mb-3">{shippingZone.name}</h4>
                      <ul className="list-disc list-inside text-[#5E6F73] space-y-2">
                        <li>Frais de livraison: {shippingZone.fee} TND</li>
                        <li>Delai estime: {shippingZone.estimatedDays}</li>
                        {shippingZone.freeShippingThreshold > 0 && (
                          <li>Livraison offerte des {shippingZone.freeShippingThreshold} TND</li>
                        )}
                        <li>
                          Zones: {shippingZone.cities?.length ? shippingZone.cities.join(', ') : shippingZone.countries?.join(', ') || 'Tunisie'}
                        </li>
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-serif text-[#17324D] mb-3">Livraison partout en Tunisie</h4>
                    <p className="text-[#5E6F73] leading-relaxed mb-3">
                      Livraison offerte dès 199 TND. Chaque commande est emballée avec soin pour protéger la céramique pendant le transport.
                      <br />
                      توصيل إلى جميع أنحاء تونس وتغليف آمن للقطع الخزفية.
                    </p>
                    <ul className="list-disc list-inside text-[#5E6F73] space-y-2">
                      <li>Livraison standard selon la ville</li>
                      <li>Suivi de commande après confirmation</li>
                      <li>Livraison offerte dès 199 TND</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-[#17324D] mb-3">Paiement</h4>
                    <p className="text-[#5E6F73] leading-relaxed mb-3">
                      Paiement à la livraison, carte bancaire et paiement sécurisé selon le mode choisi au moment de la commande.
                      <br />
                      الدفع عند الاستلام أو بالبطاقة البنكية بطريقة آمنة.
                    </p>
                    <ul className="list-disc list-inside text-[#5E6F73] space-y-2">
                      <li>Paiement à la livraison</li>
                      <li>Paiement sécurisé</li>
                      <li>Carte bancaire</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl lg:text-4xl font-serif text-[#17324D] mb-8">
            Vous aimerez aussi
            <br />
            قد يعجبك أيضا
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {visibleRelatedProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-lg text-[#17324D] group-hover:text-[#075D9A] transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="text-xl font-serif text-[#075D9A]">
                      {product.price} TND
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
