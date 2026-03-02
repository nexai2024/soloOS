import { describe, it, expect, vi } from 'vitest';

// Mock next/server before importing
vi.mock('next/server', () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    constructor(body: string, init?: { status?: number }) {
      this.body = JSON.parse(body);
      this.status = init?.status || 200;
    }
    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(JSON.stringify(data), init);
    }
  }
  class MockNextRequest {
    method: string;
    nextUrl: { pathname: string };
    constructor(url: string, init?: { method?: string }) {
      this.method = init?.method || 'GET';
      this.nextUrl = { pathname: new URL(url).pathname };
    }
  }
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

import { ApiError, apiSuccess, apiError, withErrorHandler } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

describe('apiSuccess', () => {
  it('returns data with 200 status by default', () => {
    const res = apiSuccess({ id: 1 }) as any;
    expect(res.body).toEqual({ id: 1 });
    expect(res.status).toBe(200);
  });

  it('accepts custom status code', () => {
    const res = apiSuccess({ created: true }, 201) as any;
    expect(res.body).toEqual({ created: true });
    expect(res.status).toBe(201);
  });
});

describe('apiError', () => {
  it('returns error with 400 status by default', () => {
    const res = apiError('Bad input') as any;
    expect(res.body).toEqual({ error: 'Bad input' });
    expect(res.status).toBe(400);
  });

  it('accepts custom status code', () => {
    const res = apiError('Not found', 404) as any;
    expect(res.body).toEqual({ error: 'Not found' });
    expect(res.status).toBe(404);
  });
});

describe('ApiError', () => {
  it('has correct name and status', () => {
    const err = new ApiError('test error', 422);
    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(422);
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });

  it('defaults to 500', () => {
    const err = new ApiError('server error');
    expect(err.statusCode).toBe(500);
  });
});

describe('withErrorHandler', () => {
  const makeReq = (path = '/api/test') =>
    new NextRequest(`http://localhost${path}`) as any;

  it('passes through successful responses', async () => {
    const handler = vi.fn().mockResolvedValue(apiSuccess({ ok: true }));
    const wrapped = withErrorHandler(handler);
    const res = (await wrapped(makeReq(), { params: Promise.resolve({}) })) as any;
    expect(res.body).toEqual({ ok: true });
    expect(res.status).toBe(200);
  });

  it('catches ApiError and returns its status', async () => {
    const handler = vi.fn().mockRejectedValue(new ApiError('Forbidden', 403));
    const wrapped = withErrorHandler(handler);
    const res = (await wrapped(makeReq(), { params: Promise.resolve({}) })) as any;
    expect(res.body).toEqual({ error: 'Forbidden' });
    expect(res.status).toBe(403);
  });

  it('catches unknown errors and returns 500', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('kaboom'));
    const wrapped = withErrorHandler(handler);
    const res = (await wrapped(makeReq(), { params: Promise.resolve({}) })) as any;
    expect(res.body).toEqual({ error: 'An unexpected error occurred. Please try again.' });
    expect(res.status).toBe(500);
  });
});
