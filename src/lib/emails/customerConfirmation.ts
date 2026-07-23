import type { RequestRow } from "@/types/database";

export function buildCustomerConfirmationEmail(req: RequestRow): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = req.full_name.split(" ")[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://needitz.com";

  const subject = `We received your NeedItz request`;

  const text = `Hi ${firstName},

We received your request for:

${req.item_request}

Request ID: ${req.request_number}

Our team is reviewing it now. If we believe we can help, we'll contact you using the information you provided.

Please note: submitting a request does not guarantee availability, pricing, or fulfillment. Any opportunity will be subject to verification and a separate written agreement.

NeedItz
${siteUrl}
`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:24px 32px;border-bottom:3px solid #FFC400;">
            <span style="font-size:22px;font-weight:900;color:#050505;letter-spacing:-0.5px;">NeedItz</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#050505;">Hi ${firstName},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#5E6168;line-height:1.6;">
              We received your request and our team is reviewing it now. If we believe we can help, we'll contact you using the information you provided.
            </p>

            <!-- Request card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">What you requested</p>
                <p style="margin:0 0 16px;font-size:15px;color:#050505;line-height:1.5;">${escapeHtml(req.item_request)}</p>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9A9DA5;">Request ID</p>
                <p style="margin:0;font-size:16px;font-weight:800;color:#050505;">${req.request_number}</p>
              </td></tr>
            </table>

            <p style="margin:0 0 24px;font-size:13px;color:#9A9DA5;line-height:1.6;">
              Submitting a request does not guarantee availability, pricing, or fulfillment. Any opportunity will be subject to verification and a separate written agreement.
            </p>

            <a href="${siteUrl}" style="display:inline-block;background:#050505;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 28px;border-radius:12px;">
              Visit NeedItz
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #D8D8D8;">
            <p style="margin:0;font-size:12px;color:#9A9DA5;">
              NeedItz &bull; <a href="${siteUrl}" style="color:#9A9DA5;">${siteUrl.replace("https://", "")}</a>
            </p>
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
