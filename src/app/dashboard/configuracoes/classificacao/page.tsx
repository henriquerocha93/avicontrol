'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Tag } from 'lucide-react'

export default function ClassificacaoConfigPage() {
  const initial = [
    { id: '1', name: 'Reprodutor Matriz de Elite', extra: 'Classificação A+' },
    { id: '2', name: 'Ave de Canto Clássico / Torneio', extra: 'Competição' },
    { id: '3', name: 'Plantel Reserva Genética', extra: 'Conservação' },
    { id: '4', name: 'Ave para Venda Comercial', extra: 'Comercial' },
    { id: '5', name: 'Filhote em Avaliação', extra: 'Triagem' }
  ]

  return (
    <GenericConfigCrud
      title="Configuração de Classificação"
      subtitle="Classificações personalizadas para categorizar aves do plantel"
      icon={Tag}
      unitName="Classificação"
      items={initial}
    />
  )
}
