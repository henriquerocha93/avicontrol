'use client'

import React from 'react'
import GenericConfigCrud from '@/components/config/generic-crud'
import { ListFilter } from 'lucide-react'

export default function TipoRacaConfigPage() {
  const initial = [
    { id: '1', name: 'Curió (Sporophila angolensis)', extra: 'Passeriforme Nativo - Canto Praia Grande' },
    { id: '2', name: 'Bicudo (Sporophila maximiliani)', extra: 'Passeriforme Nativo - Canto Flauta' },
    { id: '3', name: 'Trinca-Ferro (Saltator similis)', extra: 'Passeriforme Nativo - Canto Boiadeiro' },
    { id: '4', name: 'Canário da Terra (Sicalis flaveola)', extra: 'Passeriforme Nativo' },
    { id: '5', name: 'Coleiro / Papa-Capim (Sporophila caerulescens)', extra: 'Passeriforme Nativo - Tui Tui' },
    { id: '6', name: 'Azulão (Cyanocompsa brissonii)', extra: 'Passeriforme Nativo' },
    { id: '7', name: 'Canário Belga / Reino (Serinus canaria)', extra: 'Exótico Doméstico' },
    { id: '8', name: 'Calopsita (Nymphicus hollandicus)', extra: 'Psitacídeo Doméstico' }
  ]

  return (
    <GenericConfigCrud
      title="Tipos de Raça & Espécies"
      subtitle="Cadastre espécies, raças e subespécies criadas no criatório"
      icon={ListFilter}
      unitName="Espécie / Raça"
      items={initial}
    />
  )
}
