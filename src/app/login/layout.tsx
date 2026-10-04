import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acessar Minha Conta • Login do Criador',
  description: 'Faça login no BIRDPRO para acessar seu criatório, cadastrar anilhas, emitir pedigrees A4 e gerenciar ninhadas.',
  alternates: {
    canonical: 'https://www.birdpro.com.br/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
