export interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  badge?: string;
  isNew?: boolean;
  description: string;
  stock?: number;
  status?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Tasse & Sous-Tasse Fleur Rouge | فنجان وصحن بزهور حمراء',
    price: 38,
    category: 'Tasses & Cafés | فناجين وقهوة',
    image: '/album/cups/cup-red-flower-single.jpeg',
    images: [
      '/album/cups/cup-red-flower-single.jpeg',
      '/album/cups/cup-red-flower-front.jpeg',
      '/album/cups/cup-red-flower-top.jpeg',
    ],
    badge: 'Coup de coeur | الأكثر طلباً',
    isNew: true,
    description: 'Ensemble tasse et sous-tasse façonné et peint à la main. Motif floral rouge éclatant avec feuillage printanier et émail brillant protecteur. طقم فنجان وصحن يدوي بتطريز وردي أحمر رائع.',
    stock: 25,
  },
  {
    id: 2,
    name: 'Huilier Olives Noires avec Socle | مزيتة زيتون سوداء مع حامل',
    price: 55,
    category: 'Huiliers & Vinaigriers | مزايت وفن المائدة',
    image: '/album/oil-bottles/oil-bottle-olives.jpeg',
    images: ['/album/oil-bottles/oil-bottle-olives.jpeg'],
    badge: 'Best Seller | الأكثر مبيعاً',
    isNew: true,
    description: 'Bouteille d\'huile d\'olive artisanale avec motifs olives noires tunisiennes et son socle verseur assorti. Bouchon en liège naturel inclus. قارورة زيت زيتون فخمة مع قاعدتها.',
    stock: 18,
  },
  {
    id: 3,
    name: 'Tasse & Sous-Tasse Citron Solaire | فنجان وصحن ليمون',
    price: 38,
    category: 'Tasses & Cafés | فناجين وقهوة',
    image: '/album/cups/cup-lemon-set.jpeg',
    images: ['/album/cups/cup-lemon-set.jpeg'],
    badge: 'Nouveau | جديد',
    isNew: true,
    description: 'Tasse et soucoupe artisanale aux motifs de citrons méditerranéens et rayures ensoleillées. Émail doux et prise en main très agréable. طقم فنجان ليمون صيفي مميز.',
    stock: 20,
  },
  {
    id: 4,
    name: 'Huilier Piment Rouge & Socle Rouge | مزيتة فلفل حار مع حامل أحمر',
    price: 55,
    category: 'Huiliers & Vinaigriers | مزايت وفن المائدة',
    image: '/album/oil-bottles/oil-bottle-red-chili.jpeg',
    images: ['/album/oil-bottles/oil-bottle-red-chili.jpeg'],
    badge: 'Authentique Tunisien | أصيل',
    isNew: true,
    description: 'Inspiration terroir tunisien avec piments rouges vifs et son socle ergonomique rouge laqué. Idéal pour l\'huile d\'olive harissa et les tables conviviales. مزيتة فلفل أحمر تونسي بقاعدة حمراء مميزة.',
    stock: 15,
  },
  {
    id: 5,
    name: 'Tasse & Sous-Tasse Nazar Œil Bleu | فنجان وصحن عين الحسود',
    price: 38,
    category: 'Tasses & Cafés | فناجين وقهوة',
    image: '/album/cups/cup-evil-eye.jpeg',
    images: ['/album/cups/cup-evil-eye.jpeg'],
    badge: 'Édition limitée | إصدار خاص',
    description: 'Tasse artisanale sculptée avec œil bleu protecteur Nazar et anse cobalt. Finition martelée à la main. فنجان خزفي فريد بلمسة العين الزرقاء التونسية.',
    stock: 12,
  },
  {
    id: 6,
    name: 'Huilier Citron Jaune & Socle Jaune | مزيتة ليمون مع حامل أصفر',
    price: 55,
    category: 'Huiliers & Vinaigriers | مزايت وفن المائدة',
    image: '/album/oil-bottles/oil-bottle-lemon.jpeg',
    images: ['/album/oil-bottles/oil-bottle-lemon.jpeg'],
    badge: 'Nouveau | جديد',
    isNew: true,
    description: 'Éclat méditerranéen aux citrons mûrs avec socle jaune soleil. Conçu pour assaisonner vos salades et plats avec style. مزيتة ليمون زاهية للطاولة.',
    stock: 22,
  },
  {
    id: 7,
    name: 'Tasse & Sous-Tasse Fleur Bleue | فنجان وصحن بزهور زرقاء',
    price: 38,
    category: 'Tasses & Cafés | فناجين وقهوة',
    image: '/album/cups/cup-blue-flower.jpeg',
    images: ['/album/cups/cup-blue-flower.jpeg'],
    badge: 'Coup de coeur | الأكثر طلباً',
    description: 'Fleurs bleues délicates peintes sur céramique blanche nacrée avec assiette coordonnée. طقم فنجان خزفي بزهور زرقاء ناعمة.',
    stock: 16,
  },
  {
    id: 8,
    name: 'Huilier Cerises Douces & Socle Pointillé | مزيتة كرز وقاعدة منقطة',
    price: 55,
    category: 'Huiliers & Vinaigriers | مزايت وفن المائدة',
    image: '/album/oil-bottles/oil-bottle-cherry.jpeg',
    images: ['/album/oil-bottles/oil-bottle-cherry.jpeg'],
    badge: 'Tendance | رائج',
    description: 'Délicat motif cerises rouges avec socle blanc moucheté. Apporte une touche poétique et fraîche à votre cuisine. مزيتة كرز أنيقة وفخمة.',
    stock: 14,
  },
  {
    id: 9,
    name: 'Tasse & Sous-Tasse Matin Croissant | فنجان وصحن كرواسون',
    price: 38,
    category: 'Tasses & Cafés | فناجين وقهوة',
    image: '/album/cups/cup-croissant.jpeg',
    images: ['/album/cups/cup-croissant.jpeg'],
    description: 'Parfaite pour les petits déjeuners gourmands avec son motif croissant doré et ses petits cœurs chaleureux. فنجان رائع لفطور الصباح.',
    stock: 19,
  },
  {
    id: 10,
    name: 'Huilier Piment Vert & Socle Vert Olive | مزيتة فلفل أخضر مع حامل أخضر',
    price: 55,
    category: 'Huiliers & Vinaigriers | مزايت وفن المائدة',
    image: '/album/oil-bottles/oil-bottle-green-chili.jpeg',
    images: ['/album/oil-bottles/oil-bottle-green-chili.jpeg'],
    description: 'Piments verts frais peints sur faïence artisanale avec socle vert assorti. مزيتة فلفل أخضر بحامل متناسق.',
    stock: 17,
  },
  {
    id: 11,
    name: 'Tasse & Sous-Tasse Ourson Douceur | فنجان وصحن دبدوب',
    price: 38,
    category: 'Tasses & Cafés | فناجين وقهوة',
    image: '/album/cups/cup-teddy-bear.jpeg',
    images: ['/album/cups/cup-teddy-bear.jpeg'],
    badge: 'Cadeau Idéal | هدية مميزة',
    description: 'Adorable tasse sculptée et peinte à la main avec petit ourson et cœurs bruns. Un cadeau plein de tendresse. فنجان لطيف جداً بهدية مميزة.',
    stock: 15,
  },
  {
    id: 12,
    name: 'Huilier Rayures & Cœurs Sidi Bou | مزيتة قلوب زرقاء سيدي بوسعيد',
    price: 55,
    category: 'Huiliers & Vinaigriers | مزايت وفن المائدة',
    image: '/album/oil-bottles/oil-bottle-blue-hearts.jpeg',
    images: ['/album/oil-bottles/oil-bottle-blue-hearts.jpeg'],
    description: 'Style emblématique blanc et bleu inspiré des ruelles de Sidi Bou Saïd avec socle bleu ciel. مزيتة أزرق وأبيض سيدي بوسعيد.',
    stock: 20,
  },
];

export const featuredProduct = products[0];
export const bestSellers = products.slice(0, 8);
export const relatedProducts = [products[0], products[1], products[2], products[3]];
