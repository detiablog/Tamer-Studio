"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" />
        </div>

        <Button className="w-full">
          Create Account
        </Button>
      </CardContent>
    </Card>
  );
}