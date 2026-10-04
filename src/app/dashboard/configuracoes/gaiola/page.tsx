'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Grid3X3 } from 'lucide-react'

export default function GaiolaConfigPage() {
  return (
    <GenericConfigCrud
      title="Configuração de Gaiolas & Voadeiras"
      subtitle="Cadastre modelos, dimensões, salas e capacidades de alojamento"
      icon={Grid3X3}
      unitName="Gaiola"
      items={[]}
      storageKey="birdpro_config_gaiola"
    />
  )
}
