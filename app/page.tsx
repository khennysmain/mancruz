"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, FileText, Shield, Phone, MapPin, CheckCircle, XCircle, Search, Camera, UserX } from "lucide-react"

interface Purok {
  id: string
  name: string
}

interface Landmark {
  id: string
  name: string
  purok: string
}

export default function BarangayComplaintSystem() {
  const [activeTab, setActiveTab] = useState("complaint")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
    referenceNumber?: string
  }>({ type: null, message: "" })

  const [puroks, setPuroks] = useState<Purok[]>([])
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [selectedPurok, setSelectedPurok] = useState("")
  const [filteredLandmarks, setFilteredLandmarks] = useState<Landmark[]>([])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedPurok) {
      setFilteredLandmarks(landmarks.filter((landmark) => landmark.purok === selectedPurok))
    } else {
      setFilteredLandmarks([])
    }
  }, [selectedPurok, landmarks])

  const loadInitialData = async () => {
    try {
      try {
        const puroksRes = await fetch("/api/puroks")
        if (puroksRes.ok) {
          const puroksData = await puroksRes.json()
          if (Array.isArray(puroksData) && puroksData.length > 0) {
            const uniquePuroks = puroksData.filter(
              (purok, index, self) => index === self.findIndex((p) => p.name === purok.name),
            )
            setPuroks(uniquePuroks)
          } else {
            setPuroks([
              { id: "1", name: "Purok 1" },
              { id: "2", name: "Purok 2" },
              { id: "3", name: "Purok 3" },
              { id: "4", name: "Purok 4" },
            ])
          }
        }
      } catch (error) {
        console.log("[v0] Puroks API not available, using fallback")
        setPuroks([
          { id: "1", name: "Purok 1" },
          { id: "2", name: "Purok 2" },
          { id: "3", name: "Purok 3" },
          { id: "4", name: "Purok 4" },
        ])
      }

      try {
        const landmarksRes = await fetch("/api/landmarks")
        if (landmarksRes.ok) {
          const landmarksData = await landmarksRes.json()
          if (Array.isArray(landmarksData) && landmarksData.length > 0) {
            const uniqueLandmarks = landmarksData.filter(
              (landmark, index, self) =>
                index === self.findIndex((l) => l.name === landmark.name && l.purok === landmark.purok),
            )
            setLandmarks(uniqueLandmarks)
          } else {
            setLandmarks([
              { id: "1", name: "Barangay Hall", purok: "Purok 1" },
              { id: "2", name: "Mancruz Elementary School", purok: "Purok 2" },
              { id: "3", name: "Mancruz Health Center", purok: "Purok 3" },
              { id: "4", name: "Mancruz Chapel", purok: "Purok 4" },
            ])
          }
        }
      } catch (error) {
        console.log("[v0] Landmarks API not available, using fallback")
        // Fallback landmarks - updated to match 4 puroks
        setLandmarks([
          { id: "1", name: "Barangay Hall", purok: "Purok 1" },
          { id: "2", name: "Mancruz Elementary School", purok: "Purok 2" },
          { id: "3", name: "Mancruz Health Center", purok: "Purok 3" },
          { id: "4", name: "Mancruz Chapel", purok: "Purok 4" },
        ])
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validImages = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024, // 5MB limit
    )

    if (validImages.length !== files.length) {
      setSubmitStatus({
        type: "error",
        message: "Some files were rejected. Please ensure all files are images under 5MB.",
      })
    }

    setSelectedImages((prev) => [...prev, ...validImages].slice(0, 3)) // Max 3 images
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent, type: "complaint" | "incident") => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    const formData = new FormData(e.target as HTMLFormElement)

    formData.append("barangay", "Barangay Mancruz, Daet, Camarines Norte")
    formData.append("is_anonymous", isAnonymous.toString())

    // Add images to form data
    selectedImages.forEach((image, index) => {
      formData.append(`image_${index}`, image)
    })

    try {
      const endpoint = type === "complaint" ? "/api/complaints" : "/api/incidents"
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message,
          referenceNumber: result.reference_number,
        })
        ;(e.target as HTMLFormElement).reset()
        setSelectedImages([])
        setIsAnonymous(false)
        setSelectedPurok("")
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to submit. Please try again.",
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Shield className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-2xl font-bold leading-tight">
                  Barangay Mancruz Complaint & Incident Reporting System
                </h1>
                <p className="text-blue-200 text-sm md:text-base mt-1">
                  Daet, Camarines Norte - Republic of the Philippines
                </p>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link href="/track">
                <Button variant="outline" className="bg-white text-blue-900 hover:bg-blue-50 text-sm md:text-base">
                  <Search className="h-4 w-4 mr-2" />
                  Track Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-red-600 text-white py-2 md:py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-sm md:text-base">
            <a href="0939-933-7795" className="flex items-center gap-1 hover:bg-red-700 px-2 py-1 rounded">
              <Phone className="h-4 w-4" />
              <span className="font-semibold">Emergency: 0939-933-7795</span>
            </a>
            <a href="0946-379-6038" className="flex items-center gap-1 hover:bg-red-700 px-2 py-1 rounded">
              <Phone className="h-4 w-4" />
              <span className="font-semibold">Barangay: 0946-379-6038</span>
            </a>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Barangay Mancruz Online Reporting System</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Report complaints and incidents in Barangay Mancruz quickly and efficiently. Your reports help us maintain
            peace, order, and quality of life in our community.
          </p>
        </div>

        {/* Status Message */}
        {submitStatus.type && (
          <div
            className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg flex items-center gap-2 ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {submitStatus.type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <div>
              <p className="font-semibold">{submitStatus.message}</p>
              {submitStatus.referenceNumber && (
                <p className="text-sm">
                  Reference Number: <strong>{submitStatus.referenceNumber}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="complaint" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File a Complaint
              </TabsTrigger>
              <TabsTrigger value="incident" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Report an Incident
              </TabsTrigger>
            </TabsList>

            {/* Complaint Form */}
            <TabsContent value="complaint">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File a Complaint
                  </CardTitle>
                  <CardDescription>
                    Use this form to report non-emergency issues like noise complaints, garbage problems, road
                    maintenance, utilities, or other community concerns in Barangay Mancruz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, "complaint")} className="space-y-6">
                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                      />
                      <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm font-medium">
                        <UserX className="h-4 w-4" />
                        Submit anonymously for privacy and safety
                      </Label>
                    </div>

                    {/* Contact Information - Hidden when anonymous */}
                    {!isAnonymous && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="complainant_name">Full Name *</Label>
                            <Input
                              id="complainant_name"
                              name="complainant_name"
                              required
                              placeholder="Juan Dela Cruz"
                            />
                          </div>
                          <div>
                            <Label htmlFor="complainant_phone">Phone Number *</Label>
                            <Input id="complainant_phone" name="complainant_phone" required placeholder="09123456789" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="complainant_email">Email Address</Label>
                            <Input
                              id="complainant_email"
                              name="complainant_email"
                              type="email"
                              placeholder="juan@email.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="barangay_display">Barangay</Label>
                            <div className="flex h-9 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-700">
                              Mancruz, Daet, Camarines Norte
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="complainant_address">Address within Barangay Mancruz</Label>
                          <Input
                            id="complainant_address"
                            name="complainant_address"
                            placeholder="Street, Purok, or Sitio"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Location Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="purok">Purok *</Label>
                          <Select name="purok" value={selectedPurok} onValueChange={setSelectedPurok} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purok" />
                            </SelectTrigger>
                            <SelectContent>
                              {puroks.map((purok) => (
                                <SelectItem key={purok.id} value={purok.name}>
                                  {purok.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="landmark">Landmark (Optional)</Label>
                          <Input
                            id="landmark"
                            name="landmark"
                            placeholder="Enter nearby landmark (e.g., near Mancruz Health Center)"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="location">Specific Location/Address *</Label>
                        <Input
                          id="location"
                          name="location"
                          required
                          placeholder="Street name, house number, or specific location details"
                        />
                      </div>
                    </div>

                    {/* Complaint Details */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="complaint_type">Complaint Type *</Label>
                        <Select name="complaint_type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complaint type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="noise">Noise Complaint</SelectItem>
                            <SelectItem value="garbage">Garbage/Sanitation</SelectItem>
                            <SelectItem value="illegal_parking">Illegal Parking</SelectItem>
                            <SelectItem value="public_safety">Public Safety</SelectItem>
                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Complaint Title *</Label>
                      <Input id="subject" name="subject" required placeholder="Brief description of the issue" />
                    </div>

                    <div>
                      <Label htmlFor="description">Detailed Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        placeholder="Please provide detailed information about your complaint..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="other_description">Additional Information (Optional)</Label>
                      <Textarea
                        id="other_description"
                        name="other_description"
                        placeholder="Any other relevant details or context..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Attach Images (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="images"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <label htmlFor="images" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Camera className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload images or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each (max 3 images)</p>
                          </div>
                        </label>
                      </div>

                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image) || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Complaint"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incident">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Report an Incident
                  </CardTitle>
                  <CardDescription>
                    Use this form to report incidents like accidents, crimes, fires, floods, medical emergencies, or
                    other urgent situations requiring immediate attention in Barangay Mancruz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, "incident")} className="space-y-6">
                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Checkbox
                        id="incident_anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                      />
                      <Label htmlFor="incident_anonymous" className="flex items-center gap-2 text-sm font-medium">
                        <UserX className="h-4 w-4" />
                        Report anonymously for privacy and safety
                      </Label>
                    </div>

                    {/* Contact Information - Hidden when anonymous */}
                    {!isAnonymous && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reporter_name">Reporter Name *</Label>
                            <Input id="reporter_name" name="reporter_name" required placeholder="Your full name" />
                          </div>
                          <div>
                            <Label htmlFor="reporter_phone">Phone Number *</Label>
                            <Input id="reporter_phone" name="reporter_phone" required placeholder="09123456789" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="reporter_email">Email Address</Label>
                            <Input
                              id="reporter_email"
                              name="reporter_email"
                              type="email"
                              placeholder="your@email.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="incident_barangay_display">Barangay</Label>
                            <div className="flex h-9 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-700">
                              Mancruz, Daet, Camarines Norte
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="reporter_address">Address within Barangay Mancruz</Label>
                          <Input id="reporter_address" name="reporter_address" placeholder="Street, Purok, or Sitio" />
                        </div>
                      </>
                    )}

                    {/* Location Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Incident Location</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="incident_purok">Purok *</Label>
                          <Select name="purok" value={selectedPurok} onValueChange={setSelectedPurok} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purok" />
                            </SelectTrigger>
                            <SelectContent>
                              {puroks.map((purok) => (
                                <SelectItem key={purok.id} value={purok.name}>
                                  {purok.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="incident_landmark">Landmark (Optional)</Label>
                          <Input
                            id="incident_landmark"
                            name="landmark"
                            placeholder="Enter nearby landmark (e.g., near Mancruz Health Center)"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="incident_location">Exact Location *</Label>
                        <Input
                          id="incident_location"
                          name="location"
                          required
                          placeholder="Exact location where incident occurred"
                        />
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div>
                      <Label htmlFor="incident_type">Incident Type *</Label>
                      <Select name="incident_type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accident">Traffic/Vehicle Accident</SelectItem>
                          <SelectItem value="crime">Crime/Theft</SelectItem>
                          <SelectItem value="fire">Fire</SelectItem>
                          <SelectItem value="flood">Flood/Water Damage</SelectItem>
                          <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                          <SelectItem value="public_disturbance">Violence/Disturbance</SelectItem>
                          <SelectItem value="other">Other Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Incident Title *</Label>
                      <Input id="title" name="title" required placeholder="Brief description of the incident" />
                    </div>

                    <div>
                      <Label htmlFor="incident_date">Date & Time Occurred *</Label>
                      <Input id="incident_date" name="incident_date" type="datetime-local" required />
                    </div>

                    <div>
                      <Label htmlFor="incident_description">Detailed Description *</Label>
                      <Textarea
                        id="incident_description"
                        name="description"
                        required
                        placeholder="Please provide detailed information about the incident..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="incident_other_description">Additional Information (Optional)</Label>
                      <Textarea
                        id="incident_other_description"
                        name="other_description"
                        placeholder="Any other relevant details or context..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Attach Images (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="incident_images"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <label htmlFor="incident_images" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Camera className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload images or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each (max 3 images)</p>
                          </div>
                        </label>
                      </div>

                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image) || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="authorities_notified" name="authorities_notified" />
                      <Label htmlFor="authorities_notified">Authorities (Police/Fire/Medical) have been notified</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Report Incident"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Emergency:</strong>{" "}
                  <a href="0912-855-5551" className="text-blue-600 hover:underline">
                    0939-933-7795
                  </a>
                </p>
                <p>
                  <strong>Police:</strong>{" "}
                  <a href="0998-598-5954" className="text-blue-600 hover:underline">
                    0998-598-5954
                  </a>
                </p>
                <p>
                  <strong>Fire:</strong>{" "}
                  <a href="0939-933-7795" className="text-blue-600 hover:underline">
                    0939-933-7795
                  </a>
                </p>
                <p>
                  <strong>Barangay Mancruz:</strong>{" "}
                  <a href="tel:0946-379-6038" className="text-blue-600 hover:underline">
                    0946-379-6038
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Office Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Monday - Friday:</strong> 8:00 AM - 5:00 PM
                </p>
                <p>
                  <strong>Saturday:</strong> 8:00 AM - 12:00 PM
                </p>
                <p>
                  <strong>Sunday:</strong> Closed
                </p>
                <p>
                  <strong>Emergency:</strong> 24/7
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>1. You'll receive a reference number</p>
                <p>2. Your report will be reviewed within 24 hours</p>
                <p>3. Appropriate action will be taken</p>
                <p>4. You'll be updated on the status</p>
                <p className="mt-3">
                  <Link href="/track" className="text-blue-600 hover:underline font-medium">
                    → Track your report status
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Barangay Mancruz Complaint & Incident Reporting System</p>
          <p className="text-gray-400 mt-2">Daet, Camarines Norte - Republic of the Philippines</p>
          <div className="mt-4">
            <Link href="/auth/login" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
