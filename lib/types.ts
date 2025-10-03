export interface User {
  id: string
  email: string
  full_name: string
  phone_number?: string
  address?: string
  barangay?: string
  role: "resident" | "admin" | "barangay_official"
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: string
  complainant_name: string
  complainant_email?: string
  complainant_phone?: string
  complainant_address: string
  complaint_type: "noise" | "garbage" | "illegal_parking" | "public_safety" | "infrastructure" | "other"
  subject: string
  description: string
  location: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "resolved" | "closed" | "rejected"
  assigned_to?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface Incident {
  id: string
  reporter_name: string
  reporter_email?: string
  reporter_phone?: string
  reporter_address?: string
  incident_type: "accident" | "crime" | "fire" | "flood" | "medical_emergency" | "public_disturbance" | "other"
  title: string
  description: string
  location: string
  incident_date: string
  severity: "low" | "medium" | "high" | "critical"
  status: "reported" | "investigating" | "resolved" | "closed"
  assigned_to?: string
  action_taken?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface ActivityLog {
  id: string
  entity_type: "complaint" | "incident"
  entity_id: string
  action: string
  details?: string
  performed_by?: string
  created_at: string
}
