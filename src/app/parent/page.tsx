"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Users, Heart } from "lucide-react";

type Child = {
  id: string;
  name: string;
  age: number;
  balance: number;
  dailyBrushGoal: number;
  priceIncrease: number;
  currentToothValue: number;
  teeth: Array<{
    id: string;
    toothType: string;
    valueAtLoss: number;
    paid: boolean;
    lostDate: string;
  }>;
  brushSessions: Array<{
    id: string;
    timestamp: string;
    verified: boolean;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
};

type Family = {
  id: string;
  name: string;
  demoCode: string;
  parentName: string;
  children: Child[];
};

export default function ParentDashboard() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFamily = async () => {
      const demoCode = localStorage.getItem("familyDemoCode");

      if (!demoCode) {
        router.push("/parent/setup");
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
        router.push("/parent/setup");
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
            <SettingsTab family={family} setFamily={setFamily} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OverviewTab({ family, setFamily }: { family: Family; setFamily: (f: Family) => void }) {
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
                        <p className="text-sm text-muted-foreground">Age {child.age}</p>
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

function ChildrenTab({ family, setFamily }: { family: Family; setFamily: (f: Family) => void }) {
  const [showAddChild, setShowAddChild] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dailyBrushGoal: "2",
    priceIncrease: "0.05",
    currentToothValue: "1.00",
  });

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          familyId: family.id,
        }),
      });

      if (response.ok) {
        // Reload family data
        const demoCode = localStorage.getItem("familyDemoCode");
        const familyResponse = await fetch(`/api/family?demoCode=${demoCode}`);
        const { family: updatedFamily } = await familyResponse.json();
        setFamily(updatedFamily);

        // Reset form
        setFormData({
          name: "",
          age: "",
          dailyBrushGoal: "2",
          priceIncrease: "0.05",
          currentToothValue: "1.00",
        });
        setShowAddChild(false);
      }
    } catch (error) {
      console.error("Error adding child:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Manage Children</h2>
        <button
          onClick={() => setShowAddChild(!showAddChild)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showAddChild ? "Cancel" : "Add Child"}
        </button>
      </div>

      {showAddChild && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Child</h3>
          <form onSubmit={handleAddChild} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="18"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Brush Goal</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.dailyBrushGoal}
                  onChange={(e) => setFormData({ ...formData, dailyBrushGoal: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Tooth Value ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.currentToothValue}
                  onChange={(e) => setFormData({ ...formData, currentToothValue: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Increase ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.priceIncrease}
                  onChange={(e) => setFormData({ ...formData, priceIncrease: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Amount added to tooth value when goal is met</p>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Add Child
            </button>
          </form>
        </div>
      )}

      {family.children.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No children added yet. Click &quot;Add Child&quot; to get started!</p>
        </div>
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

function ChildCard({ child, family, setFamily }: { child: Child; family: Family; setFamily: (f: Family) => void }) {
  const [editing, setEditing] = useState(false);
  const [config, setConfig] = useState({
    dailyBrushGoal: child.dailyBrushGoal.toString(),
    priceIncrease: child.priceIncrease.toString(),
    currentToothValue: child.currentToothValue.toString(),
  });

  const handleUpdate = async () => {
    try {
      const response = await fetch("/api/children", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: child.id,
          ...config,
        }),
      });

      if (response.ok) {
        const demoCode = localStorage.getItem("familyDemoCode");
        const familyResponse = await fetch(`/api/family?demoCode=${demoCode}`);
        const { family: updatedFamily } = await familyResponse.json();
        setFamily(updatedFamily);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating child:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
            <p className="text-sm text-gray-600">Age {child.age}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            {editing ? "Cancel" : "Edit Config"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Brush Goal</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={config.dailyBrushGoal}
                  onChange={(e) => setConfig({ ...config, dailyBrushGoal: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Increase ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={config.priceIncrease}
                  onChange={(e) => setConfig({ ...config, priceIncrease: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Tooth Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={config.currentToothValue}
                  onChange={(e) => setConfig({ ...config, currentToothValue: e.target.value })}
                />
              </div>
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-semibold text-gray-900">${child.balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tooth Value</p>
              <p className="text-lg font-semibold text-green-600">${child.currentToothValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Goal</p>
              <p className="text-lg font-semibold text-gray-900">{child.dailyBrushGoal}x/day</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price Increase</p>
              <p className="text-lg font-semibold text-gray-900">${child.priceIncrease.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {child.transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{transaction.description}</span>
                <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {child.transactions.length === 0 && (
              <p className="text-sm text-gray-500">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ family }: { family: Family; setFamily: (f: Family) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Family Name</label>
            <p className="text-gray-900">{family.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Parent Name</label>
            <p className="text-gray-900">{family.parentName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Family Access Code</label>
            <p className="text-gray-900 font-mono">{family.demoCode}</p>
            <p className="text-xs text-gray-500 mt-1">Share this code with your children to access their dashboard</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Children submit photos of themselves brushing their teeth</li>
          <li>• AI verifies the photos automatically</li>
          <li>• When daily goals are met, tooth value increases</li>
          <li>• When a tooth is lost, you pay the current tooth value</li>
          <li>• Kids can track their progress and balance</li>
        </ul>
      </div>
    </div>
  );
}
