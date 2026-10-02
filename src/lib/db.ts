import { 
  Bird, Cage, Ring, BreedingPair, Clutch, Egg, DiseaseRecord, Medication, 
  Treatment, SexingRecord, GenotypingRecord, BirdTimelineEvent, 
  NotificationItem, Tenant, User, SupportTicket, BirdDocument, BirdPhoto, AuditLog,
  SellerAffiliate, AffiliateCommission, AffiliatePayout, GlobalSystemConfig,
  CalendarEvent, NoteItem, AiLearnedInsight, UserReferralProgram, ReferredFriend, PlanType
} from '@/types';
import { 
  INITIAL_TENANT, INITIAL_ALL_TENANTS, INITIAL_USERS, INITIAL_BIRDS, INITIAL_CAGES, 
  INITIAL_RINGS, INITIAL_PAIRS, INITIAL_CLUTCHES, INITIAL_EGGS, 
  INITIAL_MEDICATIONS, INITIAL_TREATMENTS, INITIAL_DISEASES, 
  INITIAL_SEXINGS, INITIAL_GENOTYPING, INITIAL_TIMELINE, 
  INITIAL_NOTIFICATIONS, INITIAL_DOCUMENTS, INITIAL_TICKETS,
  INITIAL_SELLERS, INITIAL_GLOBAL_CONFIG, INITIAL_CALENDAR_EVENTS, INITIAL_NOTES,
  INITIAL_USER_REFERRALS
} from './seed-data';

interface DatabaseState {
  tenants: Tenant[];
  users: User[];
  birds: Bird[];
  cages: Cage[];
  rings: Ring[];
  pairs: BreedingPair[];
  clutches: Clutch[];
  eggs: Egg[];
  medications: Medication[];
  treatments: Treatment[];
  diseases: DiseaseRecord[];
  sexings: SexingRecord[];
  genotyping: GenotypingRecord[];
  timeline: BirdTimelineEvent[];
  notifications: NotificationItem[];
  documents: BirdDocument[];
  photos: BirdPhoto[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  sellers: SellerAffiliate[];
  commissions: AffiliateCommission[];
  payouts: AffiliatePayout[];
  userReferrals: Record<string, UserReferralProgram>;
  globalConfig: GlobalSystemConfig;
  events: CalendarEvent[];
  notes: NoteItem[];
  insights: AiLearnedInsight[];
}

const STORAGE_KEY = 'birdpro_saas_db_v1';

class DataService {
  private state: DatabaseState;
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    this.state = this.getInitialState();
    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  private getInitialState(): DatabaseState {
    return {
      tenants: [...INITIAL_ALL_TENANTS],
      users: [...INITIAL_USERS],
      birds: [...INITIAL_BIRDS],
      cages: [...INITIAL_CAGES],
      rings: [...INITIAL_RINGS],
      pairs: [...INITIAL_PAIRS],
      clutches: [...INITIAL_CLUTCHES],
      eggs: [...INITIAL_EGGS],
      medications: [...INITIAL_MEDICATIONS],
      treatments: [...INITIAL_TREATMENTS],
      diseases: [...INITIAL_DISEASES],
      sexings: [...INITIAL_SEXINGS],
      genotyping: [...INITIAL_GENOTYPING],
      timeline: [...INITIAL_TIMELINE],
      notifications: [...INITIAL_NOTIFICATIONS],
      documents: [...INITIAL_DOCUMENTS],
      photos: [],
      tickets: [...INITIAL_TICKETS],
      sellers: [...INITIAL_SELLERS],
      commissions: [],
      payouts: [],
      userReferrals: { ...INITIAL_USER_REFERRALS },
      globalConfig: { ...INITIAL_GLOBAL_CONFIG },
      events: [...INITIAL_CALENDAR_EVENTS],
      notes: [...INITIAL_NOTES],
      insights: [],
      auditLogs: [
        {
          id: 'log-01',
          tenantId: 'tenant-demo-01',
          userId: 'user-demo-01',
          userName: 'Dr. Roberto Silveira',
          action: 'LOGIN',
          module: 'AUTENTICACAO',
          details: 'Acesso realizado com sucesso ao painel principal.',
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  private loadFromStorage() {
    if (!this.isBrowser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...this.getInitialState(), ...parsed };

        // Migrate and clean any outdated placeholder images
        const OLD_IMGS = [
          'photo-1552728089-57bdde30beb3',
          'photo-1573496359142-b8d87734a5a2',
          'photo-1534528741775-53994a69daeb',
          'photo-1598755257130-c2aaca1f061c',
          'photo-1549608276-5786777e6587'
        ];
        const CANARY_IMG = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
        let hasChanges = false;

        this.state.birds = this.state.birds.map(b => {
          if (b.id === 'bird-01' || b.id === 'bird-02' || b.id === 'bird-03' || (b.photoUrl && OLD_IMGS.some(img => b.photoUrl?.includes(img)))) {
            hasChanges = true;
            return { ...b, photoUrl: '' };
          }
          return b;
        });

        this.state.tenants = this.state.tenants.map(t => {
          let updated = { ...t };
          if (t.logoUrl && OLD_IMGS.some(img => t.logoUrl?.includes(img))) {
            updated.logoUrl = CANARY_IMG;
            hasChanges = true;
          }
          if (t.visualConfig) {
            const vc = { ...t.visualConfig };
            if (vc.treeLogoUrl && OLD_IMGS.some(img => vc.treeLogoUrl?.includes(img))) { vc.treeLogoUrl = CANARY_IMG; hasChanges = true; }
            if (vc.logoGenealogyUrl && OLD_IMGS.some(img => vc.logoGenealogyUrl?.includes(img))) { vc.logoGenealogyUrl = CANARY_IMG; hasChanges = true; }
            if (vc.labelLogoUrl && OLD_IMGS.some(img => vc.labelLogoUrl?.includes(img))) { vc.labelLogoUrl = CANARY_IMG; hasChanges = true; }
            if (vc.bgLabelFrontUrl && OLD_IMGS.some(img => vc.bgLabelFrontUrl?.includes(img))) { vc.bgLabelFrontUrl = CANARY_IMG; hasChanges = true; }
            if (vc.bgLabelBackUrl && OLD_IMGS.some(img => vc.bgLabelBackUrl?.includes(img))) { vc.bgLabelBackUrl = CANARY_IMG; hasChanges = true; }
            updated.visualConfig = vc;
          }
          if (!updated.billingCycle) {
            updated.billingCycle = updated.id === 'tenant-demo-04' ? 'ISENTO' : updated.id === 'tenant-demo-02' || updated.id === 'tenant-demo-03' ? 'MENSAL' : 'ANUAL';
            hasChanges = true;
          }
          return updated;
        });

        if (this.state.tenants.length <= 1) {
          INITIAL_ALL_TENANTS.forEach(it => {
            if (!this.state.tenants.some(t => t.id === it.id)) {
              this.state.tenants.push(it);
              hasChanges = true;
            }
          });
        }

        if (!this.state.events || this.state.events.length === 0) {
          this.state.events = [...INITIAL_CALENDAR_EVENTS];
          hasChanges = true;
        }

        if (!this.state.notes || this.state.notes.length === 0) {
          this.state.notes = [...INITIAL_NOTES];
          hasChanges = true;
        }

        if (!this.state.sellers || this.state.sellers.length === 0) {
          this.state.sellers = [...INITIAL_SELLERS];
          hasChanges = true;
        } else {
          this.state.sellers = this.state.sellers.map(s => {
            const initial = INITIAL_SELLERS.find(i => i.id === s.id);
            return {
              ...s,
              type: s.type || (initial?.type ?? 'VENDEDOR'),
              monthlySalesGoal: s.monthlySalesGoal ?? initial?.monthlySalesGoal ?? 5000,
              monthlySignupsGoal: s.monthlySignupsGoal ?? initial?.monthlySignupsGoal ?? 25,
              goalBonusPercent: s.goalBonusPercent ?? initial?.goalBonusPercent ?? 5,
              goalBonusFixed: s.goalBonusFixed ?? initial?.goalBonusFixed ?? 0,
              instagram: s.instagram ?? initial?.instagram,
              youtube: s.youtube ?? initial?.youtube,
            };
          });
          hasChanges = true;
        }

        if (!this.state.userReferrals || Object.keys(this.state.userReferrals).length === 0) {
          this.state.userReferrals = { ...INITIAL_USER_REFERRALS };
          hasChanges = true;
        }

        if (hasChanges) {
          this.saveToStorage();
        }
      } else {
        this.saveToStorage();
      }
    } catch (e) {
      console.error('Failed to load db from storage', e);
    }
  }

  private saveToStorage() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist db to storage', e);
    }
  }

  private logAction(tenantId: string, action: string, module: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tenantId,
      userId: 'user-demo-01',
      userName: 'Dr. Roberto Silveira',
      action,
      module,
      details,
      createdAt: new Date().toISOString()
    };
    this.state.auditLogs.unshift(log);
    this.saveToStorage();
  }

  // --- TENANTS & USERS ---
  getTenant(id = 'tenant-demo-01'): Tenant {
    return this.state.tenants.find(t => t.id === id) || this.state.tenants[0] || INITIAL_TENANT;
  }

  updateTenant(tenant: Partial<Tenant>, id = 'tenant-demo-01'): Tenant {
    const idx = this.state.tenants.findIndex(t => t.id === id);
    if (idx >= 0) {
      this.state.tenants[idx] = { ...this.state.tenants[idx], ...tenant };
      this.logAction(id, 'UPDATE_TENANT', 'CONFIGURACOES', `Dados do criatório atualizados`);
      this.saveToStorage();
      return this.state.tenants[idx];
    }
    return INITIAL_TENANT;
  }

  saveTenant(tenant: Tenant): Tenant {
    return this.updateTenant(tenant, tenant.id || 'tenant-demo-01');
  }

  getAllTenants(): Tenant[] {
    return this.state.tenants;
  }

  getUsers(tenantId = 'tenant-demo-01'): User[] {
    return this.state.users.filter(u => u.tenantId === tenantId);
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.users.push(newUser);
    this.logAction(user.tenantId, 'CREATE_USER', 'USUARIOS', `Novo membro adicionado: ${user.name}`);
    this.saveToStorage();
    return newUser;
  }

  // --- BIRDS ---
  getBirds(tenantId = 'tenant-demo-01'): Bird[] {
    return this.state.birds.filter(b => b.tenantId === tenantId);
  }

  getBirdById(id: string): Bird | undefined {
    return this.state.birds.find(b => b.id === id);
  }

  addBird(birdData: Omit<Bird, 'id' | 'createdAt' | 'updatedAt'>): Bird {
    const newBird: Bird = {
      ...birdData,
      id: `bird-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.birds.unshift(newBird);

    // Timeline event
    this.addTimelineEvent({
      tenantId: birdData.tenantId,
      birdId: newBird.id,
      date: newBird.entryDate || new Date().toISOString().split('T')[0],
      title: 'Ave Cadastrada no Plantel',
      description: `Ave ${newBird.name} (${newBird.ringNumber}) cadastrada com status ${newBird.status}.`,
      eventType: 'BIRTH',
      userName: 'Dr. Roberto Silveira'
    });

    // Ring auto update if exists
    if (birdData.ringNumber) {
      const existingRing = this.state.rings.find(r => r.number.trim().toLowerCase() === birdData.ringNumber.trim().toLowerCase());
      if (existingRing) {
        existingRing.status = 'USED';
        existingRing.birdId = newBird.id;
        existingRing.birdName = newBird.name;
      }
    }

    this.logAction(birdData.tenantId, 'CREATE_BIRD', 'AVES', `Ave cadastrada: ${newBird.name} (${newBird.ringNumber})`);
    this.saveToStorage();
    return newBird;
  }

  updateBird(id: string, data: Partial<Bird>): Bird | undefined {
    const idx = this.state.birds.findIndex(b => b.id === id);
    if (idx >= 0) {
      const oldCage = this.state.birds[idx].cageId;
      this.state.birds[idx] = { 
        ...this.state.birds[idx], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };

      if (data.cageId && data.cageId !== oldCage) {
        const cage = this.getCageById(data.cageId);
        this.addTimelineEvent({
          tenantId: this.state.birds[idx].tenantId,
          birdId: id,
          date: new Date().toISOString().split('T')[0],
          title: 'Transferência de Gaiola',
          description: `Ave alocada para gaiola: ${cage ? cage.name + ' (' + cage.code + ')' : data.cageId}`,
          eventType: 'CAGE_TRANSFER',
          userName: 'Dr. Roberto Silveira'
        });
      }

      this.logAction(this.state.birds[idx].tenantId, 'UPDATE_BIRD', 'AVES', `Ave atualizada: ${this.state.birds[idx].name}`);
      this.saveToStorage();
      return this.state.birds[idx];
    }
    return undefined;
  }

  deleteBird(id: string): boolean {
    const bird = this.getBirdById(id);
    if (!bird) return false;
    this.state.birds = this.state.birds.filter(b => b.id !== id);
    this.logAction(bird.tenantId, 'DELETE_BIRD', 'AVES', `Ave removida do plantel: ${bird.name}`);
    this.saveToStorage();
    return true;
  }

  // --- RINGS ---
  getRings(tenantId = 'tenant-demo-01'): Ring[] {
    return this.state.rings.filter(r => r.tenantId === tenantId);
  }

  addRing(ringData: Omit<Ring, 'id' | 'createdAt'>): Ring {
    const newRing: Ring = {
      ...ringData,
      id: `ring-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.state.rings.unshift(newRing);
    this.logAction(ringData.tenantId, 'CREATE_RING', 'ANILHAS', `Anilha cadastrada: ${newRing.number || newRing.code}`);
    this.saveToStorage();
    return newRing;
  }

  saveRing(ring: Ring): Ring {
    const idx = this.state.rings.findIndex(r => r.id === ring.id);
    if (idx >= 0) {
      this.state.rings[idx] = { ...this.state.rings[idx], ...ring };
      this.saveToStorage();
      return this.state.rings[idx];
    } else {
      const created: Ring = {
        ...ring,
        number: ring.number || ring.code || 'S/N',
        createdAt: ring.createdAt || new Date().toISOString()
      };
      this.state.rings.unshift(created);
      this.saveToStorage();
      return created;
    }
  }

  addRingsBatch(rings: Omit<Ring, 'id' | 'createdAt'>[]): number {
    let count = 0;
    rings.forEach(r => {
      this.addRing(r);
      count++;
    });
    return count;
  }

  updateRing(id: string, data: Partial<Ring>): Ring | undefined {
    const idx = this.state.rings.findIndex(r => r.id === id);
    if (idx >= 0) {
      this.state.rings[idx] = { ...this.state.rings[idx], ...data };
      this.saveToStorage();
      return this.state.rings[idx];
    }
    return undefined;
  }

  deleteRing(id: string): boolean {
    const ring = this.state.rings.find(r => r.id === id);
    if (!ring) return false;
    this.state.rings = this.state.rings.filter(r => r.id !== id);
    this.logAction(ring.tenantId, 'DELETE_RING', 'ANILHAS', `Anilha removida: ${ring.number}`);
    this.saveToStorage();
    return true;
  }

  // --- CAGES ---
  getCages(tenantId = 'tenant-demo-01'): Cage[] {
    return this.state.cages.filter(c => c.tenantId === tenantId);
  }

  getCageById(id: string): Cage | undefined {
    return this.state.cages.find(c => c.id === id);
  }

  addCage(cageData: Omit<Cage, 'id' | 'createdAt'>): Cage {
    const newCage: Cage = {
      ...cageData,
      id: `cage-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.cages.push(newCage);
    this.logAction(cageData.tenantId, 'CREATE_CAGE', 'GAIOLAS', `Gaiola cadastrada: ${newCage.code}`);
    this.saveToStorage();
    return newCage;
  }

  updateCage(id: string, data: Partial<Cage>): Cage | undefined {
    const idx = this.state.cages.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.state.cages[idx] = { ...this.state.cages[idx], ...data };
      this.saveToStorage();
      return this.state.cages[idx];
    }
    return undefined;
  }

  deleteCage(id: string): boolean {
    const cage = this.getCageById(id);
    if (!cage) return false;
    this.state.cages = this.state.cages.filter(c => c.id !== id);
    this.logAction(cage.tenantId, 'DELETE_CAGE', 'GAIOLAS', `Gaiola removida: ${cage.code}`);
    this.saveToStorage();
    return true;
  }

  // --- BREEDING & CLUTCHES ---
  getPairs(tenantId = 'tenant-demo-01'): BreedingPair[] {
    return this.state.pairs.filter(p => p.tenantId === tenantId);
  }

  addPair(pairData: Omit<BreedingPair, 'id' | 'createdAt' | 'clutchesCount' | 'totalEggs' | 'hatchedCount'>): BreedingPair {
    const newPair: BreedingPair = {
      ...pairData,
      id: `pair-${Date.now()}`,
      clutchesCount: 0,
      totalEggs: 0,
      hatchedCount: 0,
      createdAt: new Date().toISOString()
    };
    this.state.pairs.unshift(newPair);
    this.logAction(pairData.tenantId, 'CREATE_PAIR', 'REPRODUCAO', `Casal formado: ${newPair.name} (${newPair.code})`);
    this.saveToStorage();
    return newPair;
  }

  updatePair(id: string, data: Partial<BreedingPair>): BreedingPair | undefined {
    const idx = this.state.pairs.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.state.pairs[idx] = { ...this.state.pairs[idx], ...data };
      this.saveToStorage();
      return this.state.pairs[idx];
    }
    return undefined;
  }

  getClutches(tenantId = 'tenant-demo-01'): Clutch[] {
    return this.state.clutches.filter(c => c.tenantId === tenantId);
  }

  addClutch(clutchData: Omit<Clutch, 'id' | 'createdAt'>): Clutch {
    const newClutch: Clutch = {
      ...clutchData,
      id: `clutch-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.clutches.unshift(newClutch);
    
    // Update pair clutch count
    const pair = this.state.pairs.find(p => p.id === clutchData.pairId);
    if (pair) {
      pair.clutchesCount += 1;
      pair.totalEggs += clutchData.totalEggs;
      pair.hatchedCount += clutchData.hatchedEggs;
    }

    this.logAction(clutchData.tenantId, 'CREATE_CLUTCH', 'REPRODUCAO', `Postura #${newClutch.clutchNumber} registrada`);
    this.saveToStorage();
    return newClutch;
  }

  getEggs(tenantId = 'tenant-demo-01'): Egg[] {
    return this.state.eggs.filter(e => e.tenantId === tenantId);
  }

  addEgg(eggData: Omit<Egg, 'id' | 'createdAt'>): Egg {
    const newEgg: Egg = {
      ...eggData,
      id: `egg-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.eggs.push(newEgg);
    this.saveToStorage();
    return newEgg;
  }

  updateEgg(id: string, data: Partial<Egg>): Egg | undefined {
    const idx = this.state.eggs.findIndex(e => e.id === id);
    if (idx >= 0) {
      this.state.eggs[idx] = { ...this.state.eggs[idx], ...data };
      this.saveToStorage();
      return this.state.eggs[idx];
    }
    return undefined;
  }

  // --- MEDICATIONS & HEALTH ---
  getMedications(tenantId = 'tenant-demo-01'): Medication[] {
    return this.state.medications.filter(m => m.tenantId === tenantId);
  }

  addMedication(medData: Omit<Medication, 'id' | 'createdAt'>): Medication {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.medications.push(newMed);
    this.logAction(medData.tenantId, 'CREATE_MED', 'FARMACIA', `Medicamento adicionado: ${newMed.name}`);
    this.saveToStorage();
    return newMed;
  }

  getTreatments(tenantId = 'tenant-demo-01'): Treatment[] {
    return this.state.treatments.filter(t => t.tenantId === tenantId);
  }

  addTreatment(treatData: Omit<Treatment, 'id' | 'createdAt'>): Treatment {
    const newTreat: Treatment = {
      ...treatData,
      id: `treat-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.treatments.unshift(newTreat);

    this.addTimelineEvent({
      tenantId: treatData.tenantId,
      birdId: treatData.birdId,
      date: treatData.startDate,
      title: 'Início de Tratamento Clínico',
      description: `Iniciado protocolo com ${treatData.medicationName}. Dosagem: ${treatData.dosage} (${treatData.frequency}).`,
      eventType: 'TREATMENT',
      userName: treatData.responsiblePerson || 'Veterinário'
    });

    this.logAction(treatData.tenantId, 'CREATE_TREATMENT', 'SAUDE', `Tratamento iniciado para ${treatData.birdName}`);
    this.saveToStorage();
    return newTreat;
  }

  updateTreatment(id: string, data: Partial<Treatment>): Treatment | undefined {
    const idx = this.state.treatments.findIndex(t => t.id === id);
    if (idx >= 0) {
      this.state.treatments[idx] = { ...this.state.treatments[idx], ...data };
      this.saveToStorage();
      return this.state.treatments[idx];
    }
    return undefined;
  }

  getDiseases(tenantId = 'tenant-demo-01'): DiseaseRecord[] {
    return this.state.diseases.filter(d => d.tenantId === tenantId);
  }

  addDisease(diseaseData: Omit<DiseaseRecord, 'id' | 'createdAt'>): DiseaseRecord {
    const newDis: DiseaseRecord = {
      ...diseaseData,
      id: `dis-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.diseases.unshift(newDis);

    this.addTimelineEvent({
      tenantId: diseaseData.tenantId,
      birdId: diseaseData.birdId,
      date: diseaseData.diagnosedDate,
      title: 'Registro de Ocorrência Sanitária',
      description: `Diagnóstico: ${diseaseData.diseaseName}. Sintomas: ${diseaseData.symptoms}`,
      eventType: 'DISEASE',
      userName: diseaseData.veterinarian || 'Veterinário'
    });

    this.logAction(diseaseData.tenantId, 'CREATE_DISEASE', 'SAUDE', `Ocorrência registrada: ${diseaseData.diseaseName}`);
    this.saveToStorage();
    return newDis;
  }

  // --- SEXING & GENOTYPING ---
  getSexings(tenantId = 'tenant-demo-01'): SexingRecord[] {
    return this.state.sexings.filter(s => s.tenantId === tenantId);
  }

  addSexing(data: Omit<SexingRecord, 'id' | 'createdAt'>): SexingRecord {
    const newSexing: SexingRecord = {
      ...data,
      id: `sex-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.sexings.unshift(newSexing);

    // Update bird sex if confirmed
    if (data.result && data.result !== 'UNKNOWN') {
      this.updateBird(data.birdId, { sex: data.result });
    }

    this.addTimelineEvent({
      tenantId: data.tenantId,
      birdId: data.birdId,
      date: data.resultDate,
      title: 'Resultado de Sexagem DNA',
      description: `Sexo certificado como ${data.result === 'MALE' ? 'MACHO' : data.result === 'FEMALE' ? 'FÊMEA' : 'INDETERMINADO'} pelo laboratório ${data.laboratory}.`,
      eventType: 'SEXING',
      userName: 'Dr. Roberto Silveira'
    });

    this.logAction(data.tenantId, 'CREATE_SEXING', 'SEXAGEM', `Laudo sexagem emitido: ${data.birdName}`);
    this.saveToStorage();
    return newSexing;
  }

  getGenotyping(tenantId = 'tenant-demo-01'): GenotypingRecord[] {
    return this.state.genotyping.filter(g => g.tenantId === tenantId);
  }

  addGenotyping(data: Omit<GenotypingRecord, 'id' | 'createdAt'>): GenotypingRecord {
    const newGen: GenotypingRecord = {
      ...data,
      id: `gen-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.genotyping.unshift(newGen);

    this.addTimelineEvent({
      tenantId: data.tenantId,
      birdId: data.birdId,
      date: data.resultDate,
      title: 'Mapeamento Genômico Registrado',
      description: `Mutações identificadas: ${data.mutationsIdentified.join(', ')}`,
      eventType: 'GENETICS',
      userName: 'Geneticista'
    });

    this.logAction(data.tenantId, 'CREATE_GEN', 'GENETICA', `Laudo genético: ${data.birdName}`);
    this.saveToStorage();
    return newGen;
  }

  // --- TIMELINE & NOTIFICATIONS ---
  getTimeline(birdId: string, tenantId = 'tenant-demo-01'): BirdTimelineEvent[] {
    return this.state.timeline
      .filter(t => t.tenantId === tenantId && t.birdId === birdId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addTimelineEvent(event: Omit<BirdTimelineEvent, 'id' | 'createdAt'>): BirdTimelineEvent {
    const newEv: BirdTimelineEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.state.timeline.unshift(newEv);
    this.saveToStorage();
    return newEv;
  }

  getNotifications(tenantId = 'tenant-demo-01'): NotificationItem[] {
    if (!this.state.notifications || this.state.notifications.length === 0) {
      this.state.notifications = [...INITIAL_NOTIFICATIONS];
      this.saveToStorage();
    }
    return this.state.notifications.filter(n => n.tenantId === tenantId);
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    if (!this.state.notifications) this.state.notifications = [];
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.notifications.unshift(newNotif);
    this.saveToStorage();
    return newNotif;
  }

  updateNotification(notif: NotificationItem): void {
    if (!this.state.notifications) return;
    const idx = this.state.notifications.findIndex(n => n.id === notif.id);
    if (idx >= 0) {
      this.state.notifications[idx] = notif;
      this.saveToStorage();
    }
  }

  deleteNotification(id: string): void {
    if (!this.state.notifications) return;
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this.saveToStorage();
  }

  completeNotification(id: string): void {
    if (!this.state.notifications) return;
    const notif = this.state.notifications.find(n => n.id === id);
    if (notif) {
      notif.status = 'COMPLETED';
      notif.completedAt = new Date().toISOString();
      notif.read = true;
      this.saveToStorage();
    }
  }

  markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveToStorage();
    }
  }

  markAllNotificationsAsRead(tenantId = 'tenant-demo-01'): void {
    this.state.notifications.forEach(n => {
      if (n.tenantId === tenantId) n.read = true;
    });
    this.saveToStorage();
  }

  // --- DOCUMENTS & PHOTOS ---
  getDocuments(tenantId = 'tenant-demo-01'): BirdDocument[] {
    return this.state.documents.filter(d => d.tenantId === tenantId);
  }

  addDocument(doc: Omit<BirdDocument, 'id' | 'createdAt'>): BirdDocument {
    const newDoc: BirdDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.documents.unshift(newDoc);
    this.logAction(doc.tenantId, 'UPLOAD_DOC', 'DOCUMENTOS', `Documento anexado: ${doc.title}`);
    this.saveToStorage();
    return newDoc;
  }

  deleteDocument(id: string): boolean {
    const doc = this.state.documents.find(d => d.id === id);
    if (!doc) return false;
    this.state.documents = this.state.documents.filter(d => d.id !== id);
    this.saveToStorage();
    return true;
  }

  getPhotos(birdId?: string, tenantId = 'tenant-demo-01'): BirdPhoto[] {
    if (birdId) {
      return this.state.photos.filter(p => p.tenantId === tenantId && p.birdId === birdId);
    }
    return this.state.photos.filter(p => p.tenantId === tenantId);
  }

  addPhoto(photo: Omit<BirdPhoto, 'id' | 'createdAt'>): BirdPhoto {
    const newPhoto: BirdPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.photos.unshift(newPhoto);
    this.saveToStorage();
    return newPhoto;
  }

  // --- SUPPORT TICKETS ---
  getTickets(tenantId = 'tenant-demo-01'): SupportTicket[] {
    return (this.state.tickets || []).filter(t => t.tenantId === tenantId);
  }

  getAllTickets(): SupportTicket[] {
    return this.state.tickets || [];
  }

  getTicketById(id: string): SupportTicket | undefined {
    return (this.state.tickets || []).find(t => t.id === id);
  }

  addTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'ticketCode'>, initialMessage: string): SupportTicket {
    const randomCodeNumber = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketCode: `TKT-2026-${randomCodeNumber}`,
      unreadByAdmin: true,
      unreadByUser: false,
      lastReplyBy: 'USER',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: ticket.userName,
          senderRole: 'USER',
          isStaff: false,
          content: initialMessage,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!this.state.tickets) this.state.tickets = [];
    this.state.tickets.unshift(newTicket);
    this.logAction(ticket.tenantId, 'CREATE_TICKET', 'SUPORTE', `Novo chamado aberto #${newTicket.ticketCode}: ${newTicket.subject} (WhatsApp: ${newTicket.userWhatsapp})`);
    this.saveToStorage();
    return newTicket;
  }

  addTicketMessage(ticketId: string, sender: string, content: string, isStaff = false, senderRole: 'USER' | 'ADMIN' | 'SUPPORT_AGENT' = 'USER'): SupportTicket | undefined {
    const tkt = (this.state.tickets || []).find(t => t.id === ticketId);
    if (tkt) {
      tkt.messages.push({
        id: `msg-${Date.now()}`,
        sender,
        senderRole: isStaff ? (senderRole === 'USER' ? 'ADMIN' : senderRole) : 'USER',
        isStaff,
        content,
        createdAt: new Date().toISOString()
      });
      tkt.updatedAt = new Date().toISOString();
      tkt.lastReplyBy = isStaff ? 'ADMIN' : 'USER';
      if (isStaff) {
        tkt.unreadByUser = true;
        tkt.unreadByAdmin = false;
        if (tkt.status === 'OPEN') {
          tkt.status = 'IN_PROGRESS';
        }
      } else {
        tkt.unreadByAdmin = true;
        tkt.unreadByUser = false;
      }
      this.saveToStorage();
      return tkt;
    }
    return undefined;
  }

  updateTicketStatus(ticketId: string, status: SupportTicket['status']): SupportTicket | undefined {
    const tkt = (this.state.tickets || []).find(t => t.id === ticketId);
    if (tkt) {
      tkt.status = status;
      tkt.updatedAt = new Date().toISOString();
      this.saveToStorage();
      return tkt;
    }
    return undefined;
  }

  markTicketAsReadByAdmin(ticketId: string): void {
    const tkt = (this.state.tickets || []).find(t => t.id === ticketId);
    if (tkt) {
      tkt.unreadByAdmin = false;
      this.saveToStorage();
    }
  }

  markTicketAsReadByUser(ticketId: string): void {
    const tkt = (this.state.tickets || []).find(t => t.id === ticketId);
    if (tkt) {
      tkt.unreadByUser = false;
      this.saveToStorage();
    }
  }

  deleteTicket(ticketId: string): boolean {
    if (!this.state.tickets) return false;
    const initialLen = this.state.tickets.length;
    this.state.tickets = this.state.tickets.filter(t => t.id !== ticketId);
    if (this.state.tickets.length < initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- SELLERS & AFFILIATES ---
  getSellers(): SellerAffiliate[] {
    return this.state.sellers || [];
  }

  getSellerById(id: string): SellerAffiliate | undefined {
    return (this.state.sellers || []).find(s => s.id === id);
  }

  getSellerByEmail(email: string): SellerAffiliate | undefined {
    const clean = email.toLowerCase().trim();
    return (this.state.sellers || []).find(s => s.email.toLowerCase().trim() === clean);
  }

  getSellerByTenantId(tenantId: string): SellerAffiliate | undefined {
    return (this.state.sellers || []).find(s => s.linkedTenantId === tenantId);
  }

  getSellerByCode(code: string): SellerAffiliate | undefined {
    return (this.state.sellers || []).find(s => s.affiliateCode.toLowerCase() === code.toLowerCase() || s.couponCode.toLowerCase() === code.toLowerCase());
  }

  addSeller(seller: SellerAffiliate): void {
    if (!this.state.sellers) this.state.sellers = [];
    this.state.sellers.unshift(seller);

    // If linked to an existing criatório tenant, sync its referral configuration
    if (seller.linkedTenantId) {
      this.syncSellerWithTenantReferral(seller);
    }

    // If independent seller, create a dedicated SELLER User login account
    if (seller.isIndependentSeller || seller.password) {
      this.syncIndependentSellerUser(seller);
    }

    this.logAction('tenant-demo-01', 'CREATE', 'VENDEDORES', `Vendedor/Afiliado ${seller.name} cadastrado com código ${seller.affiliateCode}`);
    this.saveToStorage();
  }

  updateSeller(seller: SellerAffiliate): void {
    if (!this.state.sellers) this.state.sellers = [];
    const idx = this.state.sellers.findIndex(s => s.id === seller.id);
    if (idx >= 0) {
      this.state.sellers[idx] = seller;

      // If linked to a criatório tenant, update its referral settings
      if (seller.linkedTenantId) {
        this.syncSellerWithTenantReferral(seller);
      }

      // If independent seller, update corresponding user
      if (seller.isIndependentSeller || seller.password) {
        this.syncIndependentSellerUser(seller);
      }

      this.logAction('tenant-demo-01', 'UPDATE', 'VENDEDORES', `Dados do vendedor/afiliado ${seller.name} atualizados`);
      this.saveToStorage();
    }
  }

  syncSellerWithTenantReferral(seller: SellerAffiliate): void {
    if (!seller.linkedTenantId) return;
    if (!this.state.userReferrals) this.state.userReferrals = { ...INITIAL_USER_REFERRALS };

    const ref = this.getUserReferral(seller.linkedTenantId);
    ref.referralCode = seller.affiliateCode;
    ref.referralUrl = seller.affiliateUrl;
    ref.couponCode = seller.couponCode;
    ref.userCommissionPercent = seller.commissionPercent;
    ref.pixKey = seller.pixKey;
    ref.pixKeyType = seller.pixKeyType;
    ref.isOfficialPartner = true;
    ref.partnerType = seller.type;
    ref.monthlySalesGoal = seller.monthlySalesGoal;
    ref.monthlySignupsGoal = seller.monthlySignupsGoal;
    ref.goalBonusPercent = seller.goalBonusPercent;
    ref.goalBonusFixed = seller.goalBonusFixed;
  }

  syncIndependentSellerUser(seller: SellerAffiliate): void {
    if (!this.state.users) this.state.users = [...INITIAL_USERS];
    const cleanEmail = seller.email.toLowerCase().trim();
    const existing = this.state.users.find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      existing.name = seller.name;
      existing.phone = seller.phone;
      existing.role = 'SELLER';
      existing.active = seller.status === 'ACTIVE';
    } else {
      const newUser: User = {
        id: seller.linkedUserId || `user-seller-${seller.id}`,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        role: 'SELLER',
        tenantId: `seller-tenant-${seller.id}`,
        active: seller.status === 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      this.state.users.push(newUser);
    }
  }

  deleteSeller(id: string): void {
    if (!this.state.sellers) return;
    const s = this.state.sellers.find(x => x.id === id);
    this.state.sellers = this.state.sellers.filter(x => x.id !== id);
    if (s) {
      if (s.linkedTenantId && this.state.userReferrals && this.state.userReferrals[s.linkedTenantId]) {
        this.state.userReferrals[s.linkedTenantId].isOfficialPartner = false;
      }
      this.logAction('tenant-demo-01', 'DELETE', 'VENDEDORES', `Vendedor/Afiliado ${s.name} excluído`);
    }
    this.saveToStorage();
  }

  recordAffiliateClick(code: string): void {
    const s = this.getSellerByCode(code);
    if (s) {
      s.totalClicks = (s.totalClicks || 0) + 1;
      this.saveToStorage();
    }
  }

  // --- COMMISSIONS & PAYOUTS ---
  getCommissions(sellerId?: string): AffiliateCommission[] {
    const list = this.state.commissions || [];
    if (sellerId) return list.filter(c => c.affiliateId === sellerId);
    return list;
  }

  addCommission(comm: AffiliateCommission): void {
    if (!this.state.commissions) this.state.commissions = [];
    this.state.commissions.unshift(comm);
    // Update seller balances
    const seller = this.getSellerById(comm.affiliateId);
    if (seller) {
      seller.totalSalesValue += comm.saleValue;
      seller.totalCommissionsEarned += comm.commissionAmount;
      seller.balanceAvailable += comm.commissionAmount;
      seller.totalSignups += 1;
    }
    this.saveToStorage();
  }

  getPayouts(sellerId?: string): AffiliatePayout[] {
    const list = this.state.payouts || [];
    if (sellerId) return list.filter(p => p.affiliateId === sellerId);
    return list;
  }

  requestPayout(payout: AffiliatePayout): void {
    if (!this.state.payouts) this.state.payouts = [];
    this.state.payouts.unshift(payout);
    const seller = this.getSellerById(payout.affiliateId);
    if (seller) {
      seller.balanceAvailable = Math.max(0, seller.balanceAvailable - payout.amount);
      seller.totalCommissionsPaid += payout.amount;
    }
    this.saveToStorage();
  }

  updatePayoutStatus(id: string, status: 'PROCESSING' | 'COMPLETED' | 'REJECTED'): void {
    if (!this.state.payouts) return;
    const p = this.state.payouts.find(x => x.id === id);
    if (p) {
      p.status = status;
      if (status === 'COMPLETED') p.completedAt = new Date().toISOString();
      if (status === 'REJECTED') {
        // Refund balance to seller
        const seller = this.getSellerById(p.affiliateId);
        if (seller) {
          seller.balanceAvailable += p.amount;
          seller.totalCommissionsPaid = Math.max(0, seller.totalCommissionsPaid - p.amount);
        }
      }
      this.saveToStorage();
    }
  }

  // --- USER REFERRAL PROGRAM (INDIQUE & GANHE) ---
  getUserReferral(tenantId = 'tenant-demo-01'): UserReferralProgram {
    if (!this.state.userReferrals) {
      this.state.userReferrals = { ...INITIAL_USER_REFERRALS };
    }
    if (!this.state.userReferrals[tenantId]) {
      const tenant = this.getTenant(tenantId);
      const code = (tenant?.slug || tenant?.name || 'criador')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 12) + '10';
      this.state.userReferrals[tenantId] = {
        tenantId,
        referralCode: code,
        referralUrl: `https://www.birdpro.com.br/cadastro?ref=${code}`,
        couponCode: code.toUpperCase(),
        friendDiscountPercent: 10,
        userCommissionPercent: 20,
        pixKey: tenant?.email || '',
        pixKeyType: 'EMAIL',
        totalClicks: 14,
        totalInvited: 0,
        totalPaid: 0,
        totalEarnings: 0,
        balanceAvailable: 0,
        totalWithdrawn: 0,
        referrals: [],
        payouts: []
      };
      this.saveToStorage();
    }
    return this.state.userReferrals[tenantId];
  }

  updateUserReferralPix(tenantId: string, pixKey: string, pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'): UserReferralProgram {
    const prog = this.getUserReferral(tenantId);
    prog.pixKey = pixKey;
    prog.pixKeyType = pixKeyType;
    this.saveToStorage();
    return prog;
  }

  requestUserReferralPayout(tenantId: string, amount: number, pixKey: string): AffiliatePayout | null {
    const prog = this.getUserReferral(tenantId);
    if (!prog || amount <= 0 || amount > prog.balanceAvailable) return null;

    const payout: AffiliatePayout = {
      id: `pay-ref-${Date.now()}`,
      affiliateId: tenantId,
      affiliateName: this.getTenant(tenantId)?.name || 'Criatório Parceiro',
      amount,
      pixKey,
      receiptUrl: `https://comprovante.pix.birdpro.com.br/tx-ref-${Date.now()}`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    prog.balanceAvailable = Math.max(0, prog.balanceAvailable - amount);
    prog.totalWithdrawn += amount;
    prog.payouts.unshift(payout);
    this.logAction(tenantId, 'PAYOUT_REFERRAL', 'INDIQUE_E_GANHE', `Saque PIX de R$ ${amount.toFixed(2)} efetuado via Indique & Ganhe`);
    this.saveToStorage();
    return payout;
  }

  addReferralFriend(tenantId: string, friend: Omit<ReferredFriend, 'id'>): ReferredFriend {
    const prog = this.getUserReferral(tenantId);
    const newFriend: ReferredFriend = {
      ...friend,
      id: `ref-${Date.now()}`
    };
    prog.referrals.unshift(newFriend);
    prog.totalInvited += 1;
    if (newFriend.status === 'ACTIVE_PAID') {
      prog.totalPaid += 1;
      prog.totalEarnings += newFriend.rewardAmount;
      prog.balanceAvailable += newFriend.rewardAmount;
    }
    this.saveToStorage();
    return newFriend;
  }

  // --- GLOBAL SYSTEM CONFIG ---
  getGlobalConfig(): GlobalSystemConfig {
    return this.state.globalConfig || { ...INITIAL_GLOBAL_CONFIG };
  }

  updateGlobalConfig(config: Partial<GlobalSystemConfig>): void {
    this.state.globalConfig = { ...this.getGlobalConfig(), ...config };
    this.logAction('tenant-demo-01', 'UPDATE', 'CONFIG_SISTEMA', 'Configurações globais do sistema BirdPro atualizadas');
    this.saveToStorage();
  }

  // --- SUPER ADMIN TENANT & USER MANAGEMENT ---
  createTenantManual(data: {
    name: string;
    responsibleName?: string;
    email: string;
    phone?: string;
    document?: string;
    plan: PlanType;
    billingCycle: 'MENSAL' | 'ANUAL' | 'ISENTO';
    maxBirds?: number;
    expiresAt?: string;
    planStatus?: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
    password?: string;
  }): { tenant: Tenant; user: User } {
    const tenantId = `tenant-${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);

    let calculatedExpiresAt = data.expiresAt;
    if (!calculatedExpiresAt) {
      if (data.billingCycle === 'ISENTO') {
        calculatedExpiresAt = '2099-12-31T23:59:59Z';
      } else if (data.billingCycle === 'MENSAL') {
        calculatedExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        calculatedExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const newTenant: Tenant = {
      id: tenantId,
      name: data.name,
      slug,
      document: data.document || '',
      email: data.email,
      phone: data.phone || '',
      plan: data.plan,
      billingCycle: data.billingCycle,
      planStatus: data.planStatus || 'ACTIVE',
      maxBirds: data.maxBirds || (data.plan === 'PREMIUM' ? 9999 : data.plan === 'PRO' ? 500 : 50),
      setupProgress: 100,
      expiresAt: calculatedExpiresAt,
      createdAt: new Date().toISOString(),
      owners: data.responsibleName ? [
        {
          id: `owner-${Date.now()}`,
          name: data.responsibleName,
          cpf: data.document || '',
          phone: data.phone || '',
          city: '',
          state: '',
          isMain: true
        }
      ] : [],
      visualConfig: INITIAL_TENANT.visualConfig
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.responsibleName || data.name,
      email: data.email,
      phone: data.phone,
      role: 'OWNER',
      tenantId: tenantId,
      active: true,
      createdAt: new Date().toISOString()
    };

    if (!this.state.tenants) this.state.tenants = [];
    if (!this.state.users) this.state.users = [];

    this.state.tenants.unshift(newTenant);
    this.state.users.unshift(newUser);
    this.logAction('tenant-demo-01', 'CREATE_TENANT_MANUAL', 'ADMIN_TENANTS', `Criatório ${newTenant.name} (${newTenant.billingCycle} - ${newTenant.plan}) cadastrado manualmente`);
    this.saveToStorage();
    return { tenant: newTenant, user: newUser };
  }

  updateTenantPlan(
    tenantId: string, 
    plan: PlanType, 
    billingCycle: 'MENSAL' | 'ANUAL' | 'ISENTO', 
    planStatus: any, 
    expiresAt: string, 
    maxBirds: number
  ): void {
    const t = this.state.tenants.find(x => x.id === tenantId);
    if (t) {
      t.plan = plan;
      t.billingCycle = billingCycle;
      t.planStatus = planStatus;
      t.expiresAt = expiresAt;
      t.maxBirds = maxBirds;
      this.logAction(tenantId, 'UPDATE', 'TENANTS', `Licença do criatório ${t.name} atualizada: ${plan} (${billingCycle} - ${planStatus})`);
      this.saveToStorage();
    }
  }

  renewTenantPlan(tenantId: string, monthsToAdd: number = 1): Tenant | undefined {
    const t = this.state.tenants.find(x => x.id === tenantId);
    if (t) {
      const currentExp = new Date(t.expiresAt).getTime() > Date.now() 
        ? new Date(t.expiresAt) 
        : new Date();
      currentExp.setMonth(currentExp.getMonth() + monthsToAdd);
      t.expiresAt = currentExp.toISOString();
      t.planStatus = 'ACTIVE';
      t.lastPaymentDate = new Date().toISOString();
      this.logAction(tenantId, 'RENEW_PLAN', 'FINANCEIRO', `Plano renovado por +${monthsToAdd} mês(es) via PIX. Novo vencimento: ${t.expiresAt}`);
      this.saveToStorage();
      return t;
    }
    return undefined;
  }

  deleteTenant(tenantId: string): boolean {
    if (tenantId === 'tenant-demo-01') return false; // Protect demo master
    const initialLen = this.state.tenants.length;
    this.state.tenants = this.state.tenants.filter(t => t.id !== tenantId);
    this.state.users = this.state.users.filter(u => u.tenantId !== tenantId);
    this.state.birds = this.state.birds.filter(b => b.tenantId !== tenantId);
    if (this.state.tenants.length < initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(tenantId?: string): AuditLog[] {
    if (tenantId) return this.state.auditLogs.filter(l => l.tenantId === tenantId);
    return this.state.auditLogs;
  }

  // --- BACKUP & RESTORE ---
  exportBackup(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tenants && parsed.birds) {
        this.state = parsed;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid backup file', e);
      return false;
    }
  }

  // --- CALENDAR & APPOINTMENTS ---
  getEvents(tenantId = 'tenant-demo-01'): CalendarEvent[] {
    if (!this.state.events || this.state.events.length === 0) {
      this.state.events = [...INITIAL_CALENDAR_EVENTS];
      this.saveToStorage();
    }
    return this.state.events.filter(e => e.tenantId === tenantId);
  }

  addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent {
    if (!this.state.events) this.state.events = [];
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.state.events.unshift(newEvent);

    // If push notification alert is enabled, also create a Criatório Notification
    if (newEvent.enablePushAlert) {
      const notifCat = newEvent.category === 'MEDICATION' || newEvent.category === 'VACCINE' 
        ? 'MEDICATION' 
        : newEvent.category === 'BREEDING' 
        ? 'EGG_HATCH' 
        : newEvent.category === 'RINGING' 
        ? 'RING' 
        : 'CUSTOM';

      this.addNotification({
        tenantId: newEvent.tenantId,
        type: 'ALERT',
        category: notifCat,
        priority: 'HIGH',
        title: `Lembrete: ${newEvent.title}`,
        message: `${newEvent.description || newEvent.title} marcado para ${newEvent.startDate}${newEvent.startTime ? ` às ${newEvent.startTime}` : ''}.`,
        dueDate: newEvent.startDate,
        dueTime: newEvent.startTime,
        birdName: newEvent.birdName,
        cageName: newEvent.cageId,
        status: 'PENDING',
        pushEnabled: true,
        read: false
      });
    }

    this.logAction(event.tenantId, 'CREATE_EVENT', 'CALENDARIO', `Compromisso agendado: ${event.title} em ${event.startDate}`);
    this.saveToStorage();
    return newEvent;
  }

  updateEvent(event: CalendarEvent): void {
    if (!this.state.events) return;
    const idx = this.state.events.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      this.state.events[idx] = event;
      this.logAction(event.tenantId, 'UPDATE_EVENT', 'CALENDARIO', `Compromisso atualizado: ${event.title}`);
      this.saveToStorage();
    }
  }

  deleteEvent(id: string): void {
    if (!this.state.events) return;
    const evt = this.state.events.find(e => e.id === id);
    if (evt) {
      this.state.events = this.state.events.filter(e => e.id !== id);
      this.logAction(evt.tenantId, 'DELETE_EVENT', 'CALENDARIO', `Compromisso excluído: ${evt.title}`);
      this.saveToStorage();
    }
  }

  // --- ANOTAÇÕES & BLOCO DE NOTAS ---
  getNotes(tenantId = 'tenant-demo-01'): NoteItem[] {
    if (!this.state.notes || this.state.notes.length === 0) {
      this.state.notes = [...INITIAL_NOTES];
      this.saveToStorage();
    }
    return this.state.notes
      .filter(n => n.tenantId === tenantId)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  addNote(note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): NoteItem {
    if (!this.state.notes) this.state.notes = [];
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.state.notes.unshift(newNote);

    // If marked as calendar reminder with date, also create a calendar event
    if (newNote.type === 'CALENDAR_REMINDER' && newNote.agendaDate) {
      this.addEvent({
        tenantId: newNote.tenantId,
        title: `Lembrete: ${newNote.title}`,
        category: 'GENERAL',
        startDate: newNote.agendaDate,
        startTime: newNote.agendaTime,
        allDay: !newNote.agendaTime,
        description: newNote.content,
        enablePushAlert: true,
        reminderMinutesBefore: 30,
        status: newNote.finalized ? 'COMPLETED' : 'SCHEDULED'
      });
    }

    this.logAction(note.tenantId, 'CREATE_NOTE', 'ANOTACOES', `Anotação criada: ${note.title}`);
    this.saveToStorage();
    return newNote;
  }

  updateNote(note: NoteItem): void {
    if (!this.state.notes) return;
    const idx = this.state.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.state.notes[idx] = {
        ...note,
        updatedAt: new Date().toISOString()
      };
      this.logAction(note.tenantId, 'UPDATE_NOTE', 'ANOTACOES', `Anotação atualizada: ${note.title}`);
      this.saveToStorage();
    }
  }

  deleteNote(id: string): void {
    if (!this.state.notes) return;
    const note = this.state.notes.find(n => n.id === id);
    if (note) {
      this.state.notes = this.state.notes.filter(n => n.id !== id);
      this.logAction(note.tenantId, 'DELETE_NOTE', 'ANOTACOES', `Anotação excluída: ${note.title}`);
      this.saveToStorage();
    }
  }

  toggleNoteFinalized(id: string): void {
    if (!this.state.notes) return;
    const note = this.state.notes.find(n => n.id === id);
    if (note) {
      note.finalized = !note.finalized;
      note.updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  toggleNotePinned(id: string): void {
    if (!this.state.notes) return;
    const note = this.state.notes.find(n => n.id === id);
    if (note) {
      note.pinned = !note.pinned;
      note.updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  // ==========================================
  // APRENDIZADO CONTÍNUO & MEMÓRIA DO CONSULTOR
  // ==========================================
  getLearnedInsights(): AiLearnedInsight[] {
    return this.state.insights || [];
  }

  addLearnedInsight(topic: string, query: string, summary: string, userName?: string): AiLearnedInsight {
    if (!this.state.insights) this.state.insights = [];
    const lowerTopic = topic.toLowerCase().trim();
    const existing = this.state.insights.find(i => i.topic.toLowerCase().trim() === lowerTopic || i.userQuery.toLowerCase().trim() === query.toLowerCase().trim());
    if (existing) {
      existing.occurrences = (existing.occurrences || 1) + 1;
      existing.insightSummary = summary;
      existing.updatedAt = new Date().toISOString();
      this.saveToStorage();
      return existing;
    }
    const newInsight: AiLearnedInsight = {
      id: `ins-${Date.now()}`,
      topic,
      userQuery: query,
      insightSummary: summary,
      learnedFromUser: userName || 'Criador',
      occurrences: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.insights.push(newInsight);
    this.saveToStorage();
    return newInsight;
  }

  resetToDemoData(): void {
    this.state = this.getInitialState();
    this.saveToStorage();
  }
}

export const db = new DataService();
