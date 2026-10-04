import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços • Assinatura BIRDPRO',
  description: 'Conheça os planos do BIRDPRO a partir de R$ 14,99/mês. Gestão completa de plantel, anilhas SISPASS e FOB, genealogia de até 5 gerações e pedigree oficial com QR Code.',
  alternates: {
    canonical: 'https://www.birdpro.com.br/contratar',
  },
};

export default function ContratarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
