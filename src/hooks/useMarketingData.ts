'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchGet } from '@/lib/fetch';

interface UseMarketingDataOptions<T> {
  url: string;
  enabled?: boolean;
  refreshKey?: number;
}

interface UseMarketingDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMarketingData<T>({
  url,
  enabled = true,
  refreshKey = 0,
}: UseMarketingDataOptions<T>): UseMarketingDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = await fetchGet<T>(url);
    if (result.ok) {
      setData(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  return { data, isLoading, error, refetch: fetchData };
}
