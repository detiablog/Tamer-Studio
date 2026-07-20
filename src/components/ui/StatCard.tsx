"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

export function StatCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{delta}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
