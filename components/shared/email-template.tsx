import * as React from "react"

interface EmailTemplateProps {
  name: string
  email: string
  subject: string
  message: string
}

export function EmailTemplate({
  name,
  email,
  subject,
  message,
}: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        backgroundColor: "#f6f7f9",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          Nieuw contactformulier bericht 📩
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          Je hebt een nieuwe aanvraag ontvangen via je website.
        </p>

        {/* Details */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ margin: "4px 0" }}>
            <strong>Naam:</strong> {name}
          </p>

          <p style={{ margin: "4px 0" }}>
            <strong>Email:</strong>{" "}
            <a
              href={`mailto:${email}`}
              style={{
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              {email}
            </a>
          </p>

          <p style={{ margin: "4px 0" }}>
            <strong>Onderwerp:</strong> {subject}
          </p>
        </div>

        {/* Message block */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          Dit bericht werd automatisch verzonden via het contactformulier.
        </div>
      </div>
    </div>
  )
}