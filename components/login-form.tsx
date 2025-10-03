"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full bg-blue-900 hover:bg-blue-800 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, setState] = useState<{ error?: string; success?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (state?.success) {
      router.push("/admin")
    }
  }, [state, router])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setState(null)

    try {
      console.log("[v0] Login form: Starting login process")
      const result = await signIn(null, formData)
      console.log("[v0] Login form: Received result:", result)
      setState(result)
    } catch (error) {
      console.log("[v0] Login form: Error occurred:", error)
      setState({ error: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-900" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
        <CardDescription>Barangay Complaint & Incident Reporting System</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@barangay.gov.ph"
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input id="password" name="password" type="password" required className="h-12" />
            </div>
          </div>

          <SubmitButton isLoading={isLoading} />

          <div className="text-center text-sm text-gray-600">
            For admin access only. Contact your system administrator for credentials.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
