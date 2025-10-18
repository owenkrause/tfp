"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Family } from "./types";

export function SettingsTab({ family }: { family: Family }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>Your family details and access code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Family Name</Label>
            <p className="text-sm">{family.name}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Parent Name</Label>
            <p className="text-sm">{family.parentName}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Family Access Code</Label>
            <Badge variant="secondary" className="font-mono text-base">{family.demoCode}</Badge>
            <p className="text-xs text-muted-foreground">Share this code with your children to access their dashboard</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Children submit photos of themselves brushing their teeth</li>
            <li>• AI verifies the photos automatically</li>
            <li>• When daily goals are met, tooth value increases</li>
            <li>• When a tooth is lost, you pay the current tooth value</li>
            <li>• Kids can track their progress and balance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
