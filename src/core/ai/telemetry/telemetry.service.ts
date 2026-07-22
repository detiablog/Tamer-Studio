import type { TelemetryRecord } from "../runtime/types";

export interface TelemetryService {
  record(record: TelemetryRecord): Promise<void>;
}

export class InMemoryTelemetryService implements TelemetryService {
  private records: TelemetryRecord[] = [];

  async record(record: TelemetryRecord): Promise<void> {
    this.records.push(record);
  }

  getRecords(): TelemetryRecord[] {
    return this.records;
  }

  clear(): void {
    this.records = [];
  }
}
