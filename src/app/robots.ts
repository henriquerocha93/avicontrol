import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.birdpro.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/contratar',
          '/cadastro',
          '/login',
          '/recuperar-senha',
          '/ave/',
          '/criatorio/',
          '/qr_code',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/checkout/',
          '/onboarding/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/checkout/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
