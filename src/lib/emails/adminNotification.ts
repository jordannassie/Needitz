import type { RequestRow } from "@/types/database";

export function buildAdminNotificationEmail(req: RequestRow): {
  subject: string;
  html: string;
  text: string;
} {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://needitz.com";
  const priorityLabel = req.priority === "urgent" ? "🔴 URGENT" : req.priority === "high" ? "🟡 HIGH" : "⚪ Normal";
  const adminUrl = `${siteUrl}/admin`;

  const budgetDisplay = req.budget_numeric
    ? `${req.budget} (~$${req.budget_numeric.toLocaleString()})`
    : req.budget;

  const subject = `New NeedItz Request — ${budgetDisplay} — ${req.item_request.slice(0, 60)}${req.item_request.length > 60 ? "…" : ""}`;

  const aiSection = req.ai_summary
    ? `AI Summary: ${req.ai_summary}
AI Score: ${req.ai_score ?? "N/A"}
Recommendation: ${req.ai_recommendation ?? "N/A"}
Risk Flags: ${req.ai_risk_flags?.join(", ") || "None"}
Suggested Questions: ${req.ai_recommended_questions?.join(" | ") || "None"}`
    : `Fallback Score: ${req.fallback_score ?? "N/A"}`;

  const text = `NEW NEEDITZ REQUEST — ${priorityLabel}

Request ID: ${req.request_number}
Customer: ${req.full_name}
Company: ${req.company_name || "Not provided"}
Email: ${req.email}
Phone: ${req.phone}

What they need:
${req.item_request}

Budget: ${budgetDisplay}
Deadline: ${req.deadline_is_flexible ? "Flexible" : req.deadline || "Not specified"}
Delivery: ${req.delivery_location}

Additional details:
${req.additional_details || "None"}

${aiSection}

View in admin: ${adminUrl}
Created: ${new Date(req.created_at).toLocaleString()}
`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:20px 28px;background:#050505;border-bottom:3px solid #FFC400;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;">NeedItz</span>
            <span style="font-size:13px;color:#9A9DA5;margin-left:12px;">Admin Notification</span>
          </td>
        </tr>

        <!-- Priority banner -->
        <tr>
          <td style="padding:12px 28px;background:${req.priority === "urgent" ? "#fee2e2" : req.priority === "high" ? "#fef9c3" : "#f7f7f7"};">
            <p style="margin:0;font-size:13px;font-weight:700;color:#050505;">${priorityLabel} &bull; ${req.request_number}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:28px;">

          <!-- Customer -->
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Customer</p>
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#050505;">${escapeHtml(req.full_name)}${req.company_name ? ` &bull; ${escapeHtml(req.company_name)}` : ""}</p>
          <p style="margin:0 0 20px;font-size:14px;color:#5E6168;">${escapeHtml(req.email)} &bull; ${escapeHtml(req.phone)}</p>

          <!-- Request -->
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Request</p>
          <p style="margin:0 0 20px;font-size:15px;color:#050505;line-height:1.6;background:#f7f7f7;padding:14px 16px;border-radius:8px;">${escapeHtml(req.item_request)}</p>

          <!-- Details grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="width:33%;padding:0 8px 0 0;vertical-align:top;">
                <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Budget</p>
                <p style="margin:0;font-size:14px;color:#050505;">${escapeHtml(budgetDisplay)}</p>
              </td>
              <td style="width:33%;padding:0 8px;vertical-align:top;">
                <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Deadline</p>
                <p style="margin:0;font-size:14px;color:#050505;">${req.deadline_is_flexible ? "Flexible" : escapeHtml(req.deadline ?? "Not specified")}</p>
              </td>
              <td style="width:33%;padding:0 0 0 8px;vertical-align:top;">
                <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Location</p>
                <p style="margin:0;font-size:14px;color:#050505;">${escapeHtml(req.delivery_location)}</p>
              </td>
            </tr>
          </table>

          ${req.additional_details ? `
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Additional Details</p>
          <p style="margin:0 0 20px;font-size:14px;color:#5E6168;line-height:1.6;">${escapeHtml(req.additional_details)}</p>
          ` : ""}

          ${req.ai_summary ? `
          <!-- AI Review -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:8px;margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0369a1;">AI Review</p>
              <p style="margin:0 0 8px;font-size:14px;color:#050505;">${escapeHtml(req.ai_summary)}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#5E6168;">Score: <strong>${req.ai_score ?? "N/A"}/10</strong> &bull; Recommendation: <strong>${req.ai_recommendation ?? "N/A"}</strong></p>
              ${req.ai_risk_flags?.length ? `<p style="margin:4px 0 0;font-size:13px;color:#dc2626;">Flags: ${req.ai_risk_flags.map(escapeHtml).join(", ")}</p>` : ""}
            </td></tr>
          </table>
          ` : `
          <p style="margin:0 0 20px;font-size:13px;color:#9A9DA5;">Fallback Score: ${req.fallback_score ?? "N/A"}/10 (AI unavailable)</p>
          `}

          <a href="${adminUrl}" style="display:inline-block;background:#050505;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:10px;">
            View in Admin →
          </a>

        </td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #D8D8D8;">
            <p style="margin:0;font-size:12px;color:#9A9DA5;">Received ${new Date(req.created_at).toLocaleString()}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
