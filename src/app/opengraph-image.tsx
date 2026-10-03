import { ImageResponse } from 'next/og';

export const alt = 'BIRDPRO • Gestão Zootécnica & Genética Aviária';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070e0b',
          backgroundImage: 'radial-gradient(circle at 50% 45%, #0d281a 0%, #070e0b 80%)',
          color: 'white',
          padding: '40px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glowing Radial Aura */}
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 200, 83, 0.28) 0%, transparent 70%)',
            top: '80px',
          }}
        />

        {/* Brand Emblem (Matching Uploaded Logo) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '36px',
            background: 'linear-gradient(135deg, #00e676 0%, #00c853 45%, #023d24 100%)',
            border: '3px solid rgba(110, 231, 183, 0.6)',
            boxShadow: '0 15px 40px rgba(0, 200, 83, 0.45)',
            marginBottom: '26px',
          }}
        >
          <svg
            width="90"
            height="90"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wing / Feather */}
            <path
              d="M10 32C15 24 25 18 41 13C46 11 50 8 50 8C49 13 46 22 41 27C36 32 28 36 19 37C14 38 12 35 10 32Z"
              fill="white"
            />
            <path
              d="M23 28C30 25 41 19 47 11C43 18 37 29 29 34C22 38 15 39 12 39C15 37 20 32 23 28Z"
              fill="#a7f3d0"
              fillOpacity="0.9"
            />
            {/* Golden Ring */}
            <circle cx="42" cy="42" r="8.5" stroke="#F59E0B" strokeWidth="3.5" fill="none" />
            <circle cx="42" cy="42" r="3.5" fill="#F59E0B" />
          </svg>
        </div>

        {/* Brand Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: '14px',
          }}
        >
          <span>BIRD</span>
          <span style={{ color: '#00e676', marginLeft: '2px' }}>PRO</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#a7f3d0',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Sistema Oficial de Gestão Zootécnica &amp; Genética Aviária
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(0, 200, 83, 0.15)',
              border: '1px solid rgba(0, 200, 83, 0.4)',
              color: '#4ade80',
            }}
          >
            Genealogia &amp; Pedigree A4
          </div>
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(0, 200, 83, 0.15)',
              border: '1px solid rgba(0, 200, 83, 0.4)',
              color: '#4ade80',
            }}
          >
            Anilhas FOB &amp; SISPASS
          </div>
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(0, 200, 83, 0.15)',
              border: '1px solid rgba(0, 200, 83, 0.4)',
              color: '#4ade80',
            }}
          >
            QR Code de Autenticidade
          </div>
        </div>

        {/* URL footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#64748b',
          }}
        >
          www.birdpro.com.br
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
