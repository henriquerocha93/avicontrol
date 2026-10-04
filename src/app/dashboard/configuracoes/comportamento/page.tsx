'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Activity } from 'lucide-react'

export default function ComportamentoConfigPage() {
  return (
    <GenericConfigCrud
      title="Configuração de Comportamentos"
      subtitle="Defina traços comportamentais, aptidões e características de manejo"
      icon={Activity}
      unitName="Comportamento"
      items={[]}
      storageKey="birdpro_config_comportamento"
    />
  )
}
