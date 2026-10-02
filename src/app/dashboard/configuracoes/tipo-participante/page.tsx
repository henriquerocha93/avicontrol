'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { ShieldCheck } from 'lucide-react'

export default function TipoParticipanteConfigPage() {
  const initial = [
    { id: '1', name: 'Criador Parceiro / Matrizeiro', extra: 'Parcerias e Trocas' },
    { id: '2', name: 'Médico Veterinário Responsável', extra: 'Saúde e Laudos' },
    { id: '3', name: 'Fornecedor de Alimentos e Medicamentos', extra: 'Suprimentos' },
    { id: '4', name: 'Laboratório de Sexagem / DNA', extra: 'Diagnóstico' },
    { id: '5', name: 'Cliente / Comprador Final', extra: 'Vendas' }
  ]

  return (
    <GenericConfigCrud
      title="Tipos de Participante"
      subtitle="Defina as categorias para classificar contatos, fornecedores e parceiros"
      icon={ShieldCheck}
      unitName="Tipo de Participante"
      items={initial}
    />
  )
}
