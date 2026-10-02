# Enquiry email setup

The landing page sends `POST /api/enquiry` to the Cloudflare Worker. The Worker sends each valid enquiry through Resend to `inhousemobilemechanics@gmail.com` and sets the submitter's email as `Reply-To`, so Peter can reply directly.

## Production

1. In Resend, verify `inhousemobilemechanics.com.au` and add the DNS records shown by the Resend domain wizard at the domain provider. Sending must show as verified before using a sender on that domain.
2. Store the API key as a Worker secret. Do not put it in the repository or a client-side environment variable:

   ```text
   npx wrangler secret put RESEND_API_KEY
   ```

3. The code uses this sender by default: `In-House Mobile Mechanics <enquiries@inhousemobilemechanics.com.au>`. Set the optional `RESEND_FROM` Worker variable if a different verified sender is preferred.
4. Build and deploy the Worker through the project's normal hosting flow. No API key is included in the built assets.

## Local Worker testing

Create an untracked `.dev.vars` file for Wrangler local development:

```text
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=In-House Mobile Mechanics <enquiries@inhousemobilemechanics.com.au>
```

Then run `npx wrangler dev` and submit the form at the local URL. The Vite-only `npm run dev` server can render the page, but it does not provide the production Worker email route.

The endpoint rejects oversized or malformed input, cross-origin requests, submissions that fill the hidden honeypot, and more than five submissions per ten minutes per Cloudflare connection in each Worker isolate. It returns a generic delivery error when Resend is unavailable and never exposes the API key to the browser.
