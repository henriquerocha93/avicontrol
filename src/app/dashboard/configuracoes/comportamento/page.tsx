'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Activity } from 'lucide-react'

export default function ComportamentoConfigPage() {
  const initial = [
    { id: '1', name: 'Canto Repetidor de Alta Frequência', extra: 'Canto' },
    { id: '2', name: 'Excelente Chocadeira / Cuidadora', extra: 'Maternidade' },
    { id: '3', name: 'Territorialista / Agressivo', extra: 'Temperamento' },
    { id: '4', name: 'Dócil e Adaptável a Gaiola Pequena', extra: 'Manejo' },
    { id: '5', name: 'Gala Rápida e Frequente', extra: 'Reprodução' }
  ]

  return (
    <GenericConfigCrud
      title="Configuração de Comportamentos"
      subtitle="Defina traços comportamentais, aptidões e características de manejo"
      icon={Activity}
      unitName="Comportamento"
      items={initial}
    />
  )
}
