'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Tag } from 'lucide-react'

export default function ClassificacaoConfigPage() {
  return (
    <GenericConfigCrud
      title="Configuração de Classificação"
      subtitle="Classificações personalizadas para categorizar aves do plantel"
      icon={Tag}
      unitName="Classificação"
      items={[]}
      storageKey="birdpro_config_classificacao"
    />
  )
}
