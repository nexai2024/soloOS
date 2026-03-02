import { vi } from 'vitest';

export function createMockCompletion(content: string) {
  return {
    choices: [{ message: { content } }],
  };
}

export const mockOpenAICreate = vi.fn();

vi.mock('@/lib/ai-config', () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  }),
  AI_MODEL: 'gpt-4o-mini',
  AI_MODEL_ADVANCED: 'gpt-4-turbo-preview',
  aiComplete: vi.fn(),
}));

export function resetOpenAIMock() {
  mockOpenAICreate.mockReset();
}
