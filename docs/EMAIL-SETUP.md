# ZeptoMail API setup

The enquiry form already sends two separate branded emails with a shared reference: the company notification first, then the visitor acknowledgement. Delivery now supports Zoho CPaaS / ZeptoMail API without changing the form, spam controls or templates.

Set these server-only values in `.env.local` locally, and in Vercel environment settings for the deployment environment:

```dotenv
MAIL_DRIVER=zeptomail
ZEPTOMAIL_TOKEN="YOUR_REAL_ZOHO_AGENT_SEND_TOKEN"
ZEPTOMAIL_FROM_EMAIL="noreply@daramanihot.com.ng"
ENQUIRY_TO="daramanihot@gmail.com,info@daramanihot.com"
NEXT_PUBLIC_SITE_URL="https://www.daramanihot.com.ng"
```

The sender above is an example: confirm it is authorised on the verified Zoho domain. `@daramanihot.com.ng` alone is incomplete. Copy the real agent send token from Zoho, not the masked `********` sample; raw and `Zoho-enczapikey ...` formats are accepted. The supplied Seun address is a test recipient, not the default company destination. No SMTP password is required for API delivery. No new SDK dependency is required: the adapter calls the same REST endpoint as `SendMailClient.sendMail`.

Both emails use the same configured sender. Company notification Reply-To is the visitor; acknowledgement Reply-To is `ENQUIRY_TO`. HTML escaping and existing anti-autoresponder headers are preserved. The existing `acknowledged` API response and form feedback distinguish acknowledgement failure from enquiry failure. A failed company notification returns an error and skips the acknowledgement. A failed acknowledgement keeps enquiry success. No automatic retries are made because a timeout can occur after acceptance. Zoho acceptance does not confirm inbox delivery; check final status in Zoho logs.

After setting variables, restart locally or redeploy on Vercel. Run `pnpm launch:check`; existing photo/team blockers are separate from mail configuration. For a live check, use a controlled company recipient and visitor inbox and verify receipt of both emails and Reply-To addresses. Never commit actual tokens. `MAIL_DRIVER=json` sends nothing and is only for tests. Existing SMTP settings remain supported when `MAIL_DRIVER=smtp` is explicitly selected (or no Zepto token/driver is configured).

The remaining sections describe legacy SMTP and mailbox provisioning, which are optional for ZeptoMail API delivery.

---

# Email setup: enquiry form, notifications, auto-replies and webmail

Scope reference: section 4.5 (contact form) and 4.6 (emailing system and the
five webmail accounts).

## How an enquiry flows

1. The visitor submits the form on `/contact`.
2. `POST /api/enquiry` checks the request (size, type, origin, rate limit, bot
   traps), validates the fields with the same rules the browser used, and
   assigns a reference such as `DM-261014-K7QX`.
3. The site records the enquiry: one structured log line (reference, service,
   time, no personal data) plus the full notification email in the
   Dara-Manihot mailbox.
4. Dara-Manihot receives the notification at `ENQUIRY_TO`. Its Reply-To is the
   visitor, so pressing Reply answers them directly.
5. The visitor receives a branded acknowledgement quoting the same reference.

If the notification cannot be sent, the visitor is told so and shown the direct
email and phone details. Nothing is reported as sent when it was not. If only
the acknowledgement fails (for example a mistyped address), the enquiry is
still delivered, and the visitor sees a note to check their address.

## 1. Create the five webmail accounts

Proposed addresses are in `scripts/webmail-accounts.json`. **Confirm the five
names with the client first.**

| Address | Purpose |
| --- | --- |
| `sales@` | Sales and quotations |
| `projects@` | Project coordination and delivery |
| `partnerships@` | Partners, universities and agencies |
| `accounts@` | Invoices and payments |
| `noreply@` | Sender for website enquiry emails (`SMTP_USER`) |

`info@daramanihot.com.ng` already exists and was the original single enquiry destination.

### Option A: cPanel hosting (scripted)

Create an API token in cPanel under Security, Manage API Tokens, then:

```bash
export CPANEL_HOST=server.example.com:2083 CPANEL_USER=youruser CPANEL_TOKEN=...
pnpm webmail:provision            # dry run: lists what would be created
pnpm webmail:provision -- --apply # creates the missing accounts
```

The script is safe to re-run: existing accounts are skipped, never changed.
Passwords are generated locally and written once to `webmail-credentials.txt`
(owner-only permissions, git ignored). Hand them over securely and delete the
file. They are never printed or logged.

### Option B: any other host (manual)

Create the five mailboxes in the host's email panel using the table above,
with generated passwords of 16 characters or more, and a quota of 1 to 2 GB.

## 2. Configure sending from the site

Copy `.env.example` to `.env.local` (local) or set the same variables in the
host's environment settings (production):

| Variable | Notes |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Usually `mail.daramanihot.com.ng`, 465, true. Use 587 with `SMTP_SECURE=false` for STARTTLS |
| `SMTP_USER`, `SMTP_PASS` | The `noreply@` mailbox |
| `MAIL_FROM` | Sender shown on both emails. Keep it on the same domain as `SMTP_USER` |
| `ENQUIRY_TO` | Where notifications go. Defaults to both organisation inboxes |
| `NEXT_PUBLIC_SITE_URL` | Used for the logo inside emails. Set to the staging URL while on staging |

The site works with Google Workspace, Zoho and Microsoft 365 too: change the
host and credentials only. No code change.

## 3. DNS records so the emails reach inboxes

Without these, acknowledgements may land in spam. Ask the host or domain
registrar to confirm each one:

- **SPF**: a TXT record on the domain authorising the mail server, for cPanel
  hosting usually `v=spf1 +a +mx include:<host's spf> ~all`.
- **DKIM**: enable in cPanel under Email Deliverability, which publishes the
  key for you.
- **DMARC**: start with `v=DMARC1; p=none; rua=mailto:info@daramanihot.com.ng`,
  tighten to `quarantine` after a few weeks of clean reports.

cPanel's Email Deliverability page shows a green tick per domain when all
three are valid.

## 4. Test it

1. `pnpm launch:check` reports anything still missing.
2. On staging, submit the form with a real address you control.
3. Confirm: confirmation shown with a reference, notification arrives at
   `ENQUIRY_TO`, acknowledgement arrives with the same reference, Reply on the
   notification addresses the visitor.
4. Check the acknowledgement in a phone client (Gmail app) and a desktop one.

For a dry run that sends nothing, set `MAIL_DRIVER=json`. Never leave it set in
production: enquiries would be dropped silently. `pnpm launch:check` flags it.

## Spam protection and its limits

Layered, with no CAPTCHA and no third party for real visitors:

- a hidden honeypot field that bots fill in;
- a timing check (a form submitted in under 3 seconds, or with no timestamp,
  is a script);
- a limit of 5 enquiries per IP per hour and 100 per hour overall.

Bots that trip the first two get a normal looking success response, so they do
not adapt. They are logged as `enquiry.spam_rejected`.

Known limits, stated plainly:

- The rate limiter keeps its counts in memory. On serverless hosting each
  instance counts separately, so it is a best effort brake, not a hard cap.
- The per-IP check reads `X-Forwarded-For`. Behind a proxy that overwrites the
  header (Vercel, Cloudflare) this is reliable. Behind one that appends to it,
  a determined attacker could vary it. The overall limit still applies.
- A determined human can still send spam by hand.

If spam gets through in practice, the next step is Cloudflare Turnstile (free,
privacy friendly): add a widget to the form and verify its token in
`lib/enquiry-handler.ts`. That would need a Cloudflare account, so it was left
out of this scope.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Visitors see "could not send" | Wrong `SMTP_*` values. Server logs show `enquiry.delivery_failed` with the reason |
| 503 from `/api/enquiry` | Email variables are not set in the environment |
| Acknowledgements go to spam | SPF, DKIM or DMARC missing (section 3) |
| `acknowledged: false` in logs | The visitor's address bounced. The enquiry itself was delivered |
| Logo missing in emails | `NEXT_PUBLIC_SITE_URL` unset or pointing at a private address |


Organisation notifications now address both `daramanihot@gmail.com` and `info@daramanihot.com` in one email. `ENQUIRY_TO` accepts a comma-separated list, trims whitespace, rejects malformed/empty entries and removes duplicates. The visitor receives a separate acknowledgement, with both organisation inboxes as Reply-To. The sender and public domain/email content are unchanged. Update the Vercel `ENQUIRY_TO` setting to `daramanihot@gmail.com,info@daramanihot.com` and redeploy; an old explicit environment value overrides code defaults. No live emails are sent by tests.
