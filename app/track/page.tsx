"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, FileText, AlertCircle, Clock, CheckCircle, XCircle, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TrackingResult {
  id: string
  reference_number: string
  type: "complaint" | "incident"
  subject?: string
  title?: string
  status: string
  priority?: string
  severity?: string
  location: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolution_notes?: string
  action_taken?: string
}

export default function TrackStatusPage() {
  const [referenceNumber, setReferenceNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referenceNumber.trim()) return

    setIsSearching(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`/api/track/${referenceNumber}?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
      } else {
        setError(data.error || "No record found with this reference number")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "reported":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_progress":
      case "investigating":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
      case "severe":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
      case "minor":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:text-blue-200">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            <Separator orientation="vertical" className="h-6 bg-blue-700" />
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Track Your Report</h1>
              <p className="text-blue-200 text-sm">Check the status of your complaint or incident</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Your Report
              </CardTitle>
              <CardDescription>
                Enter your reference number to check the status of your complaint or incident report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g., CMP-2024-001 or INC-2024-001"
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Search className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track Status
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {result.type === "complaint" ? (
                      <FileText className="h-6 w-6 text-blue-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <CardTitle className="text-xl">{result.subject || result.title}</CardTitle>
                      <CardDescription>
                        Reference: {result.reference_number} • {result.type === "complaint" ? "Complaint" : "Incident"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {(result.priority || result.severity) && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        {result.type === "complaint" ? "Priority" : "Severity"}
                      </Label>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(result.priority || result.severity || "")}>
                          {(result.priority || result.severity || "").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                    <p className="mt-1 text-sm">{result.location}</p>
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-3 block">Timeline</Label>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Report Submitted</p>
                        <p className="text-sm text-gray-600">{formatDate(result.created_at)}</p>
                      </div>
                    </div>

                    {result.updated_at !== result.created_at && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Status Updated</p>
                          <p className="text-sm text-gray-600">{formatDate(result.updated_at)}</p>
                        </div>
                      </div>
                    )}

                    {result.resolved_at && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Resolved</p>
                          <p className="text-sm text-gray-600">{formatDate(result.resolved_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution/Action */}
                {(result.resolution_notes || result.action_taken) && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        {result.type === "complaint" ? "Resolution Notes" : "Action Taken"}
                      </Label>
                      <p className="mt-2 text-sm bg-gray-50 p-3 rounded-lg">
                        {result.resolution_notes || result.action_taken}
                      </p>
                    </div>
                  </>
                )}

                {/* Contact Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-blue-800 mb-2">If you have questions about your report, contact us:</p>
                  <div className="text-sm text-blue-800">
                    <p>📞 Barangay Hotline: 0946-379-6038</p>
                    <p>📧 Email: barangaymancruzmain@gmail.com</p>
                    <p>🏢 Office Hours: Monday-Friday 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information */}
        {!result && !error && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>How to Track Your Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Get Your Reference Number</p>
                    <p className="text-sm text-gray-600">
                      After submitting a complaint or incident, you'll receive a reference number via SMS or email.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Enter Reference Number</p>
                    <p className="text-sm text-gray-600">
                      Type your reference number in the search box above (e.g., CMP-2024-001).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium">View Status</p>
                    <p className="text-sm text-gray-600">
                      See the current status, timeline, and any updates on your report.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
