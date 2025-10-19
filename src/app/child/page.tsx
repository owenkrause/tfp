'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Heart, LogOut } from 'lucide-react'
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

// Tooth positions mapped to the actual mouth image
const toothPositions = [
  // Upper teeth (right to left from child's perspective)
  { index: 9, top: '44%', left: '30.5%', width: 4, height: 7, borderRadius: 4 }, // Upper Second Molar (Right)
  { index: 7, top: '43%', left: '33%', width: 4, height: 9, borderRadius: 4 }, // Upper First Molar (Right)
  { index: 5, top: '42%', left: '36%', width: 5, height: 11, borderRadius: 6 }, // Upper Canine (Right)
  { index: 3, top: '41%', left: '40%', width: 8, height: 13, borderRadius: 8 }, // Upper Lateral Incisor (Right)
  { index: 1, top: '41%', left: '46%', width: 11, height: 13, borderRadius: 6 }, // Upper Central Incisor (Right)
  { index: 0, top: '41%', left: '54%', width: 11, height: 13, borderRadius: 6 }, // Upper Central Incisor (Left)
  { index: 2, top: '41%', left: '60%', width: 8, height: 13, borderRadius: 8 }, // Upper Lateral Incisor (Left)
  { index: 4, top: '42%', left: '64%', width: 5, height: 11, borderRadius: 6 }, // Upper Canine (Left)
  { index: 6, top: '43%', left: '67%', width: 4, height: 9, borderRadius: 4 }, // Upper First Molar (Left)
  { index: 8, top: '44%', left: '69.5%', width: 4, height: 7, borderRadius: 4 }, // Upper Second Molar (Left)

  // Lower teeth (right to left from child's perspective)
  { index: 19, top: '51%', left: '32%', width: 4, height: 8, borderRadius: 6 }, // Lower Second Molar (Right)
  { index: 17, top: '52%', left: '35%', width: 5, height: 8, borderRadius: 6 }, // Lower First Molar (Right)
  { index: 15, top: '54%', left: '38%', width: 6, height: 9, borderRadius: 6 }, // Lower Canine (Right)
  { index: 13, top: '55%', left: '42.5%', width: 6, height: 10, borderRadius: 4 }, // Lower Lateral Incisor (Right)
  { index: 11, top: '55%', left: '47.5%', width: 8, height: 11, borderRadius: 6 }, // Lower Central Incisor (Right)
  { index: 10, top: '55%', left: '52.5%', width: 8, height: 11, borderRadius: 6 }, // Lower Central Incisor (Left)
  { index: 12, top: '55%', left: '57.5%', width: 6, height: 10, borderRadius: 4 }, // Lower Lateral Incisor (Left)
  { index: 14, top: '54%', left: '62%', width: 6, height: 9, borderRadius: 6 }, // Lower Canine (Left)
  { index: 16, top: '52%', left: '65%', width: 5, height: 8, borderRadius: 6 }, // Lower First Molar (Left)
  { index: 18, top: '51%', left: '68%', width: 4, height: 8, borderRadius: 6 }, // Lower Second Molar (Left)
]

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

  const paidTeeth = child.teeth.filter(tooth => tooth.paid).length

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="relative flex items-center justify-center w-full">
          {/* Brush Teeth Button - positioned to the left of center */}
          <button
            onClick={() => {
              // Functionality will be added later
            }}
            className="absolute left-1/8 transition-transform hover:scale-105"
          >
            <Image
              src="/brush.png"
              alt="Brush My Teeth"
              width={300}
              height={300}
              className="w-56 h-auto"
            />
          </button>

          {/* Mouth Diagram - centered */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/mouth.png"
                alt="Mouth diagram"
                fill
                className="object-contain"
                priority
              />

              <TooltipProvider>
                {toothPositions.map((pos) => {
                  const tooth = child.teeth[pos.index]
                  if (!tooth) return null

                  return (
                    <Tooltip key={tooth.id}>
                      <TooltipTrigger asChild>
                        <button
                          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary group"
                          style={{
                            top: pos.top,
                            left: pos.left,
                            width: `${pos.width * 4}px`,
                            height: `${pos.height * 4}px`,
                            borderRadius: `${pos.borderRadius}px`,
                          }}
                        >
                          <span className="sr-only">{tooth.toothType}</span>
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                            style={{
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 20px 2px rgba(251, 191, 36, 0.6)',
                              borderRadius: `${pos.borderRadius}px`,
                            }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{tooth.toothType}</p>
                          <p className="text-sm">Value: ${tooth.valueAtLoss.toFixed(2)}</p>
                          {tooth.paid && <p className="text-sm">✓ Lost</p> }
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
