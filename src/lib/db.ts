import { 
  Bird, Cage, Ring, BreedingPair, Clutch, Egg, DiseaseRecord, Medication, 
  Treatment, SexingRecord, GenotypingRecord, BirdTimelineEvent, 
  NotificationItem, Tenant, User, SupportTicket, BirdDocument, BirdPhoto, AuditLog,
  SellerAffiliate, AffiliateCommission, AffiliatePayout, GlobalSystemConfig,
  CalendarEvent, NoteItem, AiLearnedInsight, UserReferralProgram, ReferredFriend, PlanType,
  CouponValidationResult
} from '@/types';
import { 
  INITIAL_TENANT, INITIAL_ALL_TENANTS, INITIAL_USERS, INITIAL_BIRDS, INITIAL_CAGES, 
  INITIAL_RINGS, INITIAL_PAIRS, INITIAL_CLUTCHES, INITIAL_EGGS, 
  INITIAL_MEDICATIONS, INITIAL_TREATMENTS, INITIAL_DISEASES, 
  INITIAL_SEXINGS, INITIAL_GENOTYPING, INITIAL_TIMELINE, 
  INITIAL_NOTIFICATIONS, INITIAL_DOCUMENTS, INITIAL_TICKETS,
  INITIAL_SELLERS, INITIAL_COMMISSIONS, INITIAL_PAYOUTS, INITIAL_GLOBAL_CONFIG, INITIAL_CALENDAR_EVENTS, INITIAL_NOTES,
  INITIAL_USER_REFERRALS
} from './seed-data';
import { firebaseSync } from './firebase-service';

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

const STORAGE_KEY = 'birdpro_production_db_v2';

class DataService {
  private state: DatabaseState;
  private isBrowser: boolean;
  private hasInitializedCloud: boolean = false;

  // --- Sincronização em nuvem dos dados do criatório (aves, genealogia, gaiolas...) ---
  private static SYNC_COLLECTIONS = [
    'birds', 'cages', 'rings', 'pairs', 'clutches', 'eggs', 'medications', 'treatments',
    'diseases', 'sexings', 'genotyping', 'timeline', 'notifications', 'documents',
    'photos', 'events', 'notes'
  ];
  private syncTenantId: string | null = null;
  private syncReady = false;
  private syncUnsubs: (() => void)[] = [];
  private syncIndex: Record<string, Record<string, string>> = {};
  private pushTimer: any = null;
  private pushing = false;
  private pushAgain = false;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    this.state = this.getInitialState();
    if (this.isBrowser) {
      this.loadFromStorage();
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          this.syncCloudData().catch(e => console.warn('Cloud sync init error:', e));
        }, 50);
      }
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
      commissions: [...INITIAL_COMMISSIONS],
      payouts: [...INITIAL_PAYOUTS],
      userReferrals: { ...INITIAL_USER_REFERRALS },
      globalConfig: { ...INITIAL_GLOBAL_CONFIG },
      events: [...INITIAL_CALENDAR_EVENTS],
      notes: [...INITIAL_NOTES],
      insights: [],
      auditLogs: []
    };
  }

  private loadFromStorage() {
    if (!this.isBrowser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...this.getInitialState(), ...parsed };
        if (!this.state.sellers || this.state.sellers.length === 0) {
          this.state.sellers = [...INITIAL_SELLERS];
        }
        if (!this.state.commissions || this.state.commissions.length === 0) {
          this.state.commissions = [...INITIAL_COMMISSIONS];
        }
        if (!this.state.payouts || this.state.payouts.length === 0) {
          this.state.payouts = [...INITIAL_PAYOUTS];
        }
        if (!this.state.users || this.state.users.length === 0) {
          this.state.users = [...INITIAL_USERS];
        } else {
          INITIAL_USERS.forEach(iu => {
            if (!this.state.users.some(u => u.email.toLowerCase().trim() === iu.email.toLowerCase().trim())) {
              this.state.users.push({ ...iu });
            }
          });
          // Ensure henriquerocha93 is strictly OWNER (Criatório) and not admin
          this.state.users = this.state.users.map(u => {
            if (u.email.toLowerCase().trim() === 'henriquerocha93@hotmail.com') {
              return { ...u, role: 'OWNER' as const };
            }
            return u;
          });
        }
        if (this.state.globalConfig) {
          this.state.globalConfig.gatewayProvider = 'MERCADOPAGO';
          this.state.globalConfig.gatewayApiKey = INITIAL_GLOBAL_CONFIG.gatewayApiKey;
        }

        // Auto-sanitize legacy demo data from tenants in storage
        if (this.state.tenants && this.state.tenants.length > 0) {
          let hadDemoFields = false;
          this.state.tenants = this.state.tenants.map(t => {
            const isDemo = 
              t.slug === 'madruguinha' || 
              t.name?.includes('Madruguinha') || 
              t.facebook?.includes('MADRUGUINHA') ||
              t.instagram?.includes('MADRUGUINHA') ||
              t.address === 'Rua das violetas' ||
              t.city === 'IJUI' ||
              t.registryNumber === '4719754' ||
              t.website?.includes('madruguinha');

            if (isDemo || t.address === 'Rua das violetas' || t.city === 'IJUI' || t.registryNumber === '4719754') {
              hadDemoFields = true;
            }

            return {
              ...t,
              name: t.name?.includes('Madruguinha') ? '' : t.name,
              slug: t.slug === 'madruguinha' ? '' : t.slug,
              document: (t.document === '022.034.960-61' || t.document === '000.000.000-00') ? '' : t.document,
              email: t.email === 'luis.henrique.schreiber@hotmail.com' ? '' : t.email,
              phone: (t.phone === '(55) 9134-3265' || t.phone === '(55) 9 9134-3265') ? '' : t.phone,
              cellphone: (t.cellphone === '(55) 9 9134-3265' || t.cellphone === '(55) 9134-3265') ? '' : t.cellphone,
              whatsapp: (t.whatsapp === '5555991343265' || t.whatsapp === '(55) 9 9134-3265' || t.whatsapp === '5591343265') ? '' : t.whatsapp,
              address: t.address === 'Rua das violetas' ? '' : t.address,
              addressNumber: t.addressNumber === '109' ? '' : t.addressNumber,
              neighborhood: t.neighborhood === 'universitario' ? '' : t.neighborhood,
              city: t.city === 'IJUI' ? '' : t.city,
              state: (t.state === 'RS' && (t.city === 'IJUI' || !t.city)) ? '' : t.state,
              zipCode: (t.zipCode === '98700-000' || t.zipCode === '98700 000') ? '' : t.zipCode,
              registryNumber: t.registryNumber === '4719754' ? '' : t.registryNumber,
              facebook: t.facebook?.includes('MADRUGUINHA') ? '' : t.facebook,
              instagram: t.instagram?.includes('MADRUGUINHA') ? '' : t.instagram,
              website: (t.website?.includes('madruguinha') || t.website?.includes('Madruguinha')) ? '' : t.website,
              owners: (t.owners || []).filter(o => !o.name?.includes('Madruguinha') && !o.nickname?.includes('Madruguinha') && !o.name?.includes('Schreiber'))
            };
          });
          if (hadDemoFields) {
            this.saveToStorage();
          }
        }

        // Auto-sanitize legacy demo user
        if (this.state.users && this.state.users.length > 0) {
          this.state.users = this.state.users.map(u => {
            if (u.email === 'luis.henrique.schreiber@hotmail.com' || u.name?.includes('Schreiber')) {
              return {
                ...u,
                name: 'Usuário BIRDPRO',
                email: 'usuario@birdpro.com.br',
                phone: ''
              };
            }
            return u;
          });
        }
      } else {
        this.saveToStorage();
      }
    } catch (e) {
      console.error('Failed to load db from storage', e);
    }
  }

  private persist() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new Event('birdpro_db_updated'));
    } catch (e) {
      console.error('Failed to persist db to storage', e);
    }
  }

  private saveToStorage() {
    this.persist();
    this.schedulePush();
  }

  // ===================== SYNC DE DADOS DO CRIATÓRIO (NUVEM) =====================
  private stableStringify(v: any): string {
    if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
    if (Array.isArray(v)) return '[' + v.map(x => this.stableStringify(x)).join(',') + ']';
    return '{' + Object.keys(v).sort()
      .filter(k => v[k] !== undefined)
      .map(k => JSON.stringify(k) + ':' + this.stableStringify(v[k])).join(',') + '}';
  }

  private hashItem(v: any): string {
    const s = this.stableStringify(v);
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return `${s.length}:${h}`;
  }

  private indexKey(tenantId: string) {
    return `birdpro_sync_index_${tenantId}`;
  }

  private loadSyncIndex(tenantId: string) {
    try {
      const raw = localStorage.getItem(this.indexKey(tenantId));
      this.syncIndex = raw ? JSON.parse(raw) : {};
    } catch {
      this.syncIndex = {};
    }
  }

  private saveSyncIndex() {
    if (!this.syncTenantId) return;
    try {
      localStorage.setItem(this.indexKey(this.syncTenantId), JSON.stringify(this.syncIndex));
    } catch {}
  }

  public startTenantSync(tenantId: string): void {
    if (!this.isBrowser || !tenantId || !firebaseSync.isAvailable()) return;
    if (this.syncTenantId === tenantId) return;

    this.syncUnsubs.forEach(u => { try { u(); } catch {} });
    this.syncUnsubs = [];
    this.syncTenantId = tenantId;
    this.syncReady = false;
    this.loadSyncIndex(tenantId);

    const pending = new Set<string>(DataService.SYNC_COLLECTIONS);
    let anyChange = false;

    DataService.SYNC_COLLECTIONS.forEach(coll => {
      const unsub = firebaseSync.subscribeTenantCollection(coll, tenantId, (changes, isFirst) => {
        if (this.syncTenantId !== tenantId) return;
        const changed = this.applyRemoteChanges(coll, tenantId, changes, isFirst);
        if (changed) {
          this.persist();
          this.saveSyncIndex();
        }
        if (isFirst) {
          anyChange = anyChange || changed;
          pending.delete(coll);
          if (pending.size === 0) {
            this.syncReady = true;
            if (anyChange && typeof window !== 'undefined') {
              window.dispatchEvent(new Event('birdpro_initial_sync_done'));
            }
            // Envia o que só existe localmente (migração) e quaisquer alterações pendentes
            this.schedulePush(100);
          }
        } else if (changed && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('birdpro_db_updated'));
        }
      });
      this.syncUnsubs.push(unsub);
    });
  }

  private applyRemoteChanges(
    coll: string,
    tenantId: string,
    changes: { type: 'added' | 'modified' | 'removed'; id: string; data: any; pending: boolean }[],
    isFirst: boolean
  ): boolean {
    const st: any = this.state;
    if (!st[coll]) st[coll] = [];
    const arr: any[] = st[coll];
    const idx = (this.syncIndex[coll] = this.syncIndex[coll] || {});
    let changed = false;
    const cloudIds = new Set<string>(changes.map(c => c.id));

    for (const ch of changes) {
      if (ch.pending) continue; // eco de uma gravação local
      if (ch.type === 'removed') {
        const before = arr.length;
        st[coll] = st[coll].filter((x: any) => !(String(x.id) === ch.id && x.tenantId === tenantId));
        if (st[coll].length !== before) changed = true;
        delete idx[ch.id];
        continue;
      }
      const data = { ...ch.data, id: ch.data?.id ?? ch.id };
      const h = this.hashItem(data);
      const i = st[coll].findIndex((x: any) => String(x.id) === ch.id);
      if (i >= 0) {
        if (this.hashItem(st[coll][i]) !== h) {
          st[coll][i] = data;
          changed = true;
        }
      } else {
        st[coll].push(data);
        changed = true;
      }
      idx[ch.id] = h;
    }

    if (isFirst) {
      // Item que já esteve sincronizado e sumiu da nuvem = foi excluído em outro aparelho
      const before = st[coll].length;
      st[coll] = st[coll].filter((x: any) => {
        if (x.tenantId !== tenantId) return true;
        const id = String(x.id);
        if (!cloudIds.has(id) && idx[id]) {
          delete idx[id];
          return false;
        }
        return true;
      });
      if (st[coll].length !== before) changed = true;
    }
    return changed;
  }

  private schedulePush(delay = 1000) {
    if (!this.isBrowser || !this.syncReady || !this.syncTenantId) return;
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushChanges().catch(e => console.warn('Cloud push error:', e));
    }, delay);
  }

  private async pushChanges(): Promise<void> {
    if (this.pushing) {
      this.pushAgain = true;
      return;
    }
    const tid = this.syncTenantId;
    if (!tid || !this.syncReady || !firebaseSync.isAvailable()) return;
    this.pushing = true;
    try {
      const st: any = this.state;
      for (const coll of DataService.SYNC_COLLECTIONS) {
        const items: any[] = (st[coll] || []).filter((x: any) => x && x.id && x.tenantId === tid);
        const idx = (this.syncIndex[coll] = this.syncIndex[coll] || {});
        const currentIds = new Set<string>();

        for (const it of items) {
          const id = String(it.id);
          currentIds.add(id);
          const h = this.hashItem(it);
          if (idx[id] === h) continue;
          if (JSON.stringify(it).length > 900000) {
            console.warn(`Item ${coll}/${id} excede o limite do Firestore (1MB) e não foi sincronizado.`);
            continue;
          }
          const ok = await firebaseSync.saveDocument(coll, id, it, false);
          if (ok) idx[id] = h;
        }

        for (const id of Object.keys(idx)) {
          if (!currentIds.has(id)) {
            const ok = await firebaseSync.removeDocument(coll, id);
            if (ok) delete idx[id];
          }
        }
      }
      this.saveSyncIndex();
    } finally {
      this.pushing = false;
      if (this.pushAgain) {
        this.pushAgain = false;
        this.schedulePush(200);
      }
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

  // --- CLOUD FIRESTORE SYNCHRONIZATION ---
  public async syncCloudData(): Promise<void> {
    if (!this.isBrowser || !firebaseSync.isAvailable()) return;
    try {
      // 1. Fetch remote tenants & users from Firestore
      const [cloudTenants, cloudUsers] = await Promise.all([
        firebaseSync.fetchAllTenants(),
        firebaseSync.fetchAllUsers()
      ]);

      let stateChanged = false;

      // 2. Merge cloud tenants into local state
      if (cloudTenants && cloudTenants.length > 0) {
        if (!this.state.tenants) this.state.tenants = [];
        cloudTenants.forEach(ct => {
          const idx = this.state.tenants.findIndex(t => t.id === ct.id);
          if (idx >= 0) {
            const merged = { ...this.state.tenants[idx], ...ct };
            if (this.hashItem(this.state.tenants[idx]) !== this.hashItem(merged)) {
              this.state.tenants[idx] = merged;
              stateChanged = true;
            }
          } else {
            this.state.tenants.unshift(ct);
            stateChanged = true;
          }
        });
      }

      // 3. Merge cloud users into local state
      if (cloudUsers && cloudUsers.length > 0) {
        if (!this.state.users) this.state.users = [];
        cloudUsers.forEach(cu => {
          const cleanCuEmail = (cu.email || '').toLowerCase().trim();
          const idx = this.state.users.findIndex(u => 
            u.id === cu.id || (u.email && u.email.toLowerCase().trim() === cleanCuEmail)
          );
          if (idx >= 0) {
            const merged = { ...this.state.users[idx], ...cu };
            if (this.hashItem(this.state.users[idx]) !== this.hashItem(merged)) {
              this.state.users[idx] = merged;
              stateChanged = true;
            }
          } else {
            this.state.users.unshift(cu);
            stateChanged = true;
          }
        });
      }

      // 4. AUTOMATIC MIGRATION: Push any local tenants that are NOT in Firestore to Firestore!
      if (this.state.tenants && this.state.tenants.length > 0) {
        for (const localTenant of this.state.tenants) {
          if (localTenant.id !== 'tenant-demo-01' || (localTenant.name && localTenant.name.trim())) {
            const existsInCloud = cloudTenants.some(ct => ct.id === localTenant.id);
            if (!existsInCloud) {
              await firebaseSync.saveTenant(localTenant);
            }
          }
        }
      }

      // 5. AUTOMATIC MIGRATION: Push any local users that are NOT in Firestore to Firestore!
      if (this.state.users && this.state.users.length > 0) {
        for (const localUser of this.state.users) {
          if (localUser.email && localUser.email.trim()) {
            const cleanEmail = localUser.email.toLowerCase().trim();
            const existsInCloud = cloudUsers.some(cu => 
              cu.id === localUser.id || (cu.email && cu.email.toLowerCase().trim() === cleanEmail)
            );
            if (!existsInCloud) {
              await firebaseSync.saveUser(localUser);
            }
          }
        }
      }

      if (stateChanged) {
        this.saveToStorage();
      }

      // 6. Set up real-time subscriptions if not already initialized
      if (!this.hasInitializedCloud) {
        this.hasInitializedCloud = true;

        firebaseSync.subscribeToTenants((liveTenants) => {
          if (!liveTenants || liveTenants.length === 0) return;
          if (!this.state.tenants) this.state.tenants = [];
          let changed = false;
          liveTenants.forEach(lt => {
            const idx = this.state.tenants.findIndex(t => t.id === lt.id);
            if (idx >= 0) {
              const merged = { ...this.state.tenants[idx], ...lt };
              if (this.hashItem(this.state.tenants[idx]) !== this.hashItem(merged)) {
                this.state.tenants[idx] = merged;
                changed = true;
              }
            } else {
              this.state.tenants.unshift(lt);
              changed = true;
            }
          });
          if (changed) {
            this.saveToStorage();
          }
        });

        firebaseSync.subscribeToUsers((liveUsers) => {
          if (!liveUsers || liveUsers.length === 0) return;
          if (!this.state.users) this.state.users = [];
          let changed = false;
          liveUsers.forEach(lu => {
            const cleanEmail = (lu.email || '').toLowerCase().trim();
            const idx = this.state.users.findIndex(u => 
              u.id === lu.id || (u.email && u.email.toLowerCase().trim() === cleanEmail)
            );
            if (idx >= 0) {
              const merged = { ...this.state.users[idx], ...lu };
              if (this.hashItem(this.state.users[idx]) !== this.hashItem(merged)) {
                this.state.users[idx] = merged;
                changed = true;
              }
            } else {
              this.state.users.unshift(lu);
              changed = true;
            }
          });
          if (changed) {
            this.saveToStorage();
          }
        });
      }
    } catch (e) {
      console.warn('Error syncing cloud data with Firestore:', e);
    }
  }

  public mergeCloudUser(user: User): void {
    if (!this.state.users) this.state.users = [];
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const idx = this.state.users.findIndex(u => 
      u.id === user.id || (u.email && u.email.toLowerCase().trim() === cleanEmail)
    );
    if (idx >= 0) {
      const merged = { ...this.state.users[idx], ...user };
      if (this.hashItem(this.state.users[idx]) === this.hashItem(merged)) return;
      this.state.users[idx] = merged;
    } else {
      this.state.users.unshift(user);
    }
    this.saveToStorage();
  }

  public mergeCloudTenant(tenant: Tenant): void {
    if (!this.state.tenants) this.state.tenants = [];
    const idx = this.state.tenants.findIndex(t => t.id === tenant.id);
    if (idx >= 0) {
      const merged = { ...this.state.tenants[idx], ...tenant };
      if (this.hashItem(this.state.tenants[idx]) === this.hashItem(merged)) return;
      this.state.tenants[idx] = merged;
    } else {
      this.state.tenants.unshift(tenant);
    }
    this.saveToStorage();
  }

  // --- TENANTS & USERS ---
  getAllTenants(): Tenant[] {
    return this.state.tenants || [];
  }

  getTenant(id?: string): Tenant {
    let targetId = id;
    if (!targetId || targetId === 'tenant-demo-01') {
      if (this.isBrowser) {
        try {
          const raw = localStorage.getItem('birdpro_current_user');
          if (raw) {
            const u = JSON.parse(raw);
            if (u?.tenantId) targetId = u.tenantId;
          }
        } catch {}
      }
    }
    targetId = targetId || 'tenant-demo-01';
    return (
      this.state.tenants.find(t => t.id === targetId) ||
      this.state.tenants[0] ||
      INITIAL_TENANT
    );
  }

  updateTenant(tenant: Partial<Tenant>, id?: string): Tenant {
    let targetId = id || tenant.id;
    if (!targetId || targetId === 'tenant-demo-01') {
      if (this.isBrowser) {
        try {
          const raw = localStorage.getItem('birdpro_current_user');
          if (raw) {
            const u = JSON.parse(raw);
            if (u?.tenantId) targetId = u.tenantId;
          }
        } catch {}
      }
    }
    targetId = targetId || 'tenant-demo-01';

    let idx = this.state.tenants.findIndex(t => t.id === targetId);
    if (idx < 0 && tenant.id) {
      idx = this.state.tenants.findIndex(t => t.id === tenant.id);
    }
    if (idx < 0 && this.state.tenants.length > 0) {
      idx = 0;
    }

    if (idx >= 0) {
      this.state.tenants[idx] = {
        ...this.state.tenants[idx],
        ...tenant,
        visualConfig: {
          ...(this.state.tenants[idx].visualConfig || {}),
          ...(tenant.visualConfig || {})
        }
      };
      this.logAction(this.state.tenants[idx].id, 'UPDATE_TENANT', 'CONFIGURACOES', `Dados do criatório atualizados`);
      this.saveToStorage();
      if (this.isBrowser) {
        window.dispatchEvent(new Event('birdpro_db_updated'));
      }
      if (this.isBrowser && firebaseSync.isAvailable()) {
        firebaseSync.saveTenant(this.state.tenants[idx]).catch(e => console.error('Cloud save tenant error:', e));
      }
      return this.state.tenants[idx];
    }
    return INITIAL_TENANT;
  }

  saveTenant(tenant: Tenant): Tenant {
    return this.updateTenant(tenant, tenant.id);
  }

  getAllUsers(): User[] {
    return this.state.users || [];
  }

  getUserByEmail(email: string): User | undefined {
    const clean = email.toLowerCase().trim();
    return (this.state.users || []).find(u => u.email.toLowerCase().trim() === clean);
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = (this.state.users || []).findIndex(u => u.id === id);
    if (idx >= 0) {
      this.state.users[idx] = { ...this.state.users[idx], ...updates };
      this.saveToStorage();
      if (this.isBrowser && firebaseSync.isAvailable()) {
        firebaseSync.saveUser(this.state.users[idx]).catch(e => console.error('Cloud save user error:', e));
      }
      return this.state.users[idx];
    }
    return null;
  }

  updateUserCredentials(userIdOrEmail: string, newEmail: string, newPassword?: string): { success: boolean; message: string; user?: User } {
    const cleanCurrent = (userIdOrEmail || '').toLowerCase().trim();
    const cleanNewEmail = (newEmail || '').toLowerCase().trim();

    // 1. Locate user
    let user = (this.state.users || []).find(u => 
      u.id === userIdOrEmail || 
      u.email.toLowerCase().trim() === cleanCurrent
    );

    // If not found in users, check if there's a user associated with the active tenant
    if (!user) {
      const tenant = (this.state.tenants || []).find(t => 
        t.email.toLowerCase().trim() === cleanCurrent || 
        t.id === userIdOrEmail
      );
      if (tenant) {
        user = (this.state.users || []).find(u => u.tenantId === tenant.id);
      }
    }

    // If still not found, create or fallback
    if (!user) {
      user = this.state.users[0] || {
        id: `user-${Date.now()}`,
        name: 'Usuário BIRDPRO',
        email: cleanNewEmail || 'usuario@birdpro.com.br',
        password: newPassword || '123',
        role: 'OWNER',
        tenantId: 'tenant-demo-01',
        active: true,
        createdAt: new Date().toISOString()
      };
      if (!this.state.users.some(u => u.id === user!.id)) {
        this.state.users.push(user);
      }
    }

    // 2. Check if new email is already taken by another user
    if (cleanNewEmail && cleanNewEmail !== user.email.toLowerCase().trim()) {
      const emailConflict = (this.state.users || []).find(u => 
        u.id !== user!.id && u.email.toLowerCase().trim() === cleanNewEmail
      );
      if (emailConflict) {
        return { success: false, message: 'Este e-mail já está em uso por outro usuário no sistema.' };
      }
      user.email = cleanNewEmail;
      
      const linkedTenant = (this.state.tenants || []).find(t => t.id === user!.tenantId);
      if (linkedTenant) {
        linkedTenant.email = cleanNewEmail;
      }
    }

    // 3. Update password if provided
    if (newPassword && newPassword.trim().length > 0) {
      user.password = newPassword.trim();
    }

    this.saveToStorage();
    if (this.isBrowser && firebaseSync.isAvailable()) {
      firebaseSync.saveUser(user).catch(e => console.error('Cloud save user error:', e));
      const linkedTenant = (this.state.tenants || []).find(t => t.id === user!.tenantId);
      if (linkedTenant) {
        firebaseSync.saveTenant(linkedTenant).catch(e => console.error('Cloud save tenant error:', e));
      }
    }

    // 4. Update session
    if (this.isBrowser) {
      try {
        const rawSession = localStorage.getItem('birdpro_current_user');
        if (rawSession) {
          const sessionUser = JSON.parse(rawSession);
          if (sessionUser && (sessionUser.id === user.id || sessionUser.email === cleanCurrent || sessionUser.tenantId === user.tenantId)) {
            const updatedSession = { ...sessionUser, email: user.email, name: user.name || sessionUser.name };
            localStorage.setItem('birdpro_current_user', JSON.stringify(updatedSession));
          }
        }
      } catch (e) {
        console.error('Error updating session user:', e);
      }
    }

    return { 
      success: true, 
      message: 'Credenciais de acesso atualizadas com sucesso!', 
      user 
    };
  }

  findAccountForPasswordReset(identifier: string): { 
    found: boolean; 
    email: string; 
    name: string; 
    hasDocument: boolean;
    hasPhone: boolean;
    phoneHint?: string;
    documentHint?: string;
    accountType: 'USER' | 'TENANT' | 'SELLER' | 'ADMIN';
  } {
    const clean = identifier.toLowerCase().trim();
    const cleanDigits = identifier.replace(/\D/g, '');

    // Helper to format phone hint
    const makePhoneHint = (phoneStr?: string) => {
      if (!phoneStr) return undefined;
      const digits = phoneStr.replace(/\D/g, '');
      if (digits.length < 8) return undefined;
      return `(**) *****-${digits.slice(-4)}`;
    };

    // 1. Search in users
    const user = (this.state.users || []).find(u => 
      u.email.toLowerCase().trim() === clean || 
      (cleanDigits.length >= 8 && u.phone?.replace(/\D/g, '').endsWith(cleanDigits))
    );
    if (user) {
      const tenant = (this.state.tenants || []).find(t => t.id === user.tenantId);
      const doc = tenant?.document || (tenant?.owners?.[0]?.cpf);
      return {
        found: true,
        email: user.email,
        name: user.name,
        hasDocument: !!doc,
        hasPhone: !!user.phone,
        phoneHint: makePhoneHint(user.phone),
        documentHint: doc ? (doc.replace(/\D/g, '').length > 11 ? '**.***.***/****-**' : '***.***.***-**') : undefined,
        accountType: user.role === 'SUPER_ADMIN' ? 'ADMIN' : 'USER'
      };
    }

    // 2. Search in tenants
    const tenant = (this.state.tenants || []).find(t => 
      t.email.toLowerCase().trim() === clean || 
      (cleanDigits.length >= 8 && t.phone?.replace(/\D/g, '').endsWith(cleanDigits))
    );
    if (tenant) {
      const doc = tenant.document || tenant.owners?.[0]?.cpf;
      const ph = tenant.phone || tenant.mobile || tenant.whatsapp;
      return {
        found: true,
        email: tenant.email,
        name: tenant.name,
        hasDocument: !!doc,
        hasPhone: !!ph,
        phoneHint: makePhoneHint(ph),
        documentHint: doc ? (doc.replace(/\D/g, '').length > 11 ? '**.***.***/****-**' : '***.***.***-**') : undefined,
        accountType: 'TENANT'
      };
    }

    // 3. Search in sellers
    const seller = (this.state.sellers || []).find(s => 
      s.email.toLowerCase().trim() === clean || 
      (cleanDigits.length >= 8 && s.phone?.replace(/\D/g, '').endsWith(cleanDigits))
    );
    if (seller) {
      const isPixCpf = seller.pixKeyType === 'CPF' || seller.pixKeyType === 'CNPJ';
      return {
        found: true,
        email: seller.email,
        name: seller.name,
        hasDocument: isPixCpf,
        hasPhone: !!seller.phone,
        phoneHint: makePhoneHint(seller.phone),
        documentHint: isPixCpf ? '***.***.***-**' : undefined,
        accountType: 'SELLER'
      };
    }

    // 4. Default admin check
    if (clean === 'henrique_rocha@live.com' || clean === 'admin@birdpro.com.br' || clean === 'adm@birdpro.com.br' || clean === 'admin') {
      return {
        found: true,
        email: clean === 'admin' ? 'admin@birdpro.com.br' : clean,
        name: 'Administrador BirdPro',
        hasDocument: false,
        hasPhone: true,
        phoneHint: '(55) *****-3265',
        accountType: 'ADMIN'
      };
    }

    return { found: false, email: clean, name: '', hasDocument: false, hasPhone: false, accountType: 'USER' };
  }

  validateAccountIdentity(email: string, answer: { cpfOrCnpj?: string; phone?: string }): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const cleanDoc = (answer.cpfOrCnpj || '').replace(/\D/g, '');
    const cleanPhone = (answer.phone || '').replace(/\D/g, '');

    // Find linked entities
    const user = (this.state.users || []).find(u => u.email.toLowerCase().trim() === cleanEmail);
    const tenant = (this.state.tenants || []).find(t => 
      t.email.toLowerCase().trim() === cleanEmail || 
      (user && t.id === user.tenantId)
    );
    const seller = (this.state.sellers || []).find(s => s.email.toLowerCase().trim() === cleanEmail);

    // List of valid documents for this account
    const validDocs: string[] = [];
    if (tenant?.document) validDocs.push(tenant.document.replace(/\D/g, ''));
    if (tenant?.owners) {
      tenant.owners.forEach(o => {
        if (o.cpf) validDocs.push(o.cpf.replace(/\D/g, ''));
      });
    }
    if (seller?.pixKey && (seller.pixKeyType === 'CPF' || seller.pixKeyType === 'CNPJ')) {
      validDocs.push(seller.pixKey.replace(/\D/g, ''));
    }

    // List of valid phones for this account
    const validPhones: string[] = [];
    if (user?.phone) validPhones.push(user.phone.replace(/\D/g, ''));
    if (tenant?.phone) validPhones.push(tenant.phone.replace(/\D/g, ''));
    if (tenant?.mobile) validPhones.push(tenant.mobile.replace(/\D/g, ''));
    if (tenant?.whatsapp) validPhones.push(tenant.whatsapp.replace(/\D/g, ''));
    if (seller?.phone) validPhones.push(seller.phone.replace(/\D/g, ''));

    // Master admin credentials check
    if (cleanEmail === 'henrique_rocha@live.com' || cleanEmail === 'admin@birdpro.com.br' || cleanEmail === 'adm@birdpro.com.br' || cleanEmail === 'admin') {
      validPhones.push('55991343265', '5555991343265', '991343265', '91343265');
    }

    // Check Document Match
    if (cleanDoc && cleanDoc.length >= 6) {
      const match = validDocs.some(d => d === cleanDoc || (d.length >= 11 && cleanDoc.length >= 11 && d.slice(-9) === cleanDoc.slice(-9)));
      if (match) return true;
    }

    // Check Phone Match (must match at least the last 8 digits of telephone with or without DDD)
    if (cleanPhone && cleanPhone.length >= 8) {
      const match = validPhones.some(p => p.endsWith(cleanPhone) || cleanPhone.endsWith(p));
      if (match) return true;
    }

    return false;
  }

  resetPasswordByEmail(email: string, newPassword: string): boolean {
    const clean = email.toLowerCase().trim();
    let updated = false;

    // 1. Update in users
    const user = (this.state.users || []).find(u => u.email.toLowerCase().trim() === clean);
    if (user) {
      user.password = newPassword.trim();
      updated = true;
    }

    // 2. Update in tenants & create owner user if missing
    const tenant = (this.state.tenants || []).find(t => t.email.toLowerCase().trim() === clean);
    if (tenant) {
      if (!user) {
        const ownerUser = (this.state.users || []).find(u => u.tenantId === tenant.id);
        if (ownerUser) {
          ownerUser.password = newPassword.trim();
          updated = true;
        } else {
          const newUser: User = {
            id: `user-${Date.now()}`,
            name: tenant.name,
            email: clean,
            password: newPassword.trim(),
            role: 'OWNER',
            tenantId: tenant.id,
            active: true,
            createdAt: new Date().toISOString()
          };
          this.state.users.push(newUser);
          updated = true;
        }
      }
    }

    // 3. Update in sellers
    const seller = (this.state.sellers || []).find(s => s.email.toLowerCase().trim() === clean);
    if (seller) {
      seller.password = newPassword.trim();
      updated = true;
    }

    // 4. If master admin
    if (clean === 'henrique_rocha@live.com' || clean === 'admin@birdpro.com.br' || clean === 'adm@birdpro.com.br') {
      if (!user) {
        const adminUser: User = {
          id: 'user-admin-official',
          name: 'Super Admin BIRDPRO',
          email: clean,
          password: newPassword.trim(),
          role: 'SUPER_ADMIN',
          tenantId: 'tenant-demo-01',
          phone: '',
          active: true,
          createdAt: new Date().toISOString()
        };
        this.state.users.push(adminUser);
      }
      updated = true;
    }

    if (updated) {
      this.logAction(tenant?.id || 'tenant-demo-01', 'RESET_PASSWORD', 'AUTH', `Senha redefinida com sucesso para ${clean}`);
      this.saveToStorage();
    }

    return updated;
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
    if (this.isBrowser && firebaseSync.isAvailable()) {
      firebaseSync.saveUser(newUser).catch(e => console.error('Cloud save user error:', e));
    }
    return newUser;
  }

  // --- BIRDS ---
  getBirds(tenantId = 'tenant-demo-01'): Bird[] {
    return this.state.birds.filter(b => b.tenantId === tenantId);
  }

  getBirdById(id: string): Bird | undefined {
    return this.state.birds.find(b => b.id === id);
  }

  getBirdByRingNumber(ringNumber: string, tenantId?: string): Bird | undefined {
    if (!ringNumber || !ringNumber.trim()) return undefined;
    const clean = ringNumber.trim().toLowerCase();
    const cleanAlpha = clean.replace(/[^a-z0-9]/g, '');
    const birds = tenantId ? this.getBirds(tenantId) : this.state.birds;

    // 1. Exact match (case insensitive)
    const exact = birds.find(b => b.ringNumber && b.ringNumber.trim().toLowerCase() === clean);
    if (exact) return exact;

    // 2. Normalized match (without hyphens, dots or spaces)
    if (cleanAlpha) {
      const normalizedExact = birds.find(b => {
        if (!b.ringNumber) return false;
        const norm = b.ringNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
        return norm === cleanAlpha;
      });
      if (normalizedExact) return normalizedExact;

      // 3. Normalized partial match (ring contains query or query contains ring)
      const partial = birds.find(b => {
        if (!b.ringNumber) return false;
        const norm = b.ringNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
        return norm.includes(cleanAlpha) || cleanAlpha.includes(norm);
      });
      if (partial) return partial;
    }

    return undefined;
  }

  searchBirdsByRing(ringQuery: string, tenantId?: string): Bird[] {
    if (!ringQuery || !ringQuery.trim()) return [];
    const clean = ringQuery.trim().toLowerCase();
    const cleanAlpha = clean.replace(/[^a-z0-9]/g, '');
    const birds = tenantId ? this.getBirds(tenantId) : this.state.birds;

    return birds.filter(b => {
      if (!b.ringNumber) return false;
      const bRing = b.ringNumber.toLowerCase().trim();
      const bAlpha = bRing.replace(/[^a-z0-9]/g, '');
      const bName = (b.name || '').toLowerCase();
      
      return (
        bRing.includes(clean) ||
        (cleanAlpha && bAlpha.includes(cleanAlpha)) ||
        bName.includes(clean)
      );
    });
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
      if (status === 'RESOLVED' || status === 'CLOSED') {
        tkt.unreadByAdmin = false;
      }
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

  updatePayoutStatus(id: string, status: 'PROCESSING' | 'COMPLETED' | 'REJECTED', receiptUrl?: string): void {
    if (!this.state.payouts) return;
    const p = this.state.payouts.find(x => x.id === id);
    if (p) {
      p.status = status;
      if (receiptUrl) p.receiptUrl = receiptUrl;
      if (status === 'COMPLETED') {
        p.completedAt = new Date().toISOString();
        if (!p.receiptUrl) {
          p.receiptUrl = `https://comprovante.pix.birdpro.com.br/tx-${Date.now()}`;
        }
      }

      // Sync with user referral if it came from Indique & Ganhe
      const refProg = this.state.userReferrals?.[p.affiliateId];
      if (refProg) {
        const itemInProg = refProg.payouts.find(x => x.id === id);
        if (itemInProg) {
          itemInProg.status = status;
          if (status === 'COMPLETED') {
            itemInProg.completedAt = p.completedAt;
            itemInProg.receiptUrl = p.receiptUrl;
            refProg.totalWithdrawn += p.amount;
          }
        }
        if (status === 'REJECTED') {
          refProg.balanceAvailable += p.amount;
        }
      }

      // Sync with seller if affiliate was a seller
      const seller = this.getSellerById(p.affiliateId);
      if (seller) {
        if (status === 'REJECTED') {
          seller.balanceAvailable += p.amount;
          seller.totalCommissionsPaid = Math.max(0, seller.totalCommissionsPaid - p.amount);
        } else if (status === 'COMPLETED') {
          seller.totalCommissionsPaid += p.amount;
        }
      }

      this.logAction(p.affiliateId, 'PAYOUT_STATUS_UPDATED', 'FINANCEIRO', `Status do repasse de R$ ${p.amount.toFixed(2)} atualizado para: ${status}`);
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

  isCouponAvailable(rawCode: string, currentTenantId: string): { available: boolean; reason?: string } {
    if (!rawCode || !rawCode.trim()) {
      return { available: false, reason: 'O nome do cupom não pode estar em branco.' };
    }
    const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (clean.length < 3) {
      return { available: false, reason: 'O cupom deve conter no mínimo 3 caracteres (letras e números).' };
    }
    if (clean.length > 25) {
      return { available: false, reason: 'O cupom pode conter no máximo 25 caracteres.' };
    }

    // Palavras reservadas do sistema
    const SYSTEM_RESERVED = ['BIRDPRO10', 'BIRDPRO20', 'PRIMEIROANO', 'CRIADORVIP', 'BIRDPRO50', 'PROMO10', 'ADMIN', 'ROOT', 'SUPERADMIN'];
    if (SYSTEM_RESERVED.includes(clean)) {
      return { available: false, reason: 'Este cupom é uma palavra reservada do sistema. Por favor, escolha outro nome.' };
    }

    // 1. Varredura nos Vendedores / Parceiros cadastrados
    const sellers = this.state.sellers || [];
    for (const seller of sellers) {
      if (seller.linkedTenantId !== currentTenantId) {
        if (seller.couponCode && seller.couponCode.toUpperCase() === clean) {
          return { available: false, reason: 'Este cupom já está em uso por outro parceiro ou vendedor.' };
        }
        if (seller.affiliateCode && seller.affiliateCode.toUpperCase() === clean) {
          return { available: false, reason: 'Este código já está em uso como identificador de afiliado.' };
        }
      }
    }

    // 2. Varredura nos Cupons de Indique & Ganhe de todos os usuários
    const referrals = this.state.userReferrals || {};
    for (const tId in referrals) {
      if (tId !== currentTenantId) {
        const prog = referrals[tId];
        if (prog.couponCode && prog.couponCode.toUpperCase() === clean) {
          return { available: false, reason: 'Este cupom já está sendo utilizado por outro usuário do sistema.' };
        }
        if (prog.referralCode && prog.referralCode.toUpperCase() === clean) {
          return { available: false, reason: 'Este código de indicação já está registrado para outro criador.' };
        }
      }
    }

    return { available: true };
  }

  updateUserCouponCode(tenantId: string, rawCode: string): { success: boolean; message: string; updatedCoupon?: string; updatedUrl?: string } {
    const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const check = this.isCouponAvailable(clean, tenantId);
    if (!check.available) {
      return { success: false, message: check.reason || 'Cupom indisponível.' };
    }

    const prog = this.getUserReferral(tenantId);
    prog.couponCode = clean;
    prog.referralCode = clean.toLowerCase();
    prog.referralUrl = `https://www.birdpro.com.br/cadastro?ref=${clean.toLowerCase()}`;

    // Sincroniza vendedor vinculado se existir
    const linked = this.getSellerByTenantId(tenantId);
    if (linked) {
      linked.couponCode = clean;
      linked.affiliateCode = clean.toLowerCase();
      linked.affiliateUrl = prog.referralUrl;
    }

    this.logAction(tenantId, 'UPDATE_COUPON', 'INDIQUE_E_GANHE', `Cupom de indicação alterado com sucesso para: ${clean}`);
    this.saveToStorage();
    return {
      success: true,
      message: `Cupom alterado para "${clean}" com sucesso!`,
      updatedCoupon: clean,
      updatedUrl: prog.referralUrl
    };
  }

  requestUserReferralPayout(tenantId: string, amount: number, pixKey: string): AffiliatePayout | null {
    const prog = this.getUserReferral(tenantId);
    if (!prog || amount <= 0 || amount > prog.balanceAvailable) return null;

    const tenant = this.getTenant(tenantId);
    const tenantName = tenant?.name || 'Criatório Parceiro';
    const now = new Date();
    const dueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const payout: AffiliatePayout = {
      id: `pay-ref-${Date.now()}`,
      affiliateId: tenantId,
      affiliateName: tenantName,
      amount,
      pixKey,
      pixKeyType: prog.pixKeyType || 'EMAIL',
      receiptUrl: '',
      status: 'REQUESTED',
      createdAt: now.toISOString(),
      dueAt,
      type: 'REFERRAL_USER'
    };

    prog.balanceAvailable = Math.max(0, prog.balanceAvailable - amount);
    prog.payouts.unshift(payout);

    // Registra nos pagamentos globais para gestão do painel Super Admin
    if (!this.state.payouts) this.state.payouts = [];
    this.state.payouts.unshift(payout);

    // Alerta de alta prioridade para o Administrador do sistema
    this.addNotification({
      tenantId: 'tenant-demo-01',
      title: '🚨 NOVO SAQUE PIX SOLICITADO (PRAZO: 24H)',
      message: `O criatório "${tenantName}" solicitou saque de R$ ${amount.toFixed(2)} via PIX (${pixKey}). Prazo para pagamento: 24 horas.`,
      type: 'FINANCIAL',
      priority: 'HIGH',
      link: '/dashboard/admin/financeiro',
      read: false
    });

    this.logAction(tenantId, 'PAYOUT_REQUESTED', 'INDIQUE_E_GANHE', `Solicitação de saque PIX de R$ ${amount.toFixed(2)} registrada. Prazo de 24 horas para efetivação.`);
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

  validateCoupon(rawCode: string): CouponValidationResult {
    if (!rawCode || !rawCode.trim()) {
      return { valid: false, code: '', discountPercent: 0, message: 'Digite um cupom de desconto válido.' };
    }

    const code = rawCode.trim().toUpperCase();

    // 1. Check seller / affiliate coupons
    const seller = (this.state.sellers || []).find(
      s => s.status === 'ACTIVE' && (
        (s.couponCode && s.couponCode.toUpperCase() === code) ||
        (s.affiliateCode && s.affiliateCode.toUpperCase() === code)
      )
    );

    if (seller) {
      const discount = 10; // 10% standard partner discount for buyers
      return {
        valid: true,
        code,
        discountPercent: discount,
        sellerId: seller.id,
        sellerName: seller.name,
        message: `Cupom Oficial de Parceiro (${seller.name}) aplicado: ${discount}% de desconto!`
      };
    }

    // 2. Check user referral coupons
    const referrals = this.state.userReferrals || {};
    for (const tenantId in referrals) {
      const prog = referrals[tenantId];
      if (prog.couponCode && prog.couponCode.toUpperCase() === code) {
        const tenant = this.getTenant(tenantId);
        return {
          valid: true,
          code,
          discountPercent: prog.friendDiscountPercent || 10,
          sellerId: tenantId,
          sellerName: tenant?.name || 'Criatório Amigo',
          message: `Cupom de Indicação Amigo (${tenant?.name || 'Criatório'}) aplicado: ${prog.friendDiscountPercent || 10}% de desconto!`
        };
      }
    }

    // 3. Check system platform promo codes
    const PROMO_CODES: Record<string, { percent: number; label: string }> = {
      'BIRDPRO10': { percent: 10, label: 'Cupom BIRDPRO: 10% de desconto' },
      'BIRDPRO20': { percent: 20, label: 'Cupom Especial: 20% de desconto' },
      'PRIMEIROANO': { percent: 15, label: 'Cupom Primeiro Ano: 15% de desconto' },
      'CRIADORVIP': { percent: 25, label: 'Cupom Criador VIP: 25% de desconto' },
      'BIRDPRO50': { percent: 50, label: 'Cupom Promocional: 50% de desconto' }
    };

    if (PROMO_CODES[code]) {
      return {
        valid: true,
        code,
        discountPercent: PROMO_CODES[code].percent,
        message: `${PROMO_CODES[code].label} aplicado com sucesso!`
      };
    }

    return {
      valid: false,
      code,
      discountPercent: 0,
      message: 'Cupom inválido ou expirado. Verifique o código e tente novamente.'
    };
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
    customDiscountType?: 'NONE' | 'PERCENT' | 'FIXED' | 'CUSTOM_PRICE';
    customDiscountValue?: number;
    customDiscountReason?: string;
    originalPrice?: number;
    finalPrice?: number;
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

    const standardPrice = data.billingCycle === 'MENSAL' ? 14.99 : data.billingCycle === 'ANUAL' ? 169.99 : 0;
    const originalPrice = data.originalPrice !== undefined ? data.originalPrice : standardPrice;
    let finalPrice = originalPrice;

    if (data.customDiscountType && data.customDiscountType !== 'NONE' && data.customDiscountValue !== undefined) {
      if (data.customDiscountType === 'PERCENT') {
        finalPrice = Math.max(0, originalPrice * (1 - data.customDiscountValue / 100));
      } else if (data.customDiscountType === 'FIXED') {
        finalPrice = Math.max(0, originalPrice - data.customDiscountValue);
      } else if (data.customDiscountType === 'CUSTOM_PRICE') {
        finalPrice = Math.max(0, data.customDiscountValue);
      }
    } else if (data.finalPrice !== undefined) {
      finalPrice = data.finalPrice;
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
      customDiscountType: data.customDiscountType || 'NONE',
      customDiscountValue: data.customDiscountValue,
      customDiscountReason: data.customDiscountReason,
      originalPrice,
      finalPrice,
      priceAmount: finalPrice,
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
      password: data.password || '123456',
      role: 'OWNER',
      tenantId: tenantId,
      active: true,
      createdAt: new Date().toISOString()
    };

    if (!this.state.tenants) this.state.tenants = [];
    if (!this.state.users) this.state.users = [];

    this.state.tenants.unshift(newTenant);
    this.state.users.unshift(newUser);
    this.logAction('tenant-demo-01', 'CREATE_TENANT_MANUAL', 'ADMIN_TENANTS', `Criatório ${newTenant.name} (${newTenant.billingCycle} - ${newTenant.plan}) cadastrado manualmente com valor final R$ ${finalPrice.toFixed(2)}`);
    this.saveToStorage();
    if (this.isBrowser && firebaseSync.isAvailable()) {
      firebaseSync.saveTenant(newTenant).catch(e => console.error('Cloud save tenant error:', e));
      firebaseSync.saveUser(newUser).catch(e => console.error('Cloud save user error:', e));
    }
    return { tenant: newTenant, user: newUser };
  }

  getTenantOwnerUser(tenantId: string): User | undefined {
    return (this.state.users || []).find(u => u.tenantId === tenantId && (u.role === 'OWNER' || u.role === 'ADMIN')) || 
           (this.state.users || []).find(u => u.tenantId === tenantId);
  }

  updateTenantAndCredentials(
    tenantId: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      plan: PlanType;
      billingCycle: 'MENSAL' | 'ANUAL' | 'ISENTO';
      planStatus: any;
      expiresAt: string;
      maxBirds: number;
      customDiscountType?: 'NONE' | 'PERCENT' | 'FIXED' | 'CUSTOM_PRICE';
      customDiscountValue?: number;
      customDiscountReason?: string;
      originalPrice?: number;
      finalPrice?: number;
    }
  ): void {
    const t = this.state.tenants.find(x => x.id === tenantId);
    if (t) {
      if (data.name) t.name = data.name;
      if (data.email) t.email = data.email;
      t.plan = data.plan;
      t.billingCycle = data.billingCycle;
      t.planStatus = data.planStatus;
      t.expiresAt = data.expiresAt;
      t.maxBirds = data.maxBirds;
      if (data.customDiscountType !== undefined) t.customDiscountType = data.customDiscountType;
      if (data.customDiscountValue !== undefined) t.customDiscountValue = data.customDiscountValue;
      if (data.customDiscountReason !== undefined) t.customDiscountReason = data.customDiscountReason;
      if (data.originalPrice !== undefined) t.originalPrice = data.originalPrice;
      if (data.finalPrice !== undefined) {
        t.finalPrice = data.finalPrice;
        t.priceAmount = data.finalPrice;
      }
    }

    // Also update linked owner user credentials
    const user = (this.state.users || []).find(u => u.tenantId === tenantId && (u.role === 'OWNER' || u.role === 'ADMIN')) || 
                 (this.state.users || []).find(u => u.tenantId === tenantId);
    if (user) {
      if (data.email) user.email = data.email;
      if (data.password && data.password.trim()) user.password = data.password.trim();
    } else if (data.email && t) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: t.name,
        email: data.email,
        password: data.password || '123456',
        role: 'OWNER',
        tenantId,
        active: true,
        createdAt: new Date().toISOString()
      };
      this.state.users.push(newUser);
    }

    this.logAction(tenantId, 'UPDATE_CREDENTIALS', 'ADMIN_TENANTS', `Dados e credenciais de acesso do criatório ${t?.name || tenantId} atualizados`);
    this.saveToStorage();
    if (this.isBrowser && firebaseSync.isAvailable()) {
      if (t) firebaseSync.saveTenant(t).catch(e => console.error('Cloud save tenant error:', e));
      const finalUser = user || (this.state.users || []).find(u => u.tenantId === tenantId);
      if (finalUser) firebaseSync.saveUser(finalUser).catch(e => console.error('Cloud save user error:', e));
    }
  }

  updateTenantPlan(
    tenantId: string, 
    plan: PlanType, 
    billingCycle: 'MENSAL' | 'ANUAL' | 'ISENTO', 
    planStatus: any, 
    expiresAt: string, 
    maxBirds: number
  ): void {
    this.updateTenantAndCredentials(tenantId, {
      plan,
      billingCycle,
      planStatus,
      expiresAt,
      maxBirds
    });
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
      if (this.isBrowser && firebaseSync.isAvailable()) {
        firebaseSync.saveTenant(t).catch(e => console.error('Cloud save tenant error:', e));
      }
      return t;
    }
    return undefined;
  }

  deleteTenant(tenantId: string): boolean {
    const initialLen = this.state.tenants.length;
    this.state.tenants = this.state.tenants.filter(t => t.id !== tenantId);
    this.state.users = this.state.users.filter(u => u.tenantId !== tenantId);
    this.state.birds = this.state.birds.filter(b => b.tenantId !== tenantId);
    this.state.cages = this.state.cages.filter(c => c.tenantId !== tenantId);
    this.state.rings = this.state.rings.filter(r => r.tenantId !== tenantId);
    this.state.pairs = this.state.pairs.filter(p => p.tenantId !== tenantId);
    this.state.clutches = this.state.clutches.filter(c => c.tenantId !== tenantId);
    this.state.eggs = this.state.eggs.filter(e => e.tenantId !== tenantId);
    this.state.events = (this.state.events || []).filter(e => e.tenantId !== tenantId);
    this.state.notes = (this.state.notes || []).filter(n => n.tenantId !== tenantId);
    if (this.state.tenants.length < initialLen) {
      this.saveToStorage();
      if (this.isBrowser && firebaseSync.isAvailable()) {
        firebaseSync.deleteTenant(tenantId).catch(e => console.error('Cloud delete tenant error:', e));
      }
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
