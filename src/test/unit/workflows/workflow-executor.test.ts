import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowExecutor } from '@/core/workflows/workflow-executor';
import type { WorkflowDefinition, WorkflowStep } from '@/core/workflows/workflow.types';

describe('WorkflowExecutor', () => {
  let executor: WorkflowExecutor;

  beforeEach(() => {
    executor = new WorkflowExecutor();
  });

  const makeStep = (id: string, handler: string, dependsOn: string[] = [], retryPolicy?: { maxAttempts: number; backoffMs: number }): WorkflowStep => ({
    id,
    name: `Step ${id}`,
    handler,
    config: {},
    dependsOn,
    retryPolicy,
  });

  const makeDefinition = (steps: WorkflowStep[]): WorkflowDefinition => ({
    id: 'wf-1',
    name: 'Test Workflow',
    description: 'Test workflow',
    version: '1.0.0',
    steps,
    variables: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('executes steps in dependency order', async () => {
    const order: string[] = [];
    executor.registerHandler('handler-a', async () => { order.push('a'); return {}; });
    executor.registerHandler('handler-b', async () => { order.push('b'); return {}; });
    executor.registerHandler('handler-c', async () => { order.push('c'); return {}; });

    const definition = makeDefinition([
      makeStep('a', 'handler-a', []),
      makeStep('b', 'handler-b', ['a']),
      makeStep('c', 'handler-c', ['b']),
    ]);

    const result = await executor.execute(definition, {});
    expect(order).toEqual(['a', 'b', 'c']);
    expect(result.status).toBe('completed');
  });

  it('retries a failed step', async () => {
    let attempts = 0;
    executor.registerHandler('flaky', async () => {
      attempts += 1;
      if (attempts < 2) throw new Error('fail');
      return { value: 1 };
    });

    const definition = makeDefinition([makeStep('a', 'flaky', [], { maxAttempts: 3, backoffMs: 10 })]);

    const result = await executor.execute(definition, {});
    expect(result.status).toBe('completed');
    expect(result.steps.get('a')?.status).toBe('completed');
    expect(result.steps.get('a')?.error).toBeUndefined();
  });

  it('marks workflow as failed after max retries exceeded', async () => {
    executor.registerHandler('always-fail', async () => {
      throw new Error('always');
    });

    const definition = makeDefinition([makeStep('a', 'always-fail', [], { maxAttempts: 2, backoffMs: 10 })]);

    const result = await executor.execute(definition, {});
    expect(result.status).toBe('failed');
    expect(result.steps.get('a')?.status).toBe('failed');
  });

  it('completes a simple workflow', async () => {
    executor.registerHandler('h', async () => ({ ok: true }));

    const definition = makeDefinition([makeStep('a', 'h', [])]);
    const result = await executor.execute(definition, {});

    expect(result.status).toBe('completed');
    expect(result.steps.get('a')?.status).toBe('completed');
    expect(result.steps.get('a')?.output).toEqual({ ok: true });
  });

  it('does not throw when cancelling a non-existent execution', async () => {
    await expect(executor.cancel('non-existent')).resolves.toBeUndefined();
  });

  it('returns proper WorkflowResult', async () => {
    executor.registerHandler('h', async () => ({ ok: true }));

    const definition = makeDefinition([makeStep('a', 'h', [])]);
    const result = await executor.execute(definition, {});

    expect(result.executionId).toBeDefined();
    expect(result.workflowId).toBe('wf-1');
    expect(result.startedAt).toBeDefined();
    expect(result.completedAt).toBeDefined();
    expect(result.context).toBeDefined();
    expect((result.steps.get('a')?.output ?? {}).ok).toBe(true);
  });
});