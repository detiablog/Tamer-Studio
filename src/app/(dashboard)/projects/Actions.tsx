"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { useLocalizationContext } from "@/providers/localization";

export function ProjectsActions() {
  const { t } = useLocalizationContext();
  return <ActionButton>{t("projects.newProject", "New Project")}</ActionButton>;
}
