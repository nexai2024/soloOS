import { describe, it, expect, beforeEach } from 'vitest';
import { mockOpenAICreate, createMockCompletion, resetOpenAIMock } from '@/__tests__/helpers/openai-mock';
import { scoreIdea } from '@/lib/idea-scorer';

beforeEach(() => {
  resetOpenAIMock();
});

function makeScoreResponse(overrides: Record<string, unknown> = {}) {
  return {
    marketSizeScore: 70,
    marketGrowthScore: 65,
    problemSeverityScore: 80,
    competitiveAdvantageScore: 60,
    executionFeasibilityScore: 75,
    monetizationScore: 70,
    timingScore: 55,
    marketSizeReason: 'Good market size.',
    marketGrowthReason: 'Steady growth.',
    problemSeverityReason: 'Painful problem.',
    competitiveAdvantageReason: 'Some moat.',
    executionFeasibilityReason: 'Buildable.',
    monetizationReason: 'Clear pricing.',
    timingReason: 'Decent timing.',
    overallAssessment: 'Solid idea.',
    strengths: ['Strong problem'],
    weaknesses: ['Competitive market'],
    recommendations: ['Focus on niche'],
    keyRisks: ['Market risk'],
    marketEvaluation: 'Growing market.',
    improvements: [
      {
        suggestion: 'Add integrations',
        category: 'features',
        targetDimensions: ['competitiveAdvantage'],
        estimatedImpact: 8,
      },
    ],
    ...overrides,
  };
}

describe('scoreIdea', () => {
  it('returns scored result with weighted composite', async () => {
    const scores = makeScoreResponse();
    mockOpenAICreate.mockResolvedValue(createMockCompletion(JSON.stringify(scores)));

    const result = await scoreIdea('Test App', 'A test application');

    expect(result).not.toBeNull();
    // Weighted: 70*.15 + 65*.10 + 80*.20 + 60*.15 + 75*.15 + 70*.15 + 55*.10 = 69.25
    expect(result!.aiScore).toBeCloseTo(69.25, 1);
    expect(result!.marketSizeScore).toBe(70);
    expect(result!.problemSeverityScore).toBe(80);
    expect(result!.improvements).toHaveLength(1);
  });

  it('clamps scores to 1-100 range', async () => {
    const scores = makeScoreResponse({
      marketSizeScore: 150,
      marketGrowthScore: -10,
    });
    mockOpenAICreate.mockResolvedValue(createMockCompletion(JSON.stringify(scores)));

    const result = await scoreIdea('Test', 'Test');
    expect(result!.marketSizeScore).toBe(100);
    expect(result!.marketGrowthScore).toBe(1);
  });

  it('returns correct interpretation for high score', async () => {
    const scores = makeScoreResponse({
      marketSizeScore: 90,
      marketGrowthScore: 85,
      problemSeverityScore: 95,
      competitiveAdvantageScore: 88,
      executionFeasibilityScore: 85,
      monetizationScore: 90,
      timingScore: 80,
    });
    mockOpenAICreate.mockResolvedValue(createMockCompletion(JSON.stringify(scores)));

    const result = await scoreIdea('Great Idea', 'Amazing product');
    expect(result!.aiScore).toBeGreaterThanOrEqual(80);
    expect(result!.aiScoreReason).toContain('Exceptional');
  });

  it('ensures rescore does not drop improved dimension scores', async () => {
    const scores = makeScoreResponse({
      marketSizeScore: 50, // lower than previous 70
      problemSeverityScore: 85,
    });
    mockOpenAICreate.mockResolvedValue(createMockCompletion(JSON.stringify(scores)));

    const result = await scoreIdea('Test', 'Test', {
      previousScores: {
        marketSizeScore: 70,
        marketGrowthScore: 65,
        problemSeverityScore: 80,
        competitiveAdvantageScore: 60,
        executionFeasibilityScore: 75,
        monetizationScore: 70,
        timingScore: 55,
        aiScore: 69.25,
      },
      completedImprovements: [
        {
          suggestion: 'Expand TAM',
          category: 'niche',
          targetDimensions: ['marketSize'],
          estimatedImpact: 10,
        },
      ],
    });

    // marketSize was targeted by improvement, so it should not drop below 70
    expect(result!.marketSizeScore).toBe(70);
  });

  it('returns null on API error', async () => {
    mockOpenAICreate.mockRejectedValue(new Error('API down'));
    const result = await scoreIdea('Test', 'Test');
    expect(result).toBeNull();
  });

  it('clamps improvement estimatedImpact to 1-20', async () => {
    const scores = makeScoreResponse({
      improvements: [
        { suggestion: 'Big change', category: 'features', targetDimensions: ['marketSize'], estimatedImpact: 50 },
        { suggestion: 'Tiny tweak', category: 'pricing', targetDimensions: ['monetization'], estimatedImpact: -5 },
      ],
    });
    mockOpenAICreate.mockResolvedValue(createMockCompletion(JSON.stringify(scores)));

    const result = await scoreIdea('Test', 'Test');
    expect(result!.improvements[0].estimatedImpact).toBe(20);
    expect(result!.improvements[1].estimatedImpact).toBe(1);
  });
});
