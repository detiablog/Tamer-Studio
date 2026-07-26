"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { useLocalizationContext } from "@/providers/localization";

export function AIPageActions() {
  const { t } = useLocalizationContext();
  return <ActionButton>{t("ai.addProvider", "Add Provider")}</ActionButton>;
}
