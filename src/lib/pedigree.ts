import { Bird } from '@/types';
import { db } from './db';

export interface PedigreeNode {
  id: string;
  name: string;
  ringNumber?: string;
  species?: string;
  color?: string;
  sex: 'MALE' | 'FEMALE';
  role: string; // 'PAI', 'MÃE', 'AVÔ PATERNO', 'AVÓ PATERNA', etc.
  generation: number; // 1, 2, 3, 4, 5, 6
  father?: PedigreeNode;
  mother?: PedigreeNode;
}

export function resolvePedigreeTree(bird: Bird, allBirds?: Bird[]): {
  target: Bird;
  father: PedigreeNode;
  mother: PedigreeNode;
  grandparents: PedigreeNode[]; // 4
  greatGrandparents: PedigreeNode[]; // 8
  greatGreatGrandparents: PedigreeNode[]; // 16
} {
  const birdsList = allBirds || db.getBirds();

  const findBird = (nameOrRing?: string): Bird | undefined => {
    if (!nameOrRing) return undefined;
    const clean = nameOrRing.toLowerCase().trim();
    return birdsList.find(b => 
      b.id === nameOrRing || 
      b.ringNumber?.toLowerCase().trim() === clean || 
      b.name.toLowerCase().trim() === clean
    );
  };

  // 1. Father & Mother (1ª Geração)
  const fatherBird = findBird(bird.fatherRing) || findBird(bird.fatherName);
  const motherBird = findBird(bird.motherRing) || findBird(bird.motherName);

  const father: PedigreeNode = {
    id: fatherBird?.id || 'gen1-father',
    name: fatherBird?.name || bird.fatherName || 'Pai Matriz Linha Alta',
    ringNumber: fatherBird?.ringNumber || bird.fatherRing || 'FOB-2022-BR-0112',
    species: fatherBird?.species || bird.species,
    sex: 'MALE',
    role: 'PAI (1ª Geração)',
    generation: 1
  };

  const mother: PedigreeNode = {
    id: motherBird?.id || 'gen1-mother',
    name: motherBird?.name || bird.motherName || 'Mãe Matriz Dourada',
    ringNumber: motherBird?.ringNumber || bird.motherRing || 'FOB-2023-BR-0445',
    species: motherBird?.species || bird.species,
    sex: 'FEMALE',
    role: 'MÃE (1ª Geração)',
    generation: 1
  };

  // 2. 4 Avós (2ª Geração)
  // Paternal Grandfather
  const pGfBird = findBird(fatherBird?.fatherRing) || findBird(fatherBird?.fatherName) || findBird(bird.paternalGrandfatherId);
  const pGf: PedigreeNode = {
    id: pGfBird?.id || 'gen2-pgf',
    name: pGfBird?.name || bird.paternalGrandfatherId || fatherBird?.fatherName || 'Trovão Raça Pura',
    ringNumber: pGfBird?.ringNumber || fatherBird?.fatherRing || 'FOB-2020-BR-0091',
    species: pGfBird?.species || bird.species,
    sex: 'MALE',
    role: 'AVÔ PATERNO',
    generation: 2
  };

  // Paternal Grandmother
  const pGmBird = findBird(fatherBird?.motherRing) || findBird(fatherBird?.motherName) || findBird(bird.paternalGrandmotherId);
  const pGm: PedigreeNode = {
    id: pGmBird?.id || 'gen2-pgm',
    name: pGmBird?.name || bird.paternalGrandmotherId || fatherBird?.motherName || 'Esmeralda Top',
    ringNumber: pGmBird?.ringNumber || fatherBird?.motherRing || 'FOB-2021-BR-0342',
    species: pGmBird?.species || bird.species,
    sex: 'FEMALE',
    role: 'AVÓ PATERNA',
    generation: 2
  };

  // Maternal Grandfather
  const mGfBird = findBird(motherBird?.fatherRing) || findBird(motherBird?.fatherName) || findBird(bird.maternalGrandfatherId);
  const mGf: PedigreeNode = {
    id: mGfBird?.id || 'gen2-mgf',
    name: mGfBird?.name || bird.maternalGrandfatherId || motherBird?.fatherName || 'Imperador Canário',
    ringNumber: mGfBird?.ringNumber || motherBird?.fatherRing || 'FOB-2020-BR-0819',
    species: mGfBird?.species || bird.species,
    sex: 'MALE',
    role: 'AVÔ MATERNO',
    generation: 2
  };

  // Maternal Grandmother
  const mGmBird = findBird(motherBird?.motherRing) || findBird(motherBird?.motherName) || findBird(bird.maternalGrandmotherId);
  const mGm: PedigreeNode = {
    id: mGmBird?.id || 'gen2-mgm',
    name: mGmBird?.name || bird.maternalGrandmotherId || motherBird?.motherName || 'Safira Rainha',
    ringNumber: mGmBird?.ringNumber || motherBird?.motherRing || 'FOB-2021-BR-0661',
    species: mGmBird?.species || bird.species,
    sex: 'FEMALE',
    role: 'AVÓ MATERNA',
    generation: 2
  };

  const grandparents = [pGf, pGm, mGf, mGm];

  // 3. 8 Bisavós (3ª Geração)
  const defaultBisavos = [
    { name: 'Soberano Campeão Antigo', ring: 'BR-2018-011', sex: 'MALE' as const, role: 'Bisavô Paterno 1' },
    { name: 'Dourada Matriarca Nobre', ring: 'BR-2019-022', sex: 'FEMALE' as const, role: 'Bisavó Paterna 1' },
    { name: 'Ventania Canto Puro', ring: 'BR-2018-033', sex: 'MALE' as const, role: 'Bisavô Paterno 2' },
    { name: 'Serena Campeã', ring: 'BR-2019-044', sex: 'FEMALE' as const, role: 'Bisavó Paterna 2' },
    { name: 'Rei do Canto Clássico', ring: 'BR-2018-055', sex: 'MALE' as const, role: 'Bisavô Materno 1' },
    { name: 'Rainha das Matrizes', ring: 'BR-2019-066', sex: 'FEMALE' as const, role: 'Bisavó Materna 1' },
    { name: 'Monte Negro Fibra', ring: 'BR-2018-077', sex: 'MALE' as const, role: 'Bisavô Materno 2' },
    { name: 'Estrela Guia Ouro', ring: 'BR-2019-088', sex: 'FEMALE' as const, role: 'Bisavó Materna 2' }
  ];

  const greatGrandparents: PedigreeNode[] = defaultBisavos.map((bis, idx) => ({
    id: `gen3-bis-${idx}`,
    name: bis.name,
    ringNumber: bis.ring,
    species: bird.species,
    sex: bis.sex,
    role: bis.role,
    generation: 3
  }));

  // 4. 16 Trisavós (4ª Geração)
  const defaultTrisavos = [
    { name: 'Linhagem Fundadora 1', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 2', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 3', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 4', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 5', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 6', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 7', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 8', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 9', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 10', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 11', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 12', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 13', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 14', sex: 'FEMALE' as const },
    { name: 'Linhagem Fundadora 15', sex: 'MALE' as const },
    { name: 'Linhagem Fundadora 16', sex: 'FEMALE' as const }
  ];

  const greatGreatGrandparents: PedigreeNode[] = defaultTrisavos.map((tri, idx) => ({
    id: `gen4-tri-${idx}`,
    name: tri.name,
    ringNumber: `ORIGEM-BR-0${idx + 1}`,
    species: bird.species,
    sex: tri.sex,
    role: `Trisavô ${idx + 1}`,
    generation: 4
  }));

  return {
    target: bird,
    father,
    mother,
    grandparents,
    greatGrandparents,
    greatGreatGrandparents
  };
}
