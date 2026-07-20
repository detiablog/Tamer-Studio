"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import type { PromptTemplate } from "@/features/ai/ai.store";

export function PromptTemplateCard({
  template,
  onToggleFavorite,
  onDuplicate,
}: {
  template: PromptTemplate;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.category}</CardDescription>
          </div>
          <Badge tone={template.favorite ? "success" : "muted"}>{template.favorite ? "Favorite" : "Saved"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
          {template.content}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => onToggleFavorite(template.id)}>
          {template.favorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDuplicate(template.id)}>
          Duplicate
        </Button>
      </CardFooter>
    </Card>
  );
}
