import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criatório Oficial & Plantel Registrado',
  description: 'Página pública oficial do criatório: matrizes, reprodutores, histórico de linhagens e aves com certificação BIRDPRO.',
};

export default function CriatorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
