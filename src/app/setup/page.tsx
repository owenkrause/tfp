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
import Image from "next/image";

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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="relative">
        {/* Popup Login Background Image */}
        <Image
          src="/pop_up_login.png"
          alt="Login Popup"
          width={1800}
          height={2129}
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
                    <FormLabel className="text-left text-sm font-semibold text-gray-800 block">Family Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="The Smith Family" 
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
                name="parentName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-left text-sm font-semibold text-gray-800 block">Your Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Smith" 
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
  );
}
