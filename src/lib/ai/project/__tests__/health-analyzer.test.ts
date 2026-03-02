import { describe, it, expect } from 'vitest';
import { calculateHeuristicHealth, ProjectHealthInput } from '@/lib/ai/project/health-analyzer';

function makeInput(overrides: Partial<ProjectHealthInput> = {}): ProjectHealthInput {
  return {
    title: 'Test Project',
    description: 'A test project',
    status: 'ACTIVE',
    milestones: [],
    tasks: [],
    features: [],
    requirements: [],
    ...overrides,
  };
}

describe('calculateHeuristicHealth', () => {
  it('returns 85 for empty project (no tasks penalty)', () => {
    const result = calculateHeuristicHealth(makeInput());
    expect(result.score).toBe(85);
    expect(result.rating).toBe('Excellent');
    expect(result.factors).toContain('No tasks created yet');
  });

  it('penalizes low task completion rate', () => {
    const result = calculateHeuristicHealth(makeInput({
      tasks: [
        { title: 'T1', status: 'TODO', priority: 'HIGH', dueDate: null },
        { title: 'T2', status: 'TODO', priority: 'MEDIUM', dueDate: null },
        { title: 'T3', status: 'TODO', priority: 'LOW', dueDate: null },
        { title: 'T4', status: 'TODO', priority: 'LOW', dueDate: null },
        { title: 'T5', status: 'TODO', priority: 'LOW', dueDate: null },
      ],
    }));
    expect(result.score).toBe(80);
    expect(result.factors.some(f => f.includes('Low task completion'))).toBe(true);
  });

  it('rewards high task completion', () => {
    const result = calculateHeuristicHealth(makeInput({
      tasks: [
        { title: 'T1', status: 'DONE', priority: 'HIGH', dueDate: null },
        { title: 'T2', status: 'DONE', priority: 'HIGH', dueDate: null },
        { title: 'T3', status: 'DONE', priority: 'HIGH', dueDate: null },
        { title: 'T4', status: 'TODO', priority: 'LOW', dueDate: null },
      ],
    }));
    expect(result.score).toBe(100);
    expect(result.factors.some(f => f.includes('Strong task completion'))).toBe(true);
  });

  it('penalizes blocked tasks', () => {
    const result = calculateHeuristicHealth(makeInput({
      tasks: [
        { title: 'T1', status: 'BLOCKED', priority: 'HIGH', dueDate: null },
        { title: 'T2', status: 'DONE', priority: 'HIGH', dueDate: null },
        { title: 'T3', status: 'DONE', priority: 'HIGH', dueDate: null },
        { title: 'T4', status: 'DONE', priority: 'HIGH', dueDate: null },
      ],
    }));
    expect(result.score).toBeLessThan(100);
    expect(result.factors.some(f => f.includes('blocked task'))).toBe(true);
    expect(result.recommendations).toContain('Resolve blocked tasks to unblock progress');
  });

  it('penalizes overdue milestones', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = calculateHeuristicHealth(makeInput({
      tasks: [{ title: 'T1', status: 'DONE', priority: 'HIGH', dueDate: null }],
      milestones: [
        { title: 'M1', status: 'IN_PROGRESS', dueDate: pastDate },
      ],
    }));
    expect(result.score).toBe(90);
    expect(result.factors.some(f => f.includes('overdue milestone'))).toBe(true);
  });

  it('does not penalize completed milestones even if past due', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = calculateHeuristicHealth(makeInput({
      tasks: [{ title: 'T1', status: 'DONE', priority: 'HIGH', dueDate: null }],
      milestones: [
        { title: 'M1', status: 'COMPLETED', dueDate: pastDate },
      ],
    }));
    expect(result.score).toBe(100);
  });

  it('penalizes features without tasks', () => {
    const result = calculateHeuristicHealth(makeInput({
      tasks: [{ title: 'T1', status: 'DONE', priority: 'HIGH', dueDate: null }],
      features: [
        { title: 'F1', isCompleted: false, type: 'FEATURE', taskCount: 0 },
        { title: 'F2', isCompleted: false, type: 'FEATURE', taskCount: 3 },
      ],
    }));
    expect(result.score).toBe(95);
    expect(result.factors.some(f => f.includes('without tasks'))).toBe(true);
  });

  it('returns Critical rating for very low score', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = calculateHeuristicHealth(makeInput({
      tasks: [
        { title: 'T1', status: 'BLOCKED', priority: 'HIGH', dueDate: null },
        { title: 'T2', status: 'BLOCKED', priority: 'HIGH', dueDate: null },
      ],
      milestones: [
        { title: 'M1', status: 'IN_PROGRESS', dueDate: pastDate },
        { title: 'M2', status: 'IN_PROGRESS', dueDate: pastDate },
        { title: 'M3', status: 'IN_PROGRESS', dueDate: pastDate },
      ],
      features: [
        { title: 'F1', isCompleted: false, type: 'FEATURE', taskCount: 0 },
        { title: 'F2', isCompleted: false, type: 'FEATURE', taskCount: 0 },
      ],
      requirements: [
        { statement: 'R1', isCompleted: false, priority: 'HIGH' },
        { statement: 'R2', isCompleted: false, priority: 'HIGH' },
      ],
    }));
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.rating).toBe('Critical');
  });

  it('clamps score to 0-100', () => {
    // Create worst-case scenario
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = calculateHeuristicHealth(makeInput({
      tasks: [
        { title: 'T1', status: 'BLOCKED', priority: 'HIGH', dueDate: null },
      ],
      milestones: Array.from({ length: 15 }, (_, i) => ({
        title: `M${i}`, status: 'IN_PROGRESS', dueDate: pastDate,
      })),
    }));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
