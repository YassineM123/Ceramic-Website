export interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
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
    name: 'Assiette Artisanale | طبق خزفي يدوي',
    price: 49,
    category: 'Art de la table | فن المائدة',
    image: 'https://images.unsplash.com/photo-1592493426177-7dd66e857e7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Coup de coeur | الأكثر طلبا',
    description: 'Assiette en céramique artisanale avec émail doux, pensée pour les tables quotidiennes et les invitations élégantes. طبق يدوي بلمسة تونسية راقية.',
  },
  {
    id: 2,
    name: 'Bol Tradition | وعاء خزفي',
    price: 39,
    category: 'Vaisselle | أواني',
    image: 'https://images.unsplash.com/photo-1495100497150-fe209c585f50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Nouveau | جديد',
    isNew: true,
    description: 'Bol profond aux lignes simples, idéal pour chorba, salade, fruits ou petit déjeuner. وعاء عملي وأنيق للاستعمال اليومي.',
  },
  {
    id: 3,
    name: 'Vase Décoratif | مزهرية',
    price: 129,
    category: 'Décoration maison | ديكور المنزل',
    image: 'https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Édition limitée | إصدار محدود',
    description: 'Vase sculptural en terre cuite, parfait pour une entrée, un salon ou une console contemporaine. مزهرية فخمة تضيف دفئا للمكان.',
  },
  {
    id: 4,
    name: 'Plat de Présentation | طبق تقديم',
    price: 79,
    category: 'Art de la table | فن المائدة',
    image: 'https://images.unsplash.com/photo-1738408660942-78dbf4985c3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Coup de coeur | الأكثر طلبا',
    description: 'Grand plat en céramique tunisienne pour couscous, pâtisseries, fruits ou service de réception. طبق تقديم راق للمناسبات.',
  },
  {
    id: 5,
    name: 'Service à Café | طقم قهوة',
    price: 129,
    category: 'Café et thé | قهوة وشاي',
    image: 'https://images.unsplash.com/photo-1630783098843-956335ee5275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Service à café chaleureux pour espresso, café turc ou moments en famille. طقم قهوة خزفي لجلسات أنيقة.',
  },
  {
    id: 6,
    name: 'Plateau Artisanal | صينية خزفية',
    price: 99,
    category: 'Accessoires maison | لوازم المنزل',
    image: 'https://images.unsplash.com/photo-1619400131077-bbdefafeae75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Plateau raffiné pour café, dattes, pâtisseries ou table de Ramadan. صينية خزفية عملية بلمسة حرفية.',
  },
  {
    id: 7,
    name: 'Collection Ramadan | مجموعة رمضان',
    price: 249,
    category: 'Collections | مجموعات',
    image: 'https://images.unsplash.com/photo-1574288361601-74b6d68ec626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Nouveau | جديد',
    isNew: true,
    description: 'Sélection complète pour ftour, desserts et présentation de table pendant Ramadan. مجموعة أنيقة لسفرة رمضان.',
  },
  {
    id: 8,
    name: 'Coffret Cadeau | علبة هدايا',
    price: 159,
    category: 'Cadeaux | هدايا',
    image: 'https://images.unsplash.com/photo-1607448374755-d8eba19cdf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Coffret prêt à offrir pour mariage, nouvelle maison ou cadeau professionnel. هدية خزفية فاخرة ومميزة.',
  },
  {
    id: 9,
    name: 'Mug Élégance | كوب خزفي',
    price: 45,
    category: 'Café et thé | قهوة وشاي',
    image: 'https://images.unsplash.com/photo-1520485521983-bfaa0bc6c80e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBtdWclMjBjZXJhbWljJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc4MDQ0MTIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Mug confortable avec anse douce et émail naturel pour café, thé ou tisane. كوب أنيق للاستعمال اليومي.',
  },
  {
    id: 10,
    name: 'Collection Mariage | مجموعة الأعراس',
    price: 249,
    category: 'Cadeaux | هدايا',
    image: 'https://images.unsplash.com/photo-1526198049595-f32cde2a219d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxoYW5kbWFkZSUyMHBvdHRlcnklMjBjZXJhbWljJTIwdmFzZXxlbnwxfHx8fDE3ODA0NDEyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Édition limitée | إصدار محدود',
    description: 'Assortiment premium pour cadeaux de mariage et maisons nouvelles. مجموعة فخمة لهدايا الأعراس.',
  },
  {
    id: 11,
    name: 'Service de Table | طقم مائدة',
    price: 199,
    category: 'Vaisselle | أواني',
    image: 'https://images.unsplash.com/photo-1762534729099-fbe059aaf1d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'Coup de coeur | الأكثر طلبا',
    description: 'Service coordonné pour quatre personnes, entre vaisselle moderne et artisanat tunisien. طقم مائدة كامل وأنيق.',
  },
  {
    id: 12,
    name: 'Coupe Décorative | وعاء ديكور',
    price: 69,
    category: 'Décoration maison | ديكور المنزل',
    image: 'https://images.unsplash.com/photo-1689180822961-01ed06c40d20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxsdXh1cnklMjBjZXJhbWljJTIwdGFibGV3YXJlJTIwZGluaW5nfGVufDF8fHx8MTc4MDQ0MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Coupe basse pour fruits, clés, table basse ou décoration murale posée. وعاء ديكور بسيط وفخم.',
  },
];

export const featuredProduct = products[2];
export const bestSellers = products.slice(0, 8);
export const relatedProducts = [products[0], products[1], products[4], products[5]];
