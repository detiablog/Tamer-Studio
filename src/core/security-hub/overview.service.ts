import { threatDetectorService } from "./threat-detector.service";
import { secIncidentService } from "./incident.service";
import { sessionMonitorService } from "./session-monitor.service";
import { apiMonitorService } from "./api-monitor.service";
import { uploadMonitorService } from "./upload-monitor.service";
import { complianceService } from "./compliance.service";

export class SecurityOverviewService {
  async getOverview() {
    const [threatStats, incidentStats, sessionStats, apiStats, uploadStats, complianceStats] = await Promise.all([
      threatDetectorService.getStats(),
      secIncidentService.getStats(),
      sessionMonitorService.getStats(),
      apiMonitorService.getStats(),
      uploadMonitorService.getStats(),
      complianceService.getStats(),
    ]);

    return {
      threats: threatStats,
      incidents: incidentStats,
      sessions: sessionStats,
      api: apiStats,
      uploads: uploadStats,
      compliance: complianceStats,
    };
  }
}

export const securityOverviewService = new SecurityOverviewService();
