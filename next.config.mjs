/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**"
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**"
      }
    ]
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Bloqueia carregamento em iframes (anti-clickjacking)
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          // Impede sniffing de tipo MIME pelo browser
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          // Forca HTTPS por 1 ano em toda a origem e subdomínios
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains"
          },
          // Controla informacoes enviadas no Referer em navegacoes externas
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          // Desabilita APIs do browser nao utilizadas pela aplicacao
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          // Content Security Policy: restringe origens de carregamento de recursos
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Imagens: proprias, data URIs, blobs, Supabase Storage e flagcdn.com
              "img-src 'self' data: blob: https://*.supabase.co https://flagcdn.com",
              // Scripts: Next.js requer unsafe-inline/eval para RSC no v14
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos: proprios, inline (Tailwind) e Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fontes do Google
              "font-src 'self' https://fonts.gstatic.com",
              // Conexoes: API Supabase + Realtime WebSocket
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              // Formularios: apenas proprios
              "form-action 'self'",
              // Bloqueia embeds de objetos
              "object-src 'none'"
            ].join("; ")
          }
        ]
      }
    ]
  }
}

export default nextConfig
