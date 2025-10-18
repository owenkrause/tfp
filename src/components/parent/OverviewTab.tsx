"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Users, Heart } from "lucide-react";
import { calculateAge } from "@/lib/utils";
import { Family } from "./types";

export function OverviewTab({ family, setFamily }: { family: Family; setFamily: (f: Family) => void }) {
  const unpaidTeeth = family.children.flatMap(child =>
    child.teeth.filter(tooth => !tooth.paid).map(tooth => ({
      ...tooth,
      childName: child.name,
      childId: child.id,
    }))
  );

  const totalOwed = unpaidTeeth.reduce((sum, tooth) => sum + tooth.valueAtLoss, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{family.children.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Teeth</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidTeeth.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalOwed.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Teeth */}
      {unpaidTeeth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teeth Ready for Payment</CardTitle>
            <CardDescription>Process payments for lost teeth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidTeeth.map((tooth) => (
                <div key={tooth.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{tooth.childName}</p>
                    <p className="text-sm text-muted-foreground">{tooth.toothType}</p>
                    <p className="text-xs text-muted-foreground">Lost on {new Date(tooth.lostDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold text-green-600">${tooth.valueAtLoss.toFixed(2)}</p>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/purchase", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ toothId: tooth.id, childId: tooth.childId }),
                          });

                          if (response.ok) {
                            const demoCode = localStorage.getItem("familyDemoCode");
                            const familyResponse = await fetch(`/api/family?demoCode=${demoCode}`);
                            const { family: updatedFamily } = await familyResponse.json();
                            setFamily(updatedFamily);
                          }
                        } catch (error) {
                          console.error("Error purchasing tooth:", error);
                        }
                      }}
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Children Quick View */}
      <Card>
        <CardHeader>
          <CardTitle>Children Summary</CardTitle>
          <CardDescription>Overview of all children and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          {family.children.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No children added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {family.children.map((child) => {
                const todaysBrushes = child.brushSessions.filter(session =>
                  new Date(session.timestamp).toDateString() === new Date().toDateString() && session.verified
                ).length;

                return (
                  <div key={child.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">Age {calculateAge(child.birthdate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tooth Value</p>
                        <p className="text-lg font-bold text-green-600">${child.currentToothValue.toFixed(2)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Today&apos;s Brushes:</span>
                        <Badge variant={todaysBrushes >= child.dailyBrushGoal ? "default" : "secondary"}>
                          {todaysBrushes}/{child.dailyBrushGoal}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-medium">${child.balance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
