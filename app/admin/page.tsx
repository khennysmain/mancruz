"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, FileText, AlertCircle, Clock, CheckCircle, LogOut, ImageIcon, UserX, MapPin } from "lucide-react"
import { signOut } from "@/lib/actions"
import type { Complaint, Incident } from "@/lib/types"
import type { HTMLFormElement } from "react"

interface FileAttachment {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [complaintAttachments, setComplaintAttachments] = useState<FileAttachment[]>([])
  const [incidentAttachments, setIncidentAttachments] = useState<FileAttachment[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [purokFilter, setPurokFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchComplaints()
    fetchIncidents()
  }, [statusFilter, searchTerm, purokFilter])

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)
      if (purokFilter !== "all") params.append("purok", purokFilter)

      const response = await fetch(`/api/complaints?${params}`)
      const data = await response.json()
      if (response.ok) {
        setComplaints(data.complaints || [])
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)
      if (purokFilter !== "all") params.append("purok", purokFilter)

      const response = await fetch(`/api/incidents?${params}`)
      const data = await response.json()
      if (response.ok) {
        setIncidents(data.incidents || [])
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    }
  }

  const updateComplaintStatus = async (complaintId: string, updates: any) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchComplaints()
        setSelectedComplaint(null)
      }
    } catch (error) {
      console.error("Failed to update complaint:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const updateIncidentStatus = async (incidentId: string, updates: any) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchIncidents()
        setSelectedIncident(null)
      }
    } catch (error) {
      console.error("Failed to update incident:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchFileAttachments = async (reportId: string, reportType: "complaint" | "incident") => {
    try {
      const response = await fetch(`/api/attachments?reportId=${reportId}&reportType=${reportType}`)
      const data = await response.json()
      if (response.ok) {
        return data.attachments || []
      }
    } catch (error) {
      console.error("Failed to fetch attachments:", error)
    }
    return []
  }

  const handleComplaintSelect = async (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    const attachments = await fetchFileAttachments(complaint.id, "complaint")
    setComplaintAttachments(attachments)
  }

  const handleIncidentSelect = async (incident: Incident) => {
    setSelectedIncident(incident)
    const attachments = await fetchFileAttachments(incident.id, "incident")
    setIncidentAttachments(attachments)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalComplaints = complaints.length
  const totalIncidents = incidents.length
  const pendingCount =
    complaints.filter((c) => c.status === "pending").length + incidents.filter((i) => i.status === "reported").length
  const resolvedCount =
    complaints.filter((c) => c.status === "resolved").length + incidents.filter((i) => i.status === "resolved").length
  const anonymousCount =
    complaints.filter((c) => c.is_anonymous).length + incidents.filter((i) => i.is_anonymous).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-200">Barangay Mancruz Complaint & Incident Management</p>
              </div>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="outline" className="bg-white text-blue-900 hover:bg-blue-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComplaints}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncidents}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedCount}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anonymous</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anonymousCount}</div>
              <p className="text-xs text-muted-foreground">Privacy protected</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search complaints and incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={purokFilter} onValueChange={setPurokFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by purok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Puroks</SelectItem>
              <SelectItem value="Purok 1">Purok 1</SelectItem>
              <SelectItem value="Purok 2">Purok 2</SelectItem>
              <SelectItem value="Purok 3">Purok 3</SelectItem>
              <SelectItem value="Purok 4">Purok 4</SelectItem>
              <SelectItem value="Purok 5">Purok 5</SelectItem>
              <SelectItem value="Purok 6">Purok 6</SelectItem>
              <SelectItem value="Purok 7">Purok 7</SelectItem>
              <SelectItem value="Purok 8">Purok 8</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="complaints" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
          </TabsList>

          <TabsContent value="complaints" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>Manage and track complaint status</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-center py-4">Loading complaints...</p>
                  ) : complaints.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No complaints found</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {complaints.map((complaint) => (
                        <div
                          key={complaint.id}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedComplaint?.id === complaint.id ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => handleComplaintSelect(complaint)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              {complaint.subject}
                              {complaint.is_anonymous && (
                                <UserX className="h-3 w-3 text-gray-500" title="Anonymous Report" />
                              )}
                            </h4>
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2 space-y-1">
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {complaint.purok && `${complaint.purok} - `}
                              {complaint.location}
                            </p>
                            {complaint.landmark && <p className="text-gray-500">Near: {complaint.landmark}</p>}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatDate(complaint.created_at)}</span>
                            <div className="flex items-center gap-2">
                              {complaint.is_anonymous ? (
                                <Badge variant="outline" className="text-xs">
                                  Anonymous
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {complaint.complainant_name || "Named"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Ref: {complaint.reference_number}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Complaint Details</CardTitle>
                  <CardDescription>Update complaint status and add notes</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedComplaint ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          {selectedComplaint.subject}
                          {selectedComplaint.is_anonymous && (
                            <Badge variant="outline" className="text-xs">
                              <UserX className="h-3 w-3 mr-1" />
                              Anonymous
                            </Badge>
                          )}
                        </h4>
                        {!selectedComplaint.is_anonymous && (
                          <>
                            <p className="text-sm text-gray-600 mb-1">Reporter: {selectedComplaint.complainant_name}</p>
                            <p className="text-sm text-gray-600 mb-1">Phone: {selectedComplaint.complainant_phone}</p>
                            {selectedComplaint.complainant_email && (
                              <p className="text-sm text-gray-600 mb-1">Email: {selectedComplaint.complainant_email}</p>
                            )}
                          </>
                        )}
                        <div className="text-sm text-gray-600 mb-1 space-y-1">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location: {selectedComplaint.purok && `${selectedComplaint.purok} - `}
                            {selectedComplaint.location}
                          </p>
                          {selectedComplaint.landmark && (
                            <p className="text-gray-500 ml-4">Near: {selectedComplaint.landmark}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Date: {formatDate(selectedComplaint.created_at)}</p>
                        <p className="text-sm text-gray-600 mb-2">Ref: {selectedComplaint.reference_number}</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <strong>Description:</strong> {selectedComplaint.description}
                        </div>
                        {selectedComplaint.other_description && (
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <strong>Additional Info:</strong> {selectedComplaint.other_description}
                          </div>
                        )}
                      </div>

                      {complaintAttachments.length > 0 && (
                        <div>
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Evidence Images ({complaintAttachments.length})
                          </h5>
                          <div className="grid grid-cols-3 gap-2">
                            {complaintAttachments.map((attachment) => (
                              <div key={attachment.id} className="relative group">
                                <div className="w-full h-20 bg-gray-100 rounded border cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden">
                                  <img
                                    src={attachment.file_url || "/placeholder.svg"}
                                    alt={attachment.file_name}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    onClick={() => setSelectedImage(attachment.file_url)}
                                    onError={(e) => {
                                      console.log("[v0] Image failed to load:", attachment.file_url)
                                      console.log("[v0] Error details:", e)
                                      e.currentTarget.style.display = "none"
                                      const parent = e.currentTarget.parentElement
                                      if (parent) {
                                        parent.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-xs text-red-500 bg-red-50">Failed to load</div>`
                                      }
                                    }}
                                    onLoad={() => {
                                      console.log("[v0] Image loaded successfully:", attachment.file_url)
                                    }}
                                    style={{ display: "block" }}
                                  />
                                  <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded opacity-75 hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Open
                                  </a>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                                  {attachment.file_name}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <strong>Debug URLs:</strong>
                            {complaintAttachments.map((attachment, index) => (
                              <div key={attachment.id} className="mt-1">
                                <span className="font-mono">{index + 1}. </span>
                                <a
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {attachment.file_url}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.target as HTMLFormElement)
                          updateComplaintStatus(selectedComplaint.id, {
                            status: formData.get("status"),
                            assigned_to: formData.get("assigned_to"),
                            resolution_notes: formData.get("resolution_notes"),
                            performed_by: "Admin",
                          })
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="status">Update Status</Label>
                          <Select name="status" defaultValue={selectedComplaint.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="assigned_to">Assign To</Label>
                          <Input
                            name="assigned_to"
                            placeholder="Officer name"
                            defaultValue={selectedComplaint.assigned_to || ""}
                          />
                        </div>

                        <div>
                          <Label htmlFor="resolution_notes">Resolution Notes</Label>
                          <Textarea
                            name="resolution_notes"
                            placeholder="Add notes about resolution..."
                            rows={3}
                            defaultValue={selectedComplaint.resolution_notes || ""}
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isUpdating}>
                          {isUpdating ? "Updating..." : "Update Complaint"}
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <p className="text-gray-500">Select a complaint to view details</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>Monitor and manage incident reports</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-center py-4">Loading incidents...</p>
                  ) : incidents.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No incidents found</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {incidents.map((incident) => (
                        <div
                          key={incident.id}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedIncident?.id === incident.id ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => handleIncidentSelect(incident)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              {incident.title}
                              {incident.is_anonymous && (
                                <Badge variant="outline" className="text-xs">
                                  <UserX className="h-3 w-3 text-gray-500" title="Anonymous Report" />
                                </Badge>
                              )}
                            </h4>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2 space-y-1">
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.purok && `${incident.purok} - `}
                              {incident.location}
                            </p>
                            {incident.landmark && <p className="text-gray-500">Near: {incident.landmark}</p>}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatDate(incident.created_at)}</span>
                            <div className="flex items-center gap-2">
                              {incident.is_anonymous ? (
                                <Badge variant="outline" className="text-xs">
                                  Anonymous
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {incident.reporter_name || "Named"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Ref: {incident.reference_number}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Incident Details</CardTitle>
                  <CardDescription>Update incident status and add action notes</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedIncident ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          {selectedIncident.title}
                          {selectedIncident.is_anonymous && (
                            <Badge variant="outline" className="text-xs">
                              <UserX className="h-3 w-3 mr-1" />
                              Anonymous
                            </Badge>
                          )}
                        </h4>
                        {!selectedIncident.is_anonymous && (
                          <>
                            <p className="text-sm text-gray-600 mb-1">Reporter: {selectedIncident.reporter_name}</p>
                            <p className="text-sm text-gray-600 mb-1">Phone: {selectedIncident.reporter_phone}</p>
                            {selectedIncident.reporter_email && (
                              <p className="text-sm text-gray-600 mb-1">Email: {selectedIncident.reporter_email}</p>
                            )}
                          </>
                        )}
                        <div className="text-sm text-gray-600 mb-1 space-y-1">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location: {selectedIncident.purok && `${selectedIncident.purok} - `}
                            {selectedIncident.location}
                          </p>
                          {selectedIncident.landmark && (
                            <p className="text-gray-500 ml-4">Near: {selectedIncident.landmark}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Occurred: {formatDate(selectedIncident.incident_date)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Reported: {formatDate(selectedIncident.created_at)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">Ref: {selectedIncident.reference_number}</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <strong>Description:</strong> {selectedIncident.description}
                        </div>
                        {selectedIncident.other_description && (
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <strong>Additional Info:</strong> {selectedIncident.other_description}
                          </div>
                        )}
                      </div>

                      {incidentAttachments.length > 0 && (
                        <div>
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Evidence Images ({incidentAttachments.length})
                          </h5>
                          <div className="grid grid-cols-3 gap-2">
                            {incidentAttachments.map((attachment) => (
                              <div key={attachment.id} className="relative group">
                                <div className="w-full h-20 bg-gray-100 rounded border cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden">
                                  <img
                                    src={attachment.file_url || "/placeholder.svg"}
                                    alt={attachment.file_name}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    onClick={() => setSelectedImage(attachment.file_url)}
                                    onError={(e) => {
                                      console.log("[v0] Image failed to load:", attachment.file_url)
                                      console.log("[v0] Error details:", e)
                                      e.currentTarget.style.display = "none"
                                      const parent = e.currentTarget.parentElement
                                      if (parent) {
                                        parent.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-xs text-red-500 bg-red-50">Failed to load</div>`
                                      }
                                    }}
                                    onLoad={() => {
                                      console.log("[v0] Image loaded successfully:", attachment.file_url)
                                    }}
                                    style={{ display: "block" }}
                                  />
                                  <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded opacity-75 hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Open
                                  </a>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                                  {attachment.file_name}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <strong>Debug URLs:</strong>
                            {incidentAttachments.map((attachment, index) => (
                              <div key={attachment.id} className="mt-1">
                                <span className="font-mono">{index + 1}. </span>
                                <a
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {attachment.file_url}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.target as HTMLFormElement)
                          updateIncidentStatus(selectedIncident.id, {
                            status: formData.get("status"),
                            assigned_to: formData.get("assigned_to"),
                            action_taken: formData.get("action_taken"),
                            performed_by: "Admin",
                          })
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="status">Update Status</Label>
                          <Select name="status" defaultValue={selectedIncident.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reported">Reported</SelectItem>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="assigned_to">Assign To</Label>
                          <Input
                            name="assigned_to"
                            placeholder="Officer name"
                            defaultValue={selectedIncident.assigned_to || ""}
                          />
                        </div>

                        <div>
                          <Label htmlFor="action_taken">Action Taken</Label>
                          <Textarea
                            name="action_taken"
                            placeholder="Describe actions taken..."
                            rows={3}
                            defaultValue={selectedIncident.action_taken || ""}
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isUpdating}>
                          {isUpdating ? "Updating..." : "Update Incident"}
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <p className="text-gray-500">Select an incident to view details</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Evidence Image</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              {selectedImage && (
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Evidence"
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                  onError={(e) => {
                    console.log("[v0] Modal image failed to load:", selectedImage)
                    e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Image+Not+Found"
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
