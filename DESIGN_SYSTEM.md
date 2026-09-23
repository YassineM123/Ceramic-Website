# Le Monde Céramique - Design System Documentation

## Overview

A world-class luxury e-commerce website for Le Monde Céramique, a Tunisian ceramic and home décor brand. The design embodies Mediterranean elegance, Tunisian craftsmanship, and premium quality matching brands like Zara Home, West Elm, Pottery Barn, and Apple-level design standards.

---

## Brand Identity

### Brand Values
- **Handmade** - Every piece crafted by skilled artisans
- **Elegant** - Sophisticated minimalist aesthetic
- **Authentic** - True to Tunisian heritage
- **Timeless** - Classic designs that endure
- **Luxury** - Premium quality and materials
- **Natural** - Eco-friendly and sustainable
- **Artistic** - Unique works of art

---

## Color System

### Primary Colors
```css
--warm-white: #FAF8F5     /* Background, surfaces */
--sand-beige: #E7DCCB     /* Secondary backgrounds */
--terracotta: #C96F4A     /* Primary brand color, CTAs */
--clay-brown: #8C5A42     /* Text, accents */
--charcoal: #2B2B2B       /* Primary text, dark sections */
--gold: #C9A76A           /* Accent, ratings, highlights */
```

### Usage Guidelines
- **Warm White (#FAF8F5)** - Main background color, creates airy Mediterranean feel
- **Sand Beige (#E7DCCB)** - Secondary surfaces, hover states, subtle backgrounds
- **Terracotta (#C96F4A)** - Primary actions (buttons, links), brand color
- **Clay Brown (#8C5A42)** - Body text, muted content
- **Charcoal (#2B2B2B)** - Headings, important text, footer
- **Gold (#C9A76A)** - Star ratings, premium accents, special highlights

---

## Typography System

### Font Families
```css
--font-serif: 'Playfair Display', serif;  /* Headings, elegant titles */
--font-sans: 'Inter', sans-serif;         /* Body text, UI elements */
```

### Type Scale
- **Headings (H1-H3)** - Playfair Display (serif)
  - Display: 5xl-7xl (48px-72px)
  - H1: 4xl-6xl (36px-60px)
  - H2: 3xl-5xl (30px-48px)
  - H3: 2xl-4xl (24px-36px)

- **Body Text** - Inter (sans-serif)
  - Large: xl-2xl (20px-24px)
  - Base: base-lg (16px-18px)
  - Small: sm (14px)
  - Tiny: xs (12px)

### Font Weights
- Light: 300 (decorative use only)
- Regular: 400 (body text)
- Medium: 500 (emphasis, buttons)
- Semibold: 600 (headings in sans-serif)
- Bold: 700 (serif headings)

---

## Spacing System

### Apple-Level Spacing
- Uses Tailwind's default 4px base unit
- Generous white space throughout
- Consistent padding: 24px (6), 48px (12), 96px (24), 128px (32)
- Section spacing: py-24 lg:py-32 (96px-128px)
- Card padding: p-6 lg:p-8 lg:p-12 (24px-48px)

### Layout Constraints
- Max width: 1400px (max-w-[1400px])
- Horizontal padding: px-6 lg:px-12 (24px-48px)
- Gutters: gap-4 to gap-12 (16px-48px)

---

## Component Library

### Buttons

#### Primary Button
```jsx
<button className="bg-[#C96F4A] text-white px-8 py-4 rounded-full hover:bg-[#8C5A42] transition-all duration-300 shadow-lg hover:shadow-xl">
  Shop Collection
</button>
```

#### Secondary Button
```jsx
<button className="border-2 border-[#C96F4A] text-[#C96F4A] px-8 py-4 rounded-full hover:bg-[#C96F4A] hover:text-white transition-all duration-300">
  Explore Our Story
</button>
```

#### Features
- Rounded full (pill-shaped)
- Generous padding
- Smooth transitions (300ms)
- Shadow on hover
- Icon support

### Product Cards

#### Standard Product Card
- Aspect ratio: square (1:1)
- Background: white on warm-white
- Rounded corners: 2xl (16px)
- Hover: scale image 110%, shadow upgrade
- Badge support (top-left)
- Wishlist button (top-right)
- Hidden actions on hover (bottom)

#### Features
- Large product image
- Product name (serif font)
- Price (terracotta color, serif)
- 5-star rating
- Quick actions: Add to Cart, Quick View, Wishlist

### Form Elements

#### Input Fields
```jsx
<input className="w-full px-6 py-3 rounded-full bg-[#FAF8F5] border-2 border-transparent focus:border-[#C96F4A] outline-none transition-colors duration-300" />
```

#### Textarea
```jsx
<textarea className="w-full px-6 py-4 rounded-3xl bg-[#FAF8F5] border-2 border-transparent focus:border-[#C96F4A] outline-none transition-colors duration-300 resize-none" />
```

#### Features
- Rounded full/3xl
- Soft background color
- Focus state with terracotta border
- Consistent padding
- No harsh outlines

### Cards

#### Standard Card
- Rounded: 2xl to 3xl (16px-24px)
- Background: white
- Shadow: sm to xl
- Padding: p-6 to p-12
- Hover: shadow upgrade

#### Icon Feature Card
- Icon container: gradient from terracotta to clay-brown
- Rounded icon background: 2xl
- White icon
- Centered layout
- Generous spacing

---

## Design Patterns

### Navigation
- Fixed position, sticky header
- Backdrop blur for modern feel
- Transparent background with blur
- Icons for search, user, wishlist, cart
- Mobile-responsive hamburger menu
- Logo: Large serif typography

### Hero Sections
- Full viewport height (min-h-screen)
- Large imagery with gradient overlays
- Centered content
- Parallax effects (subtle)
- Scroll indicator
- CTA buttons prominent

### Grids
- Responsive: 1 column → 2 → 3 → 4
- Consistent gaps: gap-8 to gap-12
- Even card heights
- Mobile-first approach

### Hover Effects
- Image scale: 110% on hover
- Transition duration: 500-700ms
- Shadow elevation
- Color shifts
- Icon movements (arrows, etc.)

---

## Animation Guidelines

### Motion Principles
- Uses `motion/react` (Framer Motion)
- Initial state: opacity 0, slight offset
- Viewport triggers for scroll animations
- Stagger delays: 0.05s to 0.2s increments
- Duration: 300ms (fast), 500ms (medium), 700ms (slow)

### Common Animations
```jsx
// Fade in from bottom
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.8 }}
```

### Micro-interactions
- Button hover: shadow, background color
- Card hover: scale, shadow, transform
- Icon hover: translate, rotate
- Smooth transitions: 300ms

---

## Iconography

### Icon Library
- **Primary**: Lucide React
- Size: w-5 h-5 (20px) to w-8 h-8 (32px)
- Color: Inherits from parent or explicit color
- Stroke width: default (2)

### Common Icons
- Shopping: ShoppingCart, ShoppingBag
- Social: Heart (wishlist), Share
- UI: Search, Menu, X, Eye
- Features: Truck, Shield, Award, etc.

---

## Photography Guidelines

### Image Style
- High-quality lifestyle photography
- Natural lighting, soft shadows
- Mediterranean aesthetic
- Artisan close-ups (hands crafting)
- Product in context (styled scenes)
- Neutral backgrounds with pops of terracotta

### Image Treatment
- Object fit: cover
- Rounded corners: 2xl to 3xl
- Hover scale: 110%
- Aspect ratios: square, 4:5, 16:9
- Alt text: descriptive and meaningful

---

## Responsive Design

### Breakpoints (Tailwind defaults)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Simplified navigation on mobile
- Stacked layouts → grid layouts

### Grid Adaptations
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Sidebar layouts: stack on mobile

---

## Accessibility

### Standards
- WCAG 2.1 AA compliance
- Semantic HTML
- Alt text on all images
- Keyboard navigation support
- Focus states on interactive elements
- Sufficient color contrast

### Interactive Elements
- Min touch target: 44x44px
- Clear focus indicators
- Meaningful link text
- Form labels and error states
- ARIA labels where needed

---

## Page Structure

### Homepage
1. Hero - Full-screen immersive
2. Featured Collections - Grid of 6 collections
3. Best Sellers - Product grid
4. Craftsmanship - 4-step process
5. Why Choose Us - 6 value props
6. Interior Gallery - Masonry grid
7. Testimonials - Slider
8. Instagram - 6-image grid
9. Newsletter - Subscription CTA
10. Footer - Dark, comprehensive

### Shop Page
- Hero banner
- Sidebar filters (desktop)
- Product grid/list view toggle
- Category filters
- Price range filters
- Sort options
- Pagination

### Product Detail
- Large image gallery
- Product info and pricing
- Quantity selector
- Add to cart / Buy now
- Tabs: Description, Reviews, Shipping
- Related products

### About Page
- Hero image
- Mission statement
- Values (4 cards)
- Heritage section
- Timeline
- Team profiles
- CTA

### Contact Page
- Hero
- Contact cards (phone, email, WhatsApp)
- Contact form
- Location map
- Opening hours
- Social media links

---

## Technical Stack

### Core Technologies
- **React** 18.3.1
- **TypeScript** (implicit via .tsx)
- **Tailwind CSS** 4.1.12
- **Vite** 6.3.5

### Key Libraries
- **motion** (Framer Motion) - Animations
- **lucide-react** - Icons
- **react-responsive-masonry** - Gallery layouts
- **react-slick** - Carousels (if needed)

### Design Tokens
- Defined in `/src/styles/theme.css`
- Custom properties for colors
- Consistent across components

---

## File Structure

```
src/
├── app/
│   ├── App.tsx                 # Main application
│   └── components/
│       ├── Navigation.tsx       # Header navigation
│       ├── Hero.tsx            # Homepage hero
│       ├── FeaturedCollections.tsx
│       ├── BestSellers.tsx     # Product grid
│       ├── Craftsmanship.tsx   # Process section
│       ├── WhyChooseUs.tsx     # Value props
│       ├── InteriorGallery.tsx # Masonry gallery
│       ├── Testimonials.tsx    # Reviews slider
│       ├── InstagramShowcase.tsx
│       ├── Newsletter.tsx      # Email capture
│       ├── Footer.tsx          # Site footer
│       ├── Cart.tsx            # Shopping cart
│       ├── ShopPage.tsx        # Product listing
│       ├── ProductDetailPage.tsx
│       ├── AboutPage.tsx       # Brand story
│       ├── ContactPage.tsx     # Contact form
│       └── Demo.tsx            # Page navigation
└── styles/
    ├── theme.css               # Design tokens
    └── fonts.css               # Typography
```

---

## Brand Guidelines

### Voice & Tone
- Sophisticated yet warm
- Educational (craft stories)
- Confident but not boastful
- Mediterranean charm
- Artisanal authenticity

### Imagery
- Lifestyle over product-only
- Artisan hands crafting
- Mediterranean settings
- Warm natural light
- Authentic moments

### Copy Principles
- Short sentences
- Active voice
- Focus on benefits and emotion
- Storytelling
- Cultural heritage

---

## Performance Optimizations

### Images
- WebP format preferred
- Lazy loading
- Responsive images
- Compressed for web
- Alt text for SEO

### Animations
- GPU-accelerated (transform, opacity)
- Reduced motion support
- viewport={{ once: true }} to prevent re-triggers
- Optimized transition timing

### Code
- Component code splitting
- Minimal dependencies
- Tree-shaking enabled
- Production build optimization

---

## Future Enhancements

### Potential Features
- Multi-language support (French, Arabic)
- Currency converter
- AR product preview
- Live chat support
- Loyalty program
- Wishlist persistence
- Product comparisons
- Gift wrapping options
- Artisan profiles
- Behind-the-scenes videos

---

## Credits

**Design System**: Inspired by Zara Home, West Elm, Pottery Barn, Crate & Barrel, Maison du Monde, and Apple

**Photography**: Unsplash contributors

**Typography**: Google Fonts (Playfair Display, Inter)

**Icons**: Lucide Icons

**Framework**: React + Tailwind CSS

---

*Le Monde Céramique - Where Mediterranean elegance meets Tunisian craftsmanship*
