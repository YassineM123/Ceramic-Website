import type { Product } from '../data/products';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export interface StorefrontCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  active?: boolean;
}

export interface StorefrontCollection {
  id: string;
  title: string;
  description?: string;
  image: string;
  productId?: string | number;
  itemCountLabel?: string;
  items?: string;
  active?: boolean;
}

export interface StorefrontReview {
  id: string;
  name: string;
  location?: string;
  rating: number;
  text: string;
  image?: string;
  verified?: boolean;
  date?: string;
}

export interface StorefrontBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  image?: string;
  author?: string;
  publishedAt?: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  fee: number;
  freeShippingThreshold: number;
  estimatedDays?: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  includedInPrice: boolean;
}

export interface StorefrontContent {
  homepage: {
    announcement?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroPrimaryCta?: string;
    heroSecondaryCta?: string;
    heroImage?: string;
    heroDetailImage?: string;
    heroTextureImage?: string;
    featuredProductId?: string | number;
    collectionEyebrow?: string;
    collectionTitle?: string;
    collectionSubtitle?: string;
    newsletterTitle?: string;
    newsletterSubtitle?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
    hours?: string;
  };
}

export interface StorefrontPayload {
  content: StorefrontContent;
  products: Product[];
  categories: StorefrontCategory[];
  collections: StorefrontCollection[];
  reviews: StorefrontReview[];
  blogs: StorefrontBlogPost[];
  shippingZones: ShippingZone[];
  taxRates: TaxRate[];
  generatedAt?: string;
}

export interface PublicOrderPayload {
  customer: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country?: string;
  };
  items: Array<{ productId: string | number; quantity: number }>;
  couponCode?: string;
  paymentMethod?: string;
  note?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Website API request failed');
  }
  return payload?.data as T;
}

export function fetchStorefrontPayload(): Promise<StorefrontPayload> {
  return request<StorefrontPayload>('/public/website');
}

export function createPublicOrder(payload: PublicOrderPayload): Promise<{ id: string; status: string; total: number }> {
  return request('/public/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ id: string; status: string }> {
  return request('/public/contact-messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function subscribeNewsletter(email: string): Promise<{ id: string; status: string }> {
  return request('/public/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email, source: 'website' }),
  });
}
