import { useEffect, useState } from 'react';
import { fetchStorefrontPayload, StorefrontPayload } from '../services/storefrontApi';

const emptyPayload: StorefrontPayload = {
  content: {
    homepage: {},
    contact: {},
  },
  products: [],
  categories: [],
  collections: [],
  reviews: [],
  blogs: [],
  shippingZones: [],
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
          products: payload.products || [],
          categories: payload.categories || [],
          shippingZones: payload.shippingZones || [],
          taxRates: payload.taxRates || [],
        });
        setIsLive(true);
        setError('');
      } catch (_error) {
        if (active) {
          setIsLive(false);
          setError('La boutique est temporairement indisponible.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return { data, isLive, isLoading, error };
}
