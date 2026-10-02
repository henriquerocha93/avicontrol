import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #00e676 0%, #00c853 50%, #047857 100%)',
          borderRadius: '9px',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
          position: 'relative',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bird wing sleek geometry */}
          <path
            d="M7 26C11 19 20 15 33 11C37 9.5 41 7 41 7C40 11 38 18 34 22C29.5 26.5 23 29.5 15.5 30.5C11 31 8.5 28.5 7 26Z"
            fill="white"
          />
          <path
            d="M19 23C25 21 34 16 39 9.5C35 15 30.5 24.5 23.5 28.5C17.5 32 11.5 32.5 9 32.5C12 30.5 16 26.5 19 23Z"
            fill="#a7f3d0"
          />
          {/* Golden Ring circle accent */}
          <circle cx="35" cy="35" r="7" stroke="#F59E0B" strokeWidth="3" fill="none" />
          <circle cx="35" cy="35" r="3.2" fill="#F59E0B" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
