/**
 * Branded fallback email templates used when the Claude API is unavailable.
 * Built with table-based layout and inline CSS for Gmail, Outlook, Apple Mail.
 */

interface FallbackEmailParams {
  attemptNumber: 1 | 2 | 3
  customerName: string
  businessName: string
  amount: string        // formatted string e.g. "$49.00"
  brandColor: string    // hex e.g. "#c8401a"
  logoUrl?: string
  paymentUrl: string
}

interface FallbackEmailResult {
  subject: string
  html: string
}

const TONE = {
  1: {
    subject: (biz: string) => `Quick heads up about your ${biz} payment`,
    greeting: (name: string) => `Hi ${name || 'there'},`,
    body: (amount: string, biz: string) =>
      `No worries at all — these things happen. We just wanted to let you know that your recent payment of <strong>${amount}</strong> for ${biz} didn't go through. It only takes a moment to update your details and you'll be all set.`,
    cta: 'Update my payment method',
    closing: `No rush, but the sooner the better so there's no interruption to your account.`,
  },
  2: {
    subject: (biz: string) => `Reminder: Your ${biz} payment needs attention`,
    greeting: (name: string) => `Hi ${name || 'there'},`,
    body: (amount: string, biz: string) =>
      `We're following up on your payment of <strong>${amount}</strong> for ${biz} which still hasn't gone through. We'd love to keep your account active — please take a moment to update your payment details.`,
    cta: 'Update payment details',
    closing: `If you have any questions or need help, just reply to this email — we're happy to assist.`,
  },
  3: {
    subject: (biz: string) => `Final notice: Action required for your ${biz} account`,
    greeting: (name: string) => `Hi ${name || 'there'},`,
    body: (amount: string, biz: string) =>
      `This is our final notice regarding your outstanding payment of <strong>${amount}</strong> for ${biz}. To avoid your account being suspended, please update your payment method as soon as possible. We truly want to keep you as a customer.`,
    cta: 'Resolve my payment now',
    closing: `If there's anything we can do to help, please don't hesitate to reach out by replying to this email.`,
  },
}

export function buildFallbackEmail(params: FallbackEmailParams): FallbackEmailResult {
  const { attemptNumber, customerName, businessName, amount, brandColor, logoUrl, paymentUrl } = params
  const tone = TONE[attemptNumber]
  const color = brandColor || '#c8401a'
  const firstName = customerName?.split(' ')[0] || 'there'

  const subject = tone.subject(businessName)

  const logoBlock = logoUrl
    ? `<tr>
        <td align="left" style="padding:28px 40px 0 40px;">
          <img src="${logoUrl}" alt="${businessName}" width="auto" height="32"
            style="display:block;height:32px;width:auto;max-width:160px;object-fit:contain;border:0;" />
        </td>
      </tr>`
    : `<tr>
        <td align="left" style="padding:28px 40px 0 40px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#0f0e0c;text-decoration:none;">
            ${businessName}<span style="color:${color};">.</span>
          </span>
        </td>
      </tr>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f2ec;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
    style="background-color:#f5f2ec;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Email card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;
                 border:1px solid #ddd8ce;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td height="4" style="background-color:${color};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo / business name -->
          ${logoBlock}

          <!-- Divider -->
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td height="1" style="background-color:#ede9e0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;
                       line-height:1.6;color:#0f0e0c;">
              <p style="margin:0 0 16px 0;">${tone.greeting(firstName)}</p>
              <p style="margin:0 0 24px 0;color:#3d3a35;">${tone.body(amount, businessName)}</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="left" style="padding:0 40px 24px 40px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                href="${paymentUrl}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="18%"
                strokecolor="${color}" fillcolor="${color}">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">
                  ${tone.cta}
                </center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${paymentUrl}"
                style="display:inline-block;background-color:${color};color:#ffffff;
                       font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;
                       text-decoration:none;padding:12px 28px;border-radius:8px;
                       mso-hide:all;-webkit-text-size-adjust:none;">
                ${tone.cta}
              </a>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Closing note -->
          <tr>
            <td style="padding:0 40px 28px 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;
                       line-height:1.6;color:#7a756c;">
              <p style="margin:0 0 16px 0;">${tone.closing}</p>
              <p style="margin:0;">— The ${businessName} team</p>
            </td>
          </tr>

          <!-- Footer divider -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td height="1" style="background-color:#ede9e0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px 40px 24px 40px;font-family:Arial,Helvetica,sans-serif;
                                      font-size:11px;color:#7a756c;line-height:1.5;">
              Sent by ${businessName} &bull; Powered by
              <a href="https://revorva.com" style="color:${color};text-decoration:none;">Revorva</a>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`

  return { subject, html }
}
