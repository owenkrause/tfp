"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Child, Family } from "./types";

const editChildSchema = z.object({
  dailyBrushGoal: z.number().min(1, "Goal must be at least 1").max(5, "Goal must be 5 or less"),
  priceIncrease: z.number().min(0, "Price increase must be positive"),
  currentToothValue: z.number().min(0, "Tooth value must be positive"),
});

export function ChildCard({ child, family, setFamily }: { child: Child; family: Family; setFamily: (f: Family) => void }) {
  const [editing, setEditing] = useState(false);

  const form = useForm<z.infer<typeof editChildSchema>>({
    resolver: zodResolver(editChildSchema),
    defaultValues: {
      dailyBrushGoal: child.dailyBrushGoal,
      priceIncrease: child.priceIncrease,
      currentToothValue: child.currentToothValue,
    },
  });

  const onSubmit = async (values: z.infer<typeof editChildSchema>) => {
    try {
      const response = await fetch("/api/children", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: child.id,
          ...values,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update child");
      }

      const demoCode = localStorage.getItem("familyDemoCode");
      const familyResponse = await fetch(`/api/family?demoCode=${demoCode}`);
      const { family: updatedFamily } = await familyResponse.json();
      setFamily(updatedFamily);
      setEditing(false);
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to update child",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{child.name}</CardTitle>
            <CardDescription>Age {child.age}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel" : "Edit Config"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {editing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  name="priceIncrease"
                  render={({ field }) => (
                    <FormItem>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentToothValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Tooth Value ($)</FormLabel>
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
              </div>

              {form.formState.errors.root && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold">${child.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tooth Value</p>
                <p className="text-lg font-semibold text-green-600">${child.currentToothValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Goal</p>
                <p className="text-lg font-semibold">{child.dailyBrushGoal}x/day</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Increase</p>
                <p className="text-lg font-semibold">${child.priceIncrease.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {child.transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{transaction.description}</span>
                    <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {child.transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
