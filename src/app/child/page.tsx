'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Heart, DollarSign, Trophy } from 'lucide-react'
import { calculateAge } from '@/lib/utils'

type Child = {
  id: string
  name: string
  birthdate: string
  balance: number
  dailyBrushGoal: number
  priceIncrease: number
  currentToothValue: number
  family: {
    id: string
    name: string
    demoCode: string
    parentName: string
  }
  teeth: Array<{
    id: string
    toothType: string
    valueAtLoss: number
    paid: boolean
    paidAt: string | null
    lostDate: string
  }>
  brushSessions: Array<{
    id: string
    timestamp: string
    verified: boolean
  }>
  transactions: Array<{
    id: string
    amount: number
    description: string
    createdAt: string
  }>
}

const loginSchema = z.object({
  name: z.string().min(1, "Name is required"),
  familyCode: z.string().min(1, "Family code is required"),
})

export default function ChildPage() {
  const [child, setChild] = useState<Child | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      familyCode: "",
    },
  })

  // Check localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("childName")
    const savedFamilyCode = localStorage.getItem("childFamilyCode")

    if (savedName && savedFamilyCode) {
      loadChildData(savedName, savedFamilyCode)
    } else {
      setIsChecking(false)
    }
  }, [])

  const loadChildData = async (name: string, familyCode: string) => {
    try {
      const response = await fetch(`/api/child?childName=${encodeURIComponent(name)}&familyCode=${encodeURIComponent(familyCode)}`)

      if (response.ok) {
        const { child: childData } = await response.json()
        setChild(childData)
        setIsLoggedIn(true)
        // Save to localStorage
        localStorage.setItem("childName", name)
        localStorage.setItem("childFamilyCode", familyCode)
      } else {
        throw new Error('Child not found')
      }
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to find child",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    await loadChildData(values.name, values.familyCode)
  }

  const handleLogout = () => {
    localStorage.removeItem("childName")
    localStorage.removeItem("childFamilyCode")
    setChild(null)
    setIsLoggedIn(false)
    form.reset()
  }

  // Show loading while checking localStorage
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Login screen
  if (!isLoggedIn || !child) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl">Welcome!</CardTitle>
            <CardDescription>Enter your name and family code to see your teeth</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
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

                <FormField
                  control={form.control}
                  name="familyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter family code" {...field} />
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
                  {form.formState.isSubmitting ? "Loading..." : "View My Teeth"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalValue = child.teeth.reduce((sum, tooth) => sum + tooth.valueAtLoss, 0)
  const paidTeeth = child.teeth.filter(tooth => tooth.paid).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{child.name}'s Teeth</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Age {calculateAge(child.birthdate)} • Balance: ${child.balance.toFixed(2)}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-muted-foreground">Family: {child.family.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-mono">{child.family.demoCode}</Badge>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teeth</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{child.teeth.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Teeth</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidTeeth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Teeth Collection */}
        <Card>
          <CardHeader>
            <CardTitle>Your Teeth Collection</CardTitle>
            <CardDescription>Track all your lost teeth and their values</CardDescription>
          </CardHeader>
          <CardContent>
            {child.teeth.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No teeth yet!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {child.teeth.map((tooth, index) => (
                  <div
                    key={tooth.id}
                    className="p-4 border rounded-lg text-center space-y-2"
                  >
                    <div className="text-3xl">
                      {tooth.paid ? '✓' : '🦷'}
                    </div>
                    <h3 className="font-semibold">Tooth #{index + 1}</h3>
                    <p className="text-sm text-muted-foreground">{tooth.toothType}</p>
                    <Badge variant={tooth.paid ? "default" : "secondary"}>
                      {tooth.paid ? 'Paid' : `$${tooth.valueAtLoss.toFixed(2)}`}
                    </Badge>
                    {tooth.paid && tooth.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(tooth.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Tooth Value */}
        <Card>
          <CardHeader>
            <CardTitle>Current Tooth Value</CardTitle>
            <CardDescription>
              Each new tooth starts at this value and increases by ${child.priceIncrease.toFixed(2)} when you meet your daily goal!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                ${child.currentToothValue.toFixed(2)}
              </div>
              <Separator className="my-4" />
              <div className="text-sm text-muted-foreground">
                <p>Daily Brush Goal: {child.dailyBrushGoal}x per day</p>
                <p className="mt-1">Keep brushing to increase your tooth value!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        {child.transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {child.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{transaction.description}</span>
                    <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
