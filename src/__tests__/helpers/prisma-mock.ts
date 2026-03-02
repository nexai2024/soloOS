import { vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>();

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

export function resetPrismaMock() {
  mockReset(prismaMock);
}
