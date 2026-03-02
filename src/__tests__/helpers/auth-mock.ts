import { vi } from 'vitest';

export const mockGetCurrentUser = vi.fn();
export const mockRequireAuth = vi.fn();

vi.mock('@/lib/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
  requireAuth: mockRequireAuth,
}));

export function resetAuthMock() {
  mockGetCurrentUser.mockReset();
  mockRequireAuth.mockReset();
}
