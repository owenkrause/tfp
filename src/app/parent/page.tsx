"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/parent/OverviewTab";
import { ChildrenTab } from "@/components/parent/ChildrenTab";
import { SettingsTab } from "@/components/parent/SettingsTab";
import { Family } from "@/components/parent/types";
import { Heart } from "lucide-react";

const setupSchema = z.object({
  familyName: z.string().min(1, "Family name is required"),
  parentName: z.string().min(1, "Your name is required"),
});

export default function ParentDashboard() {
  const [family, setFamily] = useState<Family | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      familyName: "",
      parentName: "",
    },
  });

  useEffect(() => {
    const savedDemoCode = localStorage.getItem("familyDemoCode");

    if (savedDemoCode) {
      loadFamilyData(savedDemoCode);
    } else {
      setIsChecking(false);
    }
  }, []);

  const loadFamilyData = async (demoCode: string) => {
    try {
      const response = await fetch(`/api/family?demoCode=${encodeURIComponent(demoCode)}`);

      if (response.ok) {
        const { family: familyData } = await response.json();
        setFamily(familyData);
        localStorage.setItem("familyDemoCode", demoCode);
      } else {
        throw new Error("Family not found");
      }
    } catch (error) {
      console.error("Failed to load family:", error);
      localStorage.removeItem("familyDemoCode");
    } finally {
      setIsChecking(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof setupSchema>) => {
    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.familyName,
          parentName: values.parentName,
        }),
      });

      if (response.ok) {
        const { family: newFamily } = await response.json();
        setFamily(newFamily);
        localStorage.setItem("familyDemoCode", newFamily.demoCode);
      } else {
        throw new Error("Failed to create family");
      }
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to create family",
      });
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl">Welcome Parent!</CardTitle>
            <CardDescription>Create your family to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="familyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Smiths" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {form.formState.isSubmitting ? "Creating..." : "Create Family"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
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
