import { Bird } from '@/types';
import { db } from './db';

export interface PedigreeNode {
  id: string;
  name: string;
  ringNumber?: string;
  species?: string;
  color?: string;
  sex: 'MALE' | 'FEMALE';
  role: string;
  generation: number;
  path?: string;
  father?: PedigreeNode;
  mother?: PedigreeNode;
  isRegistered?: boolean;
}

export function getAncestorRole(path: string): string {
  const isMale = path.endsWith('F');
  const level = path.length;

  if (level === 1) {
    return isMale ? 'PAI (1ª Geração) ♂' : 'MÃE (1ª Geração) ♀';
  }
  if (level === 2) {
    if (path === 'FF') return 'AVÔ PATERNO ♂';
    if (path === 'FM') return 'AVÓ PATERNA ♀';
    if (path === 'MF') return 'AVÔ MATERNO ♂';
    if (path === 'MM') return 'AVÓ MATERNA ♀';
  }
  if (level === 3) {
    if (path === 'FFF') return 'BISAVÔ PATERNO (Pai do Avô) ♂';
    if (path === 'FFM') return 'BISAVÓ PATERNA (Mãe do Avô) ♀';
    if (path === 'FMF') return 'BISAVÔ PATERNO (Pai da Avó) ♂';
    if (path === 'FMM') return 'BISAVÓ PATERNA (Mãe da Avó) ♀';
    if (path === 'MFF') return 'BISAVÔ MATERNO (Pai do Avô) ♂';
    if (path === 'MFM') return 'BISAVÓ MATERNA (Mãe do Avô) ♀';
    if (path === 'MMF') return 'BISAVÔ MATERNO (Pai da Avó) ♂';
    if (path === 'MMM') return 'BISAVÓ MATERNA (Mãe da Avó) ♀';
    return isMale ? 'BISAVÔ ♂' : 'BISAVÓ ♀';
  }
  if (level === 4) {
    const side = path.startsWith('F') ? 'PATERNO' : 'MATERNO';
    return isMale ? `TRISAVÔ ${side} ♂` : `TRISAVÓ ${side} ♀`;
  }
  if (level === 5) {
    const side = path.startsWith('F') ? 'PATERNO' : 'MATERNO';
    return isMale ? `TATARAVÔ ${side} ♂` : `TATARAVÓ ${side} ♀`;
  }
  return `GERAÇÃO ${level} ${isMale ? '♂' : '♀'}`;
}

export function resolvePedigreeTree(bird: Bird, allBirds?: Bird[]): {
  target: Bird;
  father: PedigreeNode;
  mother: PedigreeNode;
  grandparents: PedigreeNode[]; // 4
  greatGrandparents: PedigreeNode[]; // 8
  greatGreatGrandparents: PedigreeNode[]; // 16
  tataravos: PedigreeNode[]; // 32
  nodesByPath: Record<string, PedigreeNode>;
  maxGenerations: number;
} {
  const birdsList = allBirds || db.getBirds();

  const findBird = (nameOrRing?: string): Bird | undefined => {
    if (!nameOrRing) return undefined;
    const clean = nameOrRing.toLowerCase().trim();
    return birdsList.find(b => 
      b.id === nameOrRing || 
      (b.ringNumber && b.ringNumber.toLowerCase().trim() === clean) || 
      (b.name && b.name.toLowerCase().trim() === clean)
    );
  };

  const nodesByPath: Record<string, PedigreeNode> = {};
  let deepestRegisteredGeneration = 1;

  // Resolve um nó ancestral qualquer dado o caminho exato
  const resolveNode = (path: string, currentBird: Bird, depthRemaining: number, visited: Set<string>): PedigreeNode => {
    const sex: 'MALE' | 'FEMALE' = path.endsWith('F') ? 'MALE' : 'FEMALE';
    const generation = path.length;
    const role = getAncestorRole(path);

    // 1. Tenta pegar diretamente de currentBird.ancestry
    if (currentBird.ancestry && currentBird.ancestry[path] && currentBird.ancestry[path].name) {
      const raw = currentBird.ancestry[path];
      const nm = (raw.name || '').trim();
      if (nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, generation);
        return {
          id: raw.id || `anc-${path}`,
          name: nm,
          ringNumber: raw.ringNumber || undefined,
          species: currentBird.species || bird.species,
          sex,
          role,
          generation,
          path,
          isRegistered: true
        };
      }
    }

    // 2. Tenta campos diretos e legados para Pais e Avós em currentBird
    if (path === 'F') {
      const pBird = findBird(currentBird.fatherId) || findBird(currentBird.fatherRing) || findBird(currentBird.fatherName);
      const name = pBird?.name || currentBird.fatherName;
      if (name && name !== 'INDEFINIDO' && name !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, 1);
        return {
          id: pBird?.id || 'gen1-f',
          name,
          ringNumber: pBird?.ringNumber || currentBird.fatherRing || undefined,
          species: pBird?.species || currentBird.species || bird.species,
          sex: 'MALE',
          role,
          generation: 1,
          path: 'F',
          isRegistered: true
        };
      }
    }

    if (path === 'M') {
      const mBird = findBird(currentBird.motherId) || findBird(currentBird.motherRing) || findBird(currentBird.motherName);
      const name = mBird?.name || currentBird.motherName;
      if (name && name !== 'INDEFINIDO' && name !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, 1);
        return {
          id: mBird?.id || 'gen1-m',
          name,
          ringNumber: mBird?.ringNumber || currentBird.motherRing || undefined,
          species: mBird?.species || currentBird.species || bird.species,
          sex: 'FEMALE',
          role,
          generation: 1,
          path: 'M',
          isRegistered: true
        };
      }
    }

    if (path === 'FF') {
      const nm = currentBird.paternalGrandfatherId;
      if (nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, 2);
        const f = findBird(nm);
        return {
          id: f?.id || 'gen2-ff',
          name: f?.name || nm,
          ringNumber: f?.ringNumber || undefined,
          species: f?.species || currentBird.species || bird.species,
          sex: 'MALE',
          role,
          generation: 2,
          path: 'FF',
          isRegistered: true
        };
      }
    }

    if (path === 'FM') {
      const nm = currentBird.paternalGrandmotherId;
      if (nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, 2);
        const f = findBird(nm);
        return {
          id: f?.id || 'gen2-fm',
          name: f?.name || nm,
          ringNumber: f?.ringNumber || undefined,
          species: f?.species || currentBird.species || bird.species,
          sex: 'FEMALE',
          role,
          generation: 2,
          path: 'FM',
          isRegistered: true
        };
      }
    }

    if (path === 'MF') {
      const nm = currentBird.maternalGrandfatherId;
      if (nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, 2);
        const f = findBird(nm);
        return {
          id: f?.id || 'gen2-mf',
          name: f?.name || nm,
          ringNumber: f?.ringNumber || undefined,
          species: f?.species || currentBird.species || bird.species,
          sex: 'MALE',
          role,
          generation: 2,
          path: 'MF',
          isRegistered: true
        };
      }
    }

    if (path === 'MM') {
      const nm = currentBird.maternalGrandmotherId;
      if (nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA') {
        deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, 2);
        const f = findBird(nm);
        return {
          id: f?.id || 'gen2-mm',
          name: f?.name || nm,
          ringNumber: f?.ringNumber || undefined,
          species: f?.species || currentBird.species || bird.species,
          sex: 'FEMALE',
          role,
          generation: 2,
          path: 'MM',
          isRegistered: true
        };
      }
    }

    // 3. Resolução Recursiva: navega pelos pássaros no banco se existirem
    // Se path = 'FFF', primeira letra é 'F' (pai), resto é 'FF'
    if (path.length > 1 && !visited.has(currentBird.id)) {
      visited.add(currentBird.id);
      const firstLetter = path[0];
      const rest = path.slice(1);
      const parentBird = findBird(
        firstLetter === 'F' 
          ? (currentBird.fatherId || currentBird.fatherRing || currentBird.fatherName || currentBird.ancestry?.['F']?.id || currentBird.ancestry?.['F']?.ringNumber || currentBird.ancestry?.['F']?.name)
          : (currentBird.motherId || currentBird.motherRing || currentBird.motherName || currentBird.ancestry?.['M']?.id || currentBird.ancestry?.['M']?.ringNumber || currentBird.ancestry?.['M']?.name)
      );

      if (parentBird) {
        // Tenta resolver no pássaro ancestral pai/mãe
        // 3a. Se o pai/mãe tiver 'ancestry' direto com a chave 'rest'
        if (parentBird.ancestry && parentBird.ancestry[rest]?.name) {
          const nm = parentBird.ancestry[rest].name.trim();
          if (nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA') {
            deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, generation);
            return {
              id: parentBird.ancestry[rest].id || `anc-${path}`,
              name: nm,
              ringNumber: parentBird.ancestry[rest].ringNumber || undefined,
              species: parentBird.species || bird.species,
              sex,
              role,
              generation,
              path,
              isRegistered: true
            };
          }
        }

        // 3b. Continua a recursão navegando para os pais do pai/mãe
        const subNode = resolveNode(rest, parentBird, depthRemaining - 1, new Set(visited));
        if (subNode.isRegistered) {
          deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, generation);
          return {
            ...subNode,
            role,
            generation,
            path
          };
        }
      }

      // 3c. Se parentBird não foi encontrado no banco, mas temos o avô registrado como ave:
      // Exemplo: path = 'FFF', firstTwo = 'FF', rest = 'F'.
      if (path.length > 2) {
        const firstTwo = path.slice(0, 2);
        const restTwo = path.slice(2);
        let grandBirdNameOrId: string | undefined;
        if (firstTwo === 'FF') grandBirdNameOrId = currentBird.paternalGrandfatherId || currentBird.ancestry?.['FF']?.id || currentBird.ancestry?.['FF']?.name;
        else if (firstTwo === 'FM') grandBirdNameOrId = currentBird.paternalGrandmotherId || currentBird.ancestry?.['FM']?.id || currentBird.ancestry?.['FM']?.name;
        else if (firstTwo === 'MF') grandBirdNameOrId = currentBird.maternalGrandfatherId || currentBird.ancestry?.['MF']?.id || currentBird.ancestry?.['MF']?.name;
        else if (firstTwo === 'MM') grandBirdNameOrId = currentBird.maternalGrandmotherId || currentBird.ancestry?.['MM']?.id || currentBird.ancestry?.['MM']?.name;

        if (grandBirdNameOrId) {
          const grandBird = findBird(grandBirdNameOrId);
          if (grandBird && !visited.has(grandBird.id)) {
            const subNode = resolveNode(restTwo, grandBird, depthRemaining - 2, new Set(visited));
            if (subNode.isRegistered) {
              deepestRegisteredGeneration = Math.max(deepestRegisteredGeneration, generation);
              return {
                ...subNode,
                role,
                generation,
                path
              };
            }
          }
        }
      }
    }

    // Não cadastrado: padrão oficial INDEFINIDO
    return {
      id: `empty-${path}`,
      name: sex === 'MALE' ? 'INDEFINIDO' : 'INDEFINIDA',
      ringNumber: '—',
      species: bird.species,
      sex,
      role,
      generation,
      path,
      isRegistered: false
    };
  };

  // 1ª Geração: Pais
  const father = resolveNode('F', bird, 5, new Set());
  const mother = resolveNode('M', bird, 5, new Set());
  nodesByPath['F'] = father;
  nodesByPath['M'] = mother;

  // 2ª Geração: 4 Avós
  const grandparentKeys = ['FF', 'FM', 'MF', 'MM'];
  const grandparents: PedigreeNode[] = grandparentKeys.map(k => {
    const node = resolveNode(k, bird, 5, new Set());
    nodesByPath[k] = node;
    return node;
  });

  // 3ª Geração: 8 Bisavós
  const bisavoKeys = ['FFF', 'FFM', 'FMF', 'FMM', 'MFF', 'MFM', 'MMF', 'MMM'];
  const greatGrandparents: PedigreeNode[] = bisavoKeys.map(k => {
    const node = resolveNode(k, bird, 5, new Set());
    nodesByPath[k] = node;
    return node;
  });

  // 4ª Geração: 16 Trisavós
  const trisavoKeys = [
    'FFFF', 'FFFM', 'FFMF', 'FFMM',
    'FMFF', 'FMFM', 'FMMF', 'FMMM',
    'MFFF', 'MFFM', 'MFMF', 'MFMM',
    'MMFF', 'MMFM', 'MMMF', 'MMMM'
  ];
  const greatGreatGrandparents: PedigreeNode[] = trisavoKeys.map(k => {
    const node = resolveNode(k, bird, 5, new Set());
    nodesByPath[k] = node;
    return node;
  });

  // 5ª Geração: 32 Tataravós
  const tataravoKeys: string[] = [];
  trisavoKeys.forEach(tri => {
    tataravoKeys.push(tri + 'F');
    tataravoKeys.push(tri + 'M');
  });
  const tataravos: PedigreeNode[] = tataravoKeys.map(k => {
    const node = resolveNode(k, bird, 5, new Set());
    nodesByPath[k] = node;
    return node;
  });

  // Total de gerações exibíveis: somando a ave alvo (1) + a geração mais profunda registrada
  // Se registrou bisavós (gen 3), maxGenerations = 4. Se trisavós (gen 4), maxGenerations = 5.
  const totalGenerations = Math.min(6, Math.max(3, deepestRegisteredGeneration + 1));

  return {
    target: bird,
    father,
    mother,
    grandparents,
    greatGrandparents,
    greatGreatGrandparents,
    tataravos,
    nodesByPath,
    maxGenerations: totalGenerations
  };
}

/**
 * Herda a árvore genealógica COMPLETA e profunda de um casal (Pai e Mãe)
 * para um novo filhote, mapeando recursivamente Pais, Avós, Bisavós, Trisavós e Tataravós.
 */
export function inheritFullAncestryFromCouple(
  fatherBird?: Bird | null,
  motherBird?: Bird | null,
  allBirds?: Bird[]
): Record<string, { id?: string; name: string; ringNumber: string }> {
  const ancestry: Record<string, { id?: string; name: string; ringNumber: string }> = {};
  const birdsList = allBirds || db.getBirds();

  if (fatherBird) {
    ancestry['F'] = {
      id: fatherBird.id,
      name: fatherBird.name,
      ringNumber: fatherBird.ringNumber || ''
    };
    const fTree = resolvePedigreeTree(fatherBird, birdsList);
    for (const [subPath, node] of Object.entries(fTree.nodesByPath)) {
      if (node && node.isRegistered && node.name && node.name !== 'INDEFINIDO' && node.name !== 'INDEFINIDA') {
        const chickPath = 'F' + subPath;
        ancestry[chickPath] = {
          id: node.id.startsWith('empty-') || node.id.startsWith('gen') || node.id.startsWith('anc-') ? undefined : node.id,
          name: node.name,
          ringNumber: node.ringNumber && node.ringNumber !== '—' ? node.ringNumber : ''
        };
      }
    }
  }

  if (motherBird) {
    ancestry['M'] = {
      id: motherBird.id,
      name: motherBird.name,
      ringNumber: motherBird.ringNumber || ''
    };
    const mTree = resolvePedigreeTree(motherBird, birdsList);
    for (const [subPath, node] of Object.entries(mTree.nodesByPath)) {
      if (node && node.isRegistered && node.name && node.name !== 'INDEFINIDO' && node.name !== 'INDEFINIDA') {
        const chickPath = 'M' + subPath;
        ancestry[chickPath] = {
          id: node.id.startsWith('empty-') || node.id.startsWith('gen') || node.id.startsWith('anc-') ? undefined : node.id,
          name: node.name,
          ringNumber: node.ringNumber && node.ringNumber !== '—' ? node.ringNumber : ''
        };
      }
    }
  }

  return ancestry;
}

