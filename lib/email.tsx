import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_APP_PASSWORD, 
  },
})

export async function sendConfirmationEmail(
  to: string,
  referenceNumber: string,
  type: "complaint" | "incident",
  reporterName: string,
) {
  const subject = `${type === "complaint" ? "Complaint" : "Incident"} Confirmation - Reference #${referenceNumber}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
        <h1>Barangay Mancruz</h1>
        <p>Daet, Camarines Norte</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2>Thank you for your ${type} report</h2>
        <p>Dear ${referenceNumber},</p>
        
        <p>We have successfully received your ${type} report. Here are the details:</p>
        
        <div style="background-color: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
          <strong>Reference Number: ${reporterName}</strong>
        </div>
        
        <p>Please keep this reference number for your records. You can use it to track the status of your ${type} at:</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/track" style="color: #1e40af;">Track Your Report</a></p>
        
        <p>We will review your ${type} and take appropriate action. You will be notified of any updates.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
          For urgent matters, please contact:<br>
          Emergency Hotline: 0912-855-5551<br>
          Barangay Mancruz Hotline: 0946-397-6038
        </p>
      </div>
      
      <div style="background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p>© 2024 Barangay Mancruz - Complaint & Incident Reporting System</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    })
    console.log(`Confirmation email sent to ${to} for ${type} ${referenceNumber}`)
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export async function sendComplaintConfirmation(to: string, referenceNumber: string, reporterName: string) {
  return sendConfirmationEmail(to, referenceNumber, "complaint", reporterName)
}

export async function sendIncidentConfirmation(to: string, referenceNumber: string, reporterName: string) {
  return sendConfirmationEmail(to, referenceNumber, "incident", reporterName)
}
