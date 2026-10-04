// Base de espécies oficial e completa do BIRDPRO (Passeriformes da fauna silvestre SISPASS + Aves exóticas/domésticas)

export interface SpeciesOption {
  name: string;
  scientificName?: string;
  popular?: boolean;
  category?: 'Silvestre' | 'Exótica' | 'Doméstica';
}

export const SYSTEM_SPECIES: SpeciesOption[] = [
  // Populares / Mais criados no Brasil
  { name: 'Canário-da-terra', scientificName: 'Sicalis flaveola', popular: true, category: 'Silvestre' },
  { name: 'Curió', scientificName: 'Sporophila angolensis', popular: true, category: 'Silvestre' },
  { name: 'Trinca-ferro', scientificName: 'Saltator similis', popular: true, category: 'Silvestre' },
  { name: 'Coleiro / Papa-capim', scientificName: 'Sporophila caerulescens', popular: true, category: 'Silvestre' },
  { name: 'Azulão', scientificName: 'Cyanoloxia brissonii', popular: true, category: 'Silvestre' },
  { name: 'Bicudo', scientificName: 'Sporophila maximiliani', popular: true, category: 'Silvestre' },
  { name: 'Pintassilgo', scientificName: 'Spinus magellanicus', popular: true, category: 'Silvestre' },
  { name: 'Canário Belga', scientificName: 'Serinus canaria', popular: true, category: 'Doméstica' },
  { name: 'Calopsita', scientificName: 'Nymphicus hollandicus', popular: true, category: 'Exótica' },
  { name: 'Diamante de Gould', scientificName: 'Chloebia gouldiae', popular: true, category: 'Exótica' },
  { name: 'Agapornis', scientificName: 'Agapornis roseicollis', popular: true, category: 'Exótica' },
  { name: 'Periquito-australiano', scientificName: 'Melopsittacus undulatus', popular: true, category: 'Exótica' },
  { name: 'Manon', scientificName: 'Lonchura striata domestica', popular: true, category: 'Exótica' },
  { name: 'Diamante Mandarim', scientificName: 'Taeniopygia guttata', popular: true, category: 'Exótica' },
  { name: 'Sabiá-laranjeira', scientificName: 'Turdus rufiventris', popular: true, category: 'Silvestre' },
  { name: 'Tiziu', scientificName: 'Volatinia jacarina', popular: true, category: 'Silvestre' },
  { name: 'Bigodinho', scientificName: 'Sporophila lineola', popular: true, category: 'Silvestre' },
  { name: 'Caboclinho', scientificName: 'Sporophila bouvreuil', popular: true, category: 'Silvestre' },
  { name: 'Galo-da-campina', scientificName: 'Paroaria dominicana', popular: true, category: 'Silvestre' },
  { name: 'Cardeal', scientificName: 'Paroaria coronata', popular: true, category: 'Silvestre' },
  { name: 'Tico-tico', scientificName: 'Zonotrichia capensis', popular: true, category: 'Silvestre' },
  { name: 'Papagaio-verdadeiro', scientificName: 'Amazona aestiva', popular: true, category: 'Silvestre' },
  { name: 'Ring Neck', scientificName: 'Psittacula krameri', popular: true, category: 'Exótica' },
  { name: 'Calafate (Java Finch)', scientificName: 'Lonchura oryzivora', popular: true, category: 'Exótica' },

  // Demais espécies da fauna brasileira e avicultura
  { name: 'Arara Canindé', scientificName: 'Ara ararauna', category: 'Silvestre' },
  { name: 'Arara Vermelha', scientificName: 'Ara chloropterus', category: 'Silvestre' },
  { name: 'Ararajuba', scientificName: 'Guaruba guarouba', category: 'Silvestre' },
  { name: 'Asa-de-telha', scientificName: 'Agelaioides badius', category: 'Silvestre' },
  { name: 'Azulão-do-cerrado', scientificName: 'Cyanoloxia rothschildii', category: 'Silvestre' },
  { name: 'Azulinho', scientificName: 'Cyanocompsa parellina', category: 'Silvestre' },
  { name: 'Batuqueiro', scientificName: 'Saltator fuliginosus', category: 'Silvestre' },
  { name: 'Bavete cauda longa', scientificName: 'Poephila acuticauda', category: 'Exótica' },
  { name: 'Bico-de-pimenta', scientificName: 'Saltator grossus', category: 'Silvestre' },
  { name: 'Bico-de-prata', scientificName: 'Ramphocelus carbo', category: 'Silvestre' },
  { name: 'Bico-de-veludo', scientificName: 'Schistochlamys ruficapillus', category: 'Silvestre' },
  { name: 'Bico-duro', scientificName: 'Sporophila albogularis', category: 'Silvestre' },
  { name: 'Bico-grosso', scientificName: 'Pheucticus aureoventris', category: 'Silvestre' },
  { name: 'Bicudinho-belenzinho', scientificName: 'Sporophila falcirostris', category: 'Silvestre' },
  { name: 'Bicudo-do-bico-preto', scientificName: 'Sporophila maximiliani', category: 'Silvestre' },
  { name: 'Bicudo-pantaneiro', scientificName: 'Sporophila maximiliani atriceps', category: 'Silvestre' },
  { name: 'Brejal', scientificName: 'Arundinicola leucocephala', category: 'Silvestre' },
  { name: 'Cabeça de ameixa', scientificName: 'Psittacula cyanocephala', category: 'Exótica' },
  { name: 'Caboclinho-de-barriga-preta', scientificName: 'Sporophila melanogaster', category: 'Silvestre' },
  { name: 'Caboclinho-de-barriga-vermelha', scientificName: 'Sporophila hypoxantha', category: 'Silvestre' },
  { name: 'Caboclinho-de-cabeça-marrom', scientificName: 'Sporophila castaneiventris', category: 'Silvestre' },
  { name: 'Caboclinho-de-chapéu-cinzento', scientificName: 'Sporophila cinnamomea', category: 'Silvestre' },
  { name: 'Caboclinho-do-Amazonas', scientificName: 'Sporophila castaneiventris', category: 'Silvestre' },
  { name: 'Caboclinho-papo-branco', scientificName: 'Sporophila palustris', category: 'Silvestre' },
  { name: 'Cacatua de crista amarela', scientificName: 'Cacatua galerita', category: 'Exótica' },
  { name: 'Cacatua galah', scientificName: 'Eolophus roseicapilla', category: 'Exótica' },
  { name: 'Cacatua inca', scientificName: 'Lophochroa leadbeateri', category: 'Exótica' },
  { name: 'Cacatua moluca', scientificName: 'Cacatua moluccensis', category: 'Exótica' },
  { name: 'Cacatua red tail', scientificName: 'Calyptorhynchus banksii', category: 'Exótica' },
  { name: 'Cacatua sanguínea', scientificName: 'Cacatua sanguinea', category: 'Exótica' },
  { name: 'Cambacica', scientificName: 'Coereba flaveola', category: 'Silvestre' },
  { name: 'Canário-da-terra brasiliensis', scientificName: 'Sicalis flaveola brasiliensis', category: 'Silvestre' },
  { name: 'Canário-da-terra pelzelni', scientificName: 'Sicalis flaveola pelzelni', category: 'Silvestre' },
  { name: 'Canário de Canto', scientificName: 'Serinus canaria', category: 'Doméstica' },
  { name: 'Canário de Cor', scientificName: 'Serinus canaria', category: 'Doméstica' },
  { name: 'Canário de Porte', scientificName: 'Serinus canaria', category: 'Doméstica' },
  { name: 'Canário-chapinha', scientificName: 'Sicalis flaveola', category: 'Silvestre' },
  { name: 'Canário-do-Amazonas', scientificName: 'Sicalis columbiana', category: 'Silvestre' },
  { name: 'Canário-do-campo', scientificName: 'Emberizoides herbicola', category: 'Silvestre' },
  { name: 'Canário-rasteiro', scientificName: 'Sicalis citrina', category: 'Silvestre' },
  { name: 'Cardeal-amarelo', scientificName: 'Gubernatrix cristata', category: 'Silvestre' },
  { name: 'Chopim-do-brejo', scientificName: 'Pseudoleistes guirahuro', category: 'Silvestre' },
  { name: 'Cigarra-bambu', scientificName: 'Haplospiza unicolor', category: 'Silvestre' },
  { name: 'Cigarra-do-coqueiro', scientificName: 'Tiaris fuliginosus', category: 'Silvestre' },
  { name: 'Cigarra-papa-arroz', scientificName: 'Sporophila fringilloides', category: 'Silvestre' },
  { name: 'Cigarra-rainha', scientificName: 'Sporophila luctuosa', category: 'Silvestre' },
  { name: 'Cigarra-verdadeira', scientificName: 'Sporophila falcirostris', category: 'Silvestre' },
  { name: 'Coleira-do-brejo', scientificName: 'Sporophila collaris', category: 'Silvestre' },
  { name: 'Coleiro-baiano', scientificName: 'Sporophila nigricollis', category: 'Silvestre' },
  { name: 'Coleiro-do-norte', scientificName: 'Sporophila americana', category: 'Silvestre' },
  { name: 'Corrupião / Sofrê', scientificName: 'Icterus jamacaii', category: 'Silvestre' },
  { name: 'Cravina', scientificName: 'Coryphospingus pileatus', category: 'Silvestre' },
  { name: 'Diamante Bichenov', scientificName: 'Taeniopygia bichenovii', category: 'Exótica' },
  { name: 'Diamante Degolado', scientificName: 'Amadina fasciata', category: 'Exótica' },
  { name: 'Diamante Sparrow', scientificName: 'Stagonopleura guttata', category: 'Exótica' },
  { name: 'Garibaldi', scientificName: 'Chrysomus ruficapillus', category: 'Silvestre' },
  { name: 'Gaturamo-verdadeiro', scientificName: 'Euphonia violacea', category: 'Silvestre' },
  { name: 'Gola', scientificName: 'Sporophila collaris', category: 'Silvestre' },
  { name: 'Graúna / Chopim', scientificName: 'Gnorimopsar chopi', category: 'Silvestre' },
  { name: 'Inhapim', scientificName: 'Icterus cayanensis', category: 'Silvestre' },
  { name: 'Iraúna', scientificName: 'Molothrus bonariensis', category: 'Silvestre' },
  { name: 'Lóris Arco-íris', scientificName: 'Trichoglossus moluccanus', category: 'Exótica' },
  { name: 'Patativa', scientificName: 'Sporophila plumbea', category: 'Silvestre' },
  { name: 'Periquito Hooded', scientificName: 'Psephotus dissimilis', category: 'Exótica' },
  { name: 'Periquito Inglês', scientificName: 'Melopsittacus undulatus', category: 'Exótica' },
  { name: 'Pichochó', scientificName: 'Sporophila frontalis', category: 'Silvestre' },
  { name: 'Pintassilgo-baiano', scientificName: 'Spinus yarrellii', category: 'Silvestre' },
  { name: 'Rolinha Fogo-apagou', scientificName: 'Columbina squammata', category: 'Silvestre' },
  { name: 'Rosela elegante', scientificName: 'Platycercus elegans', category: 'Exótica' },
  { name: 'Rosela eximius', scientificName: 'Platycercus eximius', category: 'Exótica' },
  { name: 'Sabiá-barranco', scientificName: 'Turdus leucomelas', category: 'Silvestre' },
  { name: 'Sabiá-coleira', scientificName: 'Turdus albicollis', category: 'Silvestre' },
  { name: 'Sanhaço-azul', scientificName: 'Tangara sayaca', category: 'Silvestre' },
  { name: 'Sanhaço-do-coqueiro', scientificName: 'Tangara palmarum', category: 'Silvestre' },
  { name: 'Tico-tico-rei', scientificName: 'Coryphospingus cucullatus', category: 'Silvestre' },
  { name: 'Tié-sangue', scientificName: 'Ramphocelus bresilius', category: 'Silvestre' },
  { name: 'Trinca-ferro "maximus"', scientificName: 'Saltator maximus', category: 'Silvestre' }
];

/**
 * Retorna uma lista consolidada de espécies para seleção:
 * 1. Espécies do plantel do usuário (prioridade)
 * 2. Espécies oficiais cadastradas no sistema
 * Removendo duplicatas e ordenando de forma intuitiva.
 */
export function getRegisteredSpecies(plantelSpecies: string[] = []): string[] {
  const set = new Set<string>();

  // Adiciona espécies do plantel primeiro
  plantelSpecies.forEach(sp => {
    if (sp && sp.trim()) {
      set.add(sp.trim());
    }
  });

  // Adiciona espécies do catálogo com nome científico amigável
  SYSTEM_SPECIES.forEach(s => {
    const full = s.scientificName ? `${s.name} (${s.scientificName})` : s.name;
    const short = s.name;
    // Se o usuário ainda não tiver esse formato, adiciona
    if (!set.has(short) && !set.has(full)) {
      set.add(full);
    }
  });

  return Array.from(set);
}

/**
 * Espécies rápidas mais usadas no Brasil para chips de 1 clique
 */
export const POPULAR_QUICK_SPECIES = [
  'Canário-da-terra (Sicalis flaveola)',
  'Curió (Sporophila angolensis)',
  'Trinca-ferro (Saltator similis)',
  'Coleiro (Sporophila caerulescens)',
  'Azulão (Cyanoloxia brissonii)',
  'Bicudo (Sporophila maximiliani)',
  'Calopsita (Nymphicus hollandicus)',
  'Canário Belga (Serinus canaria)'
];
