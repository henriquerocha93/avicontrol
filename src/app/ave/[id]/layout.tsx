import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificado de Pedigree & Autenticidade Oficial',
  description: 'Validação pública de pedigree oficial, árvore genealógica de até 5 gerações e autenticidade da ave via QR Code no BIRDPRO.',
};

export default function AveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
