'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Grid3X3 } from 'lucide-react'

export default function GaiolaConfigPage() {
  const initial = [
    { id: '1', name: 'Gaiola Criadeira 60x30x40 (Arame Galvanizado)', extra: 'Capacidade: 2 aves | Sala 1' },
    { id: '2', name: 'Gaiola Torneio Madeira Marfim Especial', extra: 'Capacidade: 1 ave | Sala Torneio' },
    { id: '3', name: 'Voadeira 1,20m x 50cm x 50cm', extra: 'Capacidade: 6 aves | Sala Voadores' },
    { id: '4', name: 'Gaiola Quarentena / Hospital', extra: 'Capacidade: 1 ave | Sala Isolamento' },
    { id: '5', name: 'Criadeira Epóxi Branca c/ Divisória', extra: 'Capacidade: 2 aves | Sala 2' }
  ]

  return (
    <GenericConfigCrud
      title="Configuração de Gaiolas & Voadeiras"
      subtitle="Cadastre modelos, dimensões, salas e capacidades de alojamento"
      icon={Grid3X3}
      unitName="Gaiola"
      items={initial}
    />
  )
}
