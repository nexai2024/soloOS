'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ProductOption, DateRange } from '@/lib/marketing/types';

interface MarketingContextType {
  selectedProduct: ProductOption | null;
  setSelectedProduct: (product: ProductOption | null) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refreshKey: number;
  refresh: () => void;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <MarketingContext.Provider value={{
      selectedProduct,
      setSelectedProduct,
      dateRange,
      setDateRange,
      refreshKey,
      refresh,
    }}>
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error('useMarketing must be used within MarketingProvider');
  return ctx;
}
