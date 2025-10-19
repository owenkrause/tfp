"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Heart } from "lucide-react"

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
  // Upper teeth (right to left from child"s perspective)
  { index: 9, top: "44%", left: "30.5%", width: 4, height: 7, borderRadius: 4 }, // Upper Second Molar (Right)
  { index: 7, top: "43%", left: "33%", width: 4, height: 9, borderRadius: 4 }, // Upper First Molar (Right)
  { index: 5, top: "42%", left: "36%", width: 5, height: 11, borderRadius: 6 }, // Upper Canine (Right)
  { index: 3, top: "41%", left: "40%", width: 8, height: 13, borderRadius: 8 }, // Upper Lateral Incisor (Right)
  { index: 1, top: "41%", left: "46%", width: 11, height: 13, borderRadius: 6 }, // Upper Central Incisor (Right)
  { index: 0, top: "41%", left: "54%", width: 11, height: 13, borderRadius: 6 }, // Upper Central Incisor (Left)
  { index: 2, top: "41%", left: "60%", width: 8, height: 13, borderRadius: 8 }, // Upper Lateral Incisor (Left)
  { index: 4, top: "42%", left: "64%", width: 5, height: 11, borderRadius: 6 }, // Upper Canine (Left)
  { index: 6, top: "43%", left: "67%", width: 4, height: 9, borderRadius: 4 }, // Upper First Molar (Left)
  { index: 8, top: "44%", left: "69.5%", width: 4, height: 7, borderRadius: 4 }, // Upper Second Molar (Left)

  // Lower teeth (right to left from child"s perspective)
  { index: 19, top: "51%", left: "32%", width: 4, height: 8, borderRadius: 6 }, // Lower Second Molar (Right)
  { index: 17, top: "52%", left: "35%", width: 5, height: 8, borderRadius: 6 }, // Lower First Molar (Right)
  { index: 15, top: "54%", left: "38%", width: 6, height: 9, borderRadius: 6 }, // Lower Canine (Right)
  { index: 13, top: "55%", left: "42.5%", width: 6, height: 10, borderRadius: 4 }, // Lower Lateral Incisor (Right)
  { index: 11, top: "55%", left: "47.5%", width: 8, height: 11, borderRadius: 6 }, // Lower Central Incisor (Right)
  { index: 10, top: "55%", left: "52.5%", width: 8, height: 11, borderRadius: 6 }, // Lower Central Incisor (Left)
  { index: 12, top: "55%", left: "57.5%", width: 6, height: 10, borderRadius: 4 }, // Lower Lateral Incisor (Left)
  { index: 14, top: "54%", left: "62%", width: 6, height: 9, borderRadius: 6 }, // Lower Canine (Left)
  { index: 16, top: "52%", left: "65%", width: 5, height: 8, borderRadius: 6 }, // Lower First Molar (Left)
  { index: 18, top: "51%", left: "68%", width: 4, height: 8, borderRadius: 6 }, // Lower Second Molar (Left)
]

export default function ChildPage() {
  const [child, setChild] = useState<Child | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; reason: string } | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
        throw new Error("Child not found")
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      setStream(mediaStream)
      setShowCamera(true)
    } catch (error) {
      console.error("Camera access denied:", error)
      alert("Camera access is required to verify brushing. Please enable camera permissions.")
    }
  }

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [showCamera, stream])

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const base64Image = canvas.toDataURL("image/jpeg")

    stopCamera()
    await verifyImage(base64Image)
  }

  const verifyImage = async (base64Image: string) => {
    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const response = await fetch("/api/verify-brush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          childId: child?.id
        }),
      })

      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationResult({
        verified: false,
        reason: "Failed to verify image"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn || !child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="relative">
          {/* Popup Login Background Image */}
          <Image
            src="/pop_up_login.png"
            alt="Login Popup"
            width={1800}
            height={1918}
            className="w-auto h-auto"
          />
          
          {/* Form positioned over the image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 pt-40">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-52">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-left text-sm font-semibold text-gray-800 block">Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your name" 
                          {...field} 
                          className="bg-white/20 border border-gray-300/30 rounded-lg text-center text-sm font-medium placeholder:text-gray-500 h-10 px-4 focus:bg-white/30 focus:border-purple-400/50 transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyCode"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-left text-sm font-semibold text-gray-800 block">Family Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter family code" 
                          {...field} 
                          className="bg-white/20 border border-gray-300/30 rounded-lg text-center text-sm font-medium placeholder:text-gray-500 h-10 px-4 focus:bg-white/30 focus:border-purple-400/50 transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="bg-red-100/90 text-red-700 p-3 rounded-lg text-sm text-center border border-red-200/50 shadow-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}

                {/* Enter Button Image */}
                <div className="flex justify-center mt-3">
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="hover:scale-110 transition-all duration-300 hover:drop-shadow-lg"
                  >
                    <Image
                      src="/enter_button.png"
                      alt="Enter"
                      width={130}
                      height={45}
                      className="w-auto h-auto"
                    />
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    )
  }

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
            onClick={startCamera}
            className="absolute left-1/8 transition-transform hover:scale-105"
            disabled={isVerifying || showCamera}
          >
            <Image
              src="/brush.png"
              alt="Brush My Teeth"
              width={300}
              height={300}
              className="w-56 h-auto"
            />
          </button>

          {/* Tooth Fairy - positioned to the right of center with floating animation */}
          <div className="absolute right-1/8 animate-hover">
            <Image
              src="/toothfairy_transparent_mouthclosed.png"
              alt="Tooth Fairy"
              width={300}
              height={300}
              className="w-64 h-auto"
            />
          </div>

          {/* Verification Status */}
          {isVerifying && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-gray-200/50">
              <p className="text-sm font-medium">Verifying your brush session...</p>
            </div>
          )}

          {verificationResult && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-gray-200/50 ${
              verificationResult.verified ? "bg-green-100/90" : "bg-red-100/90"
            }`}>
              <p className="text-sm font-semibold">{verificationResult.verified ? "✓ Great job brushing!" : "✗ Unable to verify"}</p>
              <p className="text-xs text-muted-foreground mt-1">{verificationResult.reason}</p>
            </div>
          )}

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-transparent p-6 max-w-2xl w-full">
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Camera Border Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <Image
                        src="/camera_border.png"
                        alt="Camera Border"
                        fill
                        className="object-contain scale-125"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={capturePhoto} className="flex-1" size="lg">
                      📸 Take Photo
                    </Button>
                    <Button onClick={stopCamera} variant="outline" className="flex-1" size="lg">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

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
                              backgroundColor: "#ffffff",
                              boxShadow: "0 0 20px 2px rgba(251, 191, 36, 0.6)",
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