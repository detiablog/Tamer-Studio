import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTelemetryService } from '@/core/ai/telemetry/telemetry.service';
import type { TelemetryRecord } from '@/core/ai/runtime/types';

describe('InMemoryTelemetryService', () => {
  let service: InMemoryTelemetryService;

  beforeEach(() => {
    service = new InMemoryTelemetryService();
  });

  it('records telemetry', async () => {
    const record: TelemetryRecord = {
      executionId: 'exec-1',
      capabilityId: 'text-generation',
      status: 'success',
      durationMs: 100,
      timestamp: new Date().toISOString(),
    };

    await service.record(record);
    expect(service.getRecords()).toHaveLength(1);
    expect(service.getRecords()[0]).toEqual(record);
  });

  it('retrieves records', async () => {
    const record1: TelemetryRecord = {
      executionId: 'exec-1',
      capabilityId: 'text-generation',
      status: 'success',
      durationMs: 100,
      timestamp: new Date().toISOString(),
    };
    const record2: TelemetryRecord = {
      executionId: 'exec-2',
      capabilityId: 'image-generation',
      status: 'failure',
      durationMs: 200,
      timestamp: new Date().toISOString(),
    };

    await service.record(record1);
    await service.record(record2);
    expect(service.getRecords()).toHaveLength(2);
  });

  it('clears records', async () => {
    const record: TelemetryRecord = {
      executionId: 'exec-1',
      capabilityId: 'text-generation',
      status: 'success',
      durationMs: 100,
      timestamp: new Date().toISOString(),
    };

    await service.record(record);
    service.clear();
    expect(service.getRecords()).toHaveLength(0);
  });
});
