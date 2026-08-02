import { checklistService } from "./checklist.service";
import { certificationService } from "./certification.service";
import { launchSettingsService } from "./settings.service";

export class LaunchOverviewService {
  async getOverview() {
    const [checklist, certification, settings] = await Promise.all([
      checklistService.getProgress(),
      certificationService.getLatestCertification(),
      launchSettingsService.getSettings(),
    ]);

    return {
      checklist,
      certification: certification ? {
        status: certification.status,
        score: certification.overallScore,
        version: certification.version,
        certifiedAt: certification.certifiedAt,
        certifiedBy: certification.certifiedBy,
      } : null,
      settings: {
        version: settings.launchVersion,
        launchDate: settings.launchDate,
        registrationEnabled: settings.isPublicRegistrationEnabled,
        maintenanceMode: settings.maintenanceMode,
        launchFreeze: settings.launchFreeze,
      },
    };
  }
}

export const launchOverviewService = new LaunchOverviewService();
