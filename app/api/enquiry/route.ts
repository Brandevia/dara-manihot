import { handleEnquiry } from '@/lib/enquiry-handler'

// nodemailer needs Node APIs (net, tls), so this cannot run on the edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handleEnquiry(request)
}
