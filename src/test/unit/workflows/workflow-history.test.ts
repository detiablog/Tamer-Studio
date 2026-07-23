import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryWorkflowHistory } from '@/core/workflows/workflow-history';
import type { WorkflowHistory } from '@/core/workflows/workflow.types';

describe('InMemoryWorkflowHistory', () => {
  let repo: InMemoryWorkflowHistory;

  beforeEach(() => {
    repo = new InMemoryWorkflowHistory();
  });

  const makeHistory = (executionId: string, workflowId: string): WorkflowHistory => ({
    executionId,
    workflowId,
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('saves and finds by id', async () => {
    const history = makeHistory('exec-1', 'wf-1');
    await repo.save(history);
    const found = await repo.findById('exec-1');
    expect(found).toBeDefined();
    expect(found?.executionId).toBe('exec-1');
  });

  it('returns undefined when not found', async () => {
    const found = await repo.findById('unknown');
    expect(found).toBeUndefined();
  });

  it('finds by workflow id', async () => {
    await repo.save(makeHistory('exec-1', 'wf-1'));
    await repo.save(makeHistory('exec-2', 'wf-1'));
    await repo.save(makeHistory('exec-3', 'wf-2'));

    const results = await repo.findByWorkflowId('wf-1');
    expect(results).toHaveLength(2);
  });

  it('deletes by id', async () => {
    await repo.save(makeHistory('exec-1', 'wf-1'));
    await repo.delete('exec-1');
    const found = await repo.findById('exec-1');
    expect(found).toBeUndefined();
  });
});