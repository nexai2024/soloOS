"use client";

import { useState, useCallback } from "react";

interface UseOptimisticOptions<T> {
  onError?: (error: Error, rollbackData: T) => void;
}

export function useOptimistic<T>(
  initialData: T,
  options: UseOptimisticOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const optimisticUpdate = useCallback(
    async (
      operationId: string,
      optimisticData: T,
      asyncOperation: () => Promise<T>
    ): Promise<T> => {
      const previousData = data;

      // Immediately update UI
      setData(optimisticData);
      setPendingOperations((prev) => new Set(prev).add(operationId));

      try {
        // Perform the actual operation
        const result = await asyncOperation();
        setData(result);
        return result;
      } catch (error) {
        // Rollback on failure
        setData(previousData);
        if (options.onError && error instanceof Error) {
          options.onError(error, previousData);
        }
        throw error;
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(operationId);
          return next;
        });
      }
    },
    [data, options]
  );

  const isPending = useCallback(
    (operationId: string) => pendingOperations.has(operationId),
    [pendingOperations]
  );

  const hasPendingOperations = pendingOperations.size > 0;

  return {
    data,
    setData,
    optimisticUpdate,
    isPending,
    hasPendingOperations,
  };
}

// Helper for list operations
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[],
  options: UseOptimisticOptions<T[]> = {}
) {
  const { data: items, setData: setItems, optimisticUpdate, isPending, hasPendingOperations } =
    useOptimistic<T[]>(initialItems, options);

  const optimisticAdd = useCallback(
    async (tempId: string, newItem: T, asyncOperation: () => Promise<T>) => {
      const optimisticItems = [...items, newItem];

      try {
        const result = await optimisticUpdate(
          `add-${tempId}`,
          optimisticItems,
          async () => {
            const created = await asyncOperation();
            // Replace temp item with real one
            return items.filter((i) => i.id !== tempId).concat(created);
          }
        );
        return result;
      } catch (error) {
        throw error;
      }
    },
    [items, optimisticUpdate]
  );

  const optimisticRemove = useCallback(
    async (id: string, asyncOperation: () => Promise<void>) => {
      const optimisticItems = items.filter((i) => i.id !== id);

      await optimisticUpdate(`remove-${id}`, optimisticItems, async () => {
        await asyncOperation();
        return optimisticItems;
      });
    },
    [items, optimisticUpdate]
  );

  const optimisticUpdateItem = useCallback(
    async (id: string, updates: Partial<T>, asyncOperation: () => Promise<T>) => {
      const optimisticItems = items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );

      await optimisticUpdate(`update-${id}`, optimisticItems, async () => {
        const updated = await asyncOperation();
        return items.map((item) => (item.id === id ? updated : item));
      });
    },
    [items, optimisticUpdate]
  );

  return {
    items,
    setItems,
    optimisticAdd,
    optimisticRemove,
    optimisticUpdateItem,
    isPending,
    hasPendingOperations,
  };
}
