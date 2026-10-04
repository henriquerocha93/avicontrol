import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar Conta • Cadastrar Criatório',
  description: 'Cadastre seu criatório no BIRDPRO e tenha acesso imediato à mais avançada plataforma de gestão zootécnica de aves e anilhas do Brasil.',
  alternates: {
    canonical: 'https://www.birdpro.com.br/cadastro',
  },
};

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
