"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/parent/OverviewTab";
import { ChildrenTab } from "@/components/parent/ChildrenTab";
import { SettingsTab } from "@/components/parent/SettingsTab";
import { Family } from "@/components/parent/types";

export default function ParentDashboard() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFamily = async () => {
      const demoCode = localStorage.getItem("familyDemoCode");

      if (!demoCode) {
        router.push("/setup");
        return;
      }

      try {
        const response = await fetch(`/api/family?demoCode=${demoCode}`);

        if (!response.ok) {
          throw new Error("Failed to load family");
        }

        const { family } = await response.json();
        setFamily(family);
      } catch (error) {
        console.error("Error loading family:", error);
        router.push("/setup");
      } finally {
        setLoading(false);
      }
    };

    loadFamily();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!family) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{family.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, {family.parentName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Family Code</p>
              <Badge variant="secondary" className="text-sm font-mono mt-1">{family.demoCode}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab family={family} setFamily={setFamily} />
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <ChildrenTab family={family} setFamily={setFamily} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab family={family} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
