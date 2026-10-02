'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { Package } from 'lucide-react'

export default function ProdutoConfigPage() {
  const initial = [
    { id: '1', name: 'Ração Extrusada Super Premium 5kg', category: 'Alimentação', extra: 'Estoque: 18 un | R$ 145,00' },
    { id: '2', name: 'Complexo Vitamínico E + Selênio 100ml', category: 'Medicamento', extra: 'Estoque: 12 un | R$ 68,00' },
    { id: '3', name: 'Mistura de Sementes Nobres 10kg', category: 'Alimentação', extra: 'Estoque: 30 un | R$ 110,00' },
    { id: '4', name: 'Ninho Madeira Especial Bicudo/Curió', category: 'Acessório', extra: 'Estoque: 25 un | R$ 35,00' },
    { id: '5', name: 'Suplemento Cálcio D3 Pó 250g', category: 'Suplemento', extra: 'Estoque: 14 un | R$ 42,00' },
  ]

  return (
    <GenericConfigCrud
      title="Configuração de Produtos"
      subtitle="Cadastre rações, medicamentos, suplementos, ninhos e insumos do criatório"
      icon={Package}
      unitName="Produto"
      items={initial}
    />
  )
}
