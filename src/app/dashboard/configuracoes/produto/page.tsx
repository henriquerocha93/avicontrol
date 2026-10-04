'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Package } from 'lucide-react'

export default function ProdutoConfigPage() {
  return (
    <GenericConfigCrud
      title="Configuração de Produtos"
      subtitle="Cadastre rações, medicamentos, suplementos, ninhos e insumos do criatório"
      icon={Package}
      unitName="Produto"
      items={[]}
      storageKey="birdpro_config_produtos"
    />
  )
}
