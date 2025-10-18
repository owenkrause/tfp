"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Family } from "./types";
import { ChildCard } from "./ChildCard";

const addChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthdate: z.date({ message: "Birthdate is required" }),
  dailyBrushGoal: z.number().min(1, "Goal must be at least 1").max(5, "Goal must be 5 or less"),
  priceIncrease: z.number().min(0, "Price increase must be positive"),
  currentToothValue: z.number().min(0, "Tooth value must be positive"),
});

export function ChildrenTab({ family, setFamily }: { family: Family; setFamily: (f: Family) => void }) {
  const [showAddChild, setShowAddChild] = useState(false);

  const form = useForm<z.infer<typeof addChildSchema>>({
    resolver: zodResolver(addChildSchema),
    defaultValues: {
      name: "",
      birthdate: undefined,
      dailyBrushGoal: 2,
      priceIncrease: 0.05,
      currentToothValue: 1.00,
    },
  });

  const onSubmit = async (values: z.infer<typeof addChildSchema>) => {
    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          familyId: family.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add child");
      }

      // Reload family data
      const demoCode = localStorage.getItem("familyDemoCode");
      const familyResponse = await fetch(`/api/family?demoCode=${demoCode}`);
      const { family: updatedFamily } = await familyResponse.json();
      setFamily(updatedFamily);

      // Reset form and close
      form.reset();
      setShowAddChild(false);
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to add child",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Children</h2>
        <Button
          onClick={() => setShowAddChild(!showAddChild)}
          variant={showAddChild ? "outline" : "default"}
        >
          {showAddChild ? "Cancel" : "Add Child"}
        </Button>
      </div>

      {showAddChild && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Child</CardTitle>
            <CardDescription>Add a child to your family and configure their settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Child's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthdate</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dailyBrushGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Brush Goal</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentToothValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Tooth Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priceIncrease"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Price Increase ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Amount added to tooth value when goal is met
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.formState.errors.root && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting ? "Adding Child..." : "Add Child"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {family.children.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">No children added yet. Click &quot;Add Child&quot; to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {family.children.map((child) => (
            <ChildCard key={child.id} child={child} family={family} setFamily={setFamily} />
          ))}
        </div>
      )}
    </div>
  );
}
