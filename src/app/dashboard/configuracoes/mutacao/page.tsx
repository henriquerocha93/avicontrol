'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Dna } from 'lucide-react'

export default function MutacaoConfigPage() {
  const initial = [
    { id: '1', name: 'Canela (Recessiva ligada ao sexo)', extra: 'Herança Ligada ao Sexo' },
    { id: '2', name: 'Lutino / Albino (Ino)', extra: 'Herança Recessiva' },
    { id: '3', name: 'Opalino / Asa Clara', extra: 'Herança Autossômica' },
    { id: '4', name: 'Arlequim Dominante', extra: 'Herança Dominante' },
    { id: '5', name: 'Face Branca', extra: 'Herança Recessiva' },
    { id: '6', name: 'Pintado / Malhado', extra: 'Herança Mista' }
  ]

  return (
    <GenericConfigCrud
      title="Configuração de Mutações Genéticas"
      subtitle="Cadastre mutações, padrões de cor e tipos de herança genética"
      icon={Dna}
      unitName="Mutação"
      items={initial}
    />
  )
}
