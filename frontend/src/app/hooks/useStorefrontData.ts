import { useEffect, useState } from 'react';
import { fetchStorefrontPayload, StorefrontPayload } from '../services/storefrontApi';
import { products as defaultProducts } from '../data/products';

const defaultCategories = [
  { id: 'all', name: 'Toutes les créations' },
  { id: 'cups', name: 'Tasses & Cafés | فناجين وقهوة' },
  { id: 'oil-bottles', name: 'Huiliers & Vinaigriers | مزايت وفن المائدة' },
];

const emptyPayload: StorefrontPayload = {
  content: {
    homepage: {},
    contact: {},
  },
  products: defaultProducts,
  categories: defaultCategories,
  collections: [],
  reviews: [],
  blogs: [],
  shippingZones: [
    {
      id: 'tn-standard',
      name: 'Livraison standard Tunisie',
      fee: 7,
      freeShippingThreshold: 120,
      estimatedDays: '24-48h',
    },
  ],
  taxRates: [],
};

export function useStorefrontData() {
  const [data, setData] = useState<StorefrontPayload>(emptyPayload);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await fetchStorefrontPayload();
        if (!active) return;
        const validProducts =
          payload.products && payload.products.length > 0 && payload.products.some((p) => p.name.includes('Tasse') || p.name.includes('Huilier') || p.category?.includes('خزف') || p.category?.includes('Art'))
            ? payload.products
            : defaultProducts;

        setData({
          ...emptyPayload,
          ...payload,
          content: {
            ...emptyPayload.content,
            ...(payload.content || {}),
            homepage: {
              ...emptyPayload.content.homepage,
              ...(payload.content?.homepage || {}),
            },
            contact: {
              ...emptyPayload.content.contact,
              ...(payload.content?.contact || {}),
            },
          },
          products: validProducts,
          categories: payload.categories && payload.categories.length > 0 ? payload.categories : defaultCategories,
          shippingZones: payload.shippingZones && payload.shippingZones.length > 0 ? payload.shippingZones : emptyPayload.shippingZones,
          taxRates: payload.taxRates || [],
        });
        setIsLive(true);
        setError('');
      } catch (_error) {
        if (active) {
          setIsLive(false);
          setData(emptyPayload);
          setError('');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return { data, isLive, isLoading, error };
}
