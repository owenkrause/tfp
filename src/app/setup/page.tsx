"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Family name is required"),
  parentName: z.string().min(1, "Your name is required"),
});

export default function FamilySetup() {
  const router = useRouter();

  useEffect(() => {
    const existingCode = localStorage.getItem("familyDemoCode");
    if (existingCode) {
      router.push("/parent");
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      parentName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create family");
      }

      const { family } = await response.json();

      // Store demo code in localStorage for demo purposes
      localStorage.setItem("familyDemoCode", family.demoCode);

      router.push("/parent");
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to Tooth Fairy!</CardTitle>
          <CardDescription>Set up your family to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name</FormLabel>
                    <FormControl>
                      <Input placeholder="The Smith Family" {...field} />
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
                      <Input placeholder="John Smith" {...field} />
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
                {form.formState.isSubmitting ? "Creating Family..." : "Create Family"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
