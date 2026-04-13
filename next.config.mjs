/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevents browsers from DNS prefetching, reducing privacy leaks
          { key: 'X-DNS-Prefetch-Control', value: 'on' },

          // Prevents this site from being embedded in any iframe (clickjacking protection)
          { key: 'X-Frame-Options', value: 'DENY' },

          // Prevents browsers from MIME-sniffing the content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Controls how much referrer info is sent with requests
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },

          // Restricts access to browser features; payment/usb/bluetooth explicitly denied
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()' },

          // Forces HTTPS for 2 years, including subdomains; eligible for browser preload lists
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

          // Defines trusted sources for all resource types to mitigate XSS and injection attacks.
          // 'unsafe-inline' and 'unsafe-eval' are required by Next.js for hydration and styles.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.stripe.com https://api.resend.com https://*.upstash.io",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
