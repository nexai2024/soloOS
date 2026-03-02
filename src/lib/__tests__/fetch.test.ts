import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeFetch } from '@/lib/fetch';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('safeFetch', () => {
  it('returns data on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ id: 1 }));
    const result = await safeFetch('/api/test');
    expect(result).toEqual({ ok: true, data: { id: 1 }, status: 200 });
  });

  it('handles 204 No Content', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject() });
    const result = await safeFetch('/api/test');
    expect(result).toEqual({ ok: true, data: null, status: 204 });
  });

  it('returns error for non-OK status with JSON body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ error: 'Validation failed' }),
    });
    const result = await safeFetch('/api/test');
    expect(result).toEqual({ ok: false, error: 'Validation failed', status: 422 });
  });

  it('returns default error for non-OK status without JSON body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });
    const result = await safeFetch('/api/test');
    expect(result).toEqual({ ok: false, error: 'Request failed (500)', status: 500 });
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));
    const result = await safeFetch('/api/test');
    expect(result).toEqual({ ok: false, error: 'Failed to fetch', status: 0 });
  });

  it('handles JSON parse failure on success response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });
    const result = await safeFetch('/api/test');
    expect(result).toEqual({ ok: false, error: 'Invalid response format', status: 200 });
  });
});
