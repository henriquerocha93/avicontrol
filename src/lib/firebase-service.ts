import { 
  dbFirestore, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from './firebase';
import { 
  Bird, Cage, Ring, BreedingPair, Clutch, Egg, DiseaseRecord, Medication, 
  Treatment, SexingRecord, GenotypingRecord, BirdTimelineEvent, 
  NotificationItem, Tenant, User, SupportTicket, CalendarEvent, NoteItem,
  SellerAffiliate, AffiliateCommission, AffiliatePayout, BreedingObservation
} from '@/types';

export class FirebaseSyncService {
  private static instance: FirebaseSyncService;

  public static getInstance(): FirebaseSyncService {
    if (!FirebaseSyncService.instance) {
      FirebaseSyncService.instance = new FirebaseSyncService();
    }
    return FirebaseSyncService.instance;
  }

  public isAvailable(): boolean {
    return isFirebaseConfigured() && !!dbFirestore;
  }

  // --- TENANTS CLOUD CRUD ---
  public async saveTenant(tenant: Tenant): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const clean = JSON.parse(JSON.stringify(tenant));
      const docRef = doc(dbFirestore, 'tenants', tenant.id);
      await setDoc(docRef, clean, { merge: true });
      return true;
    } catch (err) {
      console.error(`Error saving tenant ${tenant.id} to Firebase:`, err);
      return false;
    }
  }

  public async fetchTenantById(tenantId: string): Promise<Tenant | null> {
    if (!this.isAvailable() || !dbFirestore) return null;
    try {
      const docRef = doc(dbFirestore, 'tenants', tenantId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Tenant;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching tenant ${tenantId} from Firebase:`, err);
      return null;
    }
  }

  public async fetchTenantByEmail(email: string): Promise<Tenant | null> {
    if (!this.isAvailable() || !dbFirestore || !email) return null;
    const clean = email.toLowerCase().trim();
    try {
      const colRef = collection(dbFirestore, 'tenants');
      const q = query(colRef, where('email', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Tenant;
      }
      // Fallback: check all if casing differed
      const allSnap = await getDocs(colRef);
      for (const d of allSnap.docs) {
        const data = d.data();
        if (data.email && String(data.email).toLowerCase().trim() === clean) {
          return { id: d.id, ...data } as Tenant;
        }
      }
      return null;
    } catch (err) {
      console.error(`Error fetching tenant by email ${email} from Firebase:`, err);
      return null;
    }
  }

  public async fetchAllTenants(): Promise<Tenant[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, 'tenants');
      const snap = await getDocs(colRef);
      const list: Tenant[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Tenant);
      });
      return list;
    } catch (err) {
      console.error('Error fetching all tenants from Firebase:', err);
      return [];
    }
  }

  public async deleteTenant(tenantId: string): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, 'tenants', tenantId);
      await deleteDoc(docRef);
      
      // Also delete any users associated with this tenant
      const usersRef = collection(dbFirestore, 'users');
      const q = query(usersRef, where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(dbFirestore, 'users', d.id));
      }
      return true;
    } catch (err) {
      console.error(`Error deleting tenant ${tenantId} from Firebase:`, err);
      return false;
    }
  }

  // --- USERS CLOUD CRUD ---
  public async saveUser(user: User): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const clean = JSON.parse(JSON.stringify(user));
      // Ensure email is trimmed
      if (clean.email) {
        clean.email = String(clean.email).trim();
      }
      const docRef = doc(dbFirestore, 'users', user.id);
      await setDoc(docRef, clean, { merge: true });
      return true;
    } catch (err) {
      console.error(`Error saving user ${user.id} to Firebase:`, err);
      return false;
    }
  }

  public async fetchUserByEmail(email: string): Promise<User | null> {
    if (!this.isAvailable() || !dbFirestore || !email) return null;
    const clean = email.toLowerCase().trim();
    try {
      const colRef = collection(dbFirestore, 'users');
      // Direct exact query
      const q = query(colRef, where('email', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      
      // Case-insensitive fallback across all users in cloud
      const allSnap = await getDocs(colRef);
      for (const d of allSnap.docs) {
        const data = d.data();
        if (data.email && String(data.email).toLowerCase().trim() === clean) {
          return { id: d.id, ...data } as User;
        }
      }
      return null;
    } catch (err) {
      console.error(`Error fetching user by email ${email} from Firebase:`, err);
      return null;
    }
  }

  public async fetchAllUsers(): Promise<User[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, 'users');
      const snap = await getDocs(colRef);
      const list: User[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as User);
      });
      return list;
    } catch (err) {
      console.error('Error fetching all users from Firebase:', err);
      return [];
    }
  }

  public async deleteUser(userId: string): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, 'users', userId);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error(`Error deleting user ${userId} from Firebase:`, err);
      return false;
    }
  }

  // --- REAL-TIME LISTENERS ---
  public subscribeToTenants(callback: (tenants: Tenant[]) => void): () => void {
    if (!this.isAvailable() || !dbFirestore) return () => {};
    try {
      const colRef = collection(dbFirestore, 'tenants');
      const unsubscribe = onSnapshot(colRef, (snapshot: any) => {
        const list: Tenant[] = [];
        snapshot.forEach((d: any) => {
          list.push({ id: d.id, ...d.data() } as Tenant);
        });
        callback(list);
      }, (err: any) => {
        console.warn('Real-time tenants subscription note:', err);
      });
      return unsubscribe;
    } catch (err) {
      console.error('Failed to subscribe to tenants:', err);
      return () => {};
    }
  }

  public subscribeToUsers(callback: (users: User[]) => void): () => void {
    if (!this.isAvailable() || !dbFirestore) return () => {};
    try {
      const colRef = collection(dbFirestore, 'users');
      const unsubscribe = onSnapshot(colRef, (snapshot: any) => {
        const list: User[] = [];
        snapshot.forEach((d: any) => {
          list.push({ id: d.id, ...d.data() } as User);
        });
        callback(list);
      }, (err: any) => {
        console.warn('Real-time users subscription note:', err);
      });
      return unsubscribe;
    } catch (err) {
      console.error('Failed to subscribe to users:', err);
      return () => {};
    }
  }

  // --- SELLERS / AFFILIATES CLOUD CRUD ---
  public async saveSeller(seller: SellerAffiliate): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const clean = JSON.parse(JSON.stringify(seller));
      const docRef = doc(dbFirestore, 'sellers', seller.id);
      await setDoc(docRef, clean, { merge: true });
      return true;
    } catch (err) {
      console.error(`Error saving seller ${seller.id} to Firebase:`, err);
      return false;
    }
  }

  public async fetchAllSellers(): Promise<SellerAffiliate[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, 'sellers');
      const snap = await getDocs(colRef);
      const list: SellerAffiliate[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as SellerAffiliate);
      });
      return list;
    } catch (err) {
      console.error('Error fetching all sellers from Firebase:', err);
      return [];
    }
  }

  public async deleteSeller(id: string): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, 'sellers', id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error(`Error deleting seller ${id} from Firebase:`, err);
      return false;
    }
  }

  // --- COMMISSIONS CLOUD CRUD ---
  public async saveCommission(commission: AffiliateCommission): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const clean = JSON.parse(JSON.stringify(commission));
      const docRef = doc(dbFirestore, 'commissions', commission.id);
      await setDoc(docRef, clean, { merge: true });
      return true;
    } catch (err) {
      console.error(`Error saving commission ${commission.id} to Firebase:`, err);
      return false;
    }
  }

  public async fetchAllCommissions(): Promise<AffiliateCommission[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, 'commissions');
      const snap = await getDocs(colRef);
      const list: AffiliateCommission[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as AffiliateCommission);
      });
      return list;
    } catch (err) {
      console.error('Error fetching all commissions from Firebase:', err);
      return [];
    }
  }

  // --- PAYOUTS CLOUD CRUD ---
  public async savePayout(payout: AffiliatePayout): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const clean = JSON.parse(JSON.stringify(payout));
      const docRef = doc(dbFirestore, 'payouts', payout.id);
      await setDoc(docRef, clean, { merge: true });
      return true;
    } catch (err) {
      console.error(`Error saving payout ${payout.id} to Firebase:`, err);
      return false;
    }
  }

  public async fetchAllPayouts(): Promise<AffiliatePayout[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, 'payouts');
      const snap = await getDocs(colRef);
      const list: AffiliatePayout[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as AffiliatePayout);
      });
      return list;
    } catch (err) {
      console.error('Error fetching all payouts from Firebase:', err);
      return [];
    }
  }

  // --- BREEDING OBSERVATIONS (GALAS, NASCIMENTOS, EVENTOS) ---
  public async saveBreedingObservation(obs: BreedingObservation): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, 'breedingObservations', obs.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(obs)), { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving breeding observation to Firebase:', err);
      return false;
    }
  }

  public async fetchAllBreedingObservations(tenantId?: string): Promise<BreedingObservation[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, 'breedingObservations');
      const q = tenantId ? query(colRef, where('tenantId', '==', tenantId)) : query(colRef);
      const snap = await getDocs(q);
      const list: BreedingObservation[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as BreedingObservation);
      });
      return list;
    } catch (err) {
      console.error('Error fetching breeding observations from Firebase:', err);
      return [];
    }
  }

  public async deleteBreedingObservation(id: string): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, 'breedingObservations', id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('Error deleting breeding observation from Firebase:', err);
      return false;
    }
  }

  // Generic collection loader from Firestore
  public async fetchCollection<T>(collectionName: string, tenantId?: string): Promise<T[]> {
    if (!this.isAvailable() || !dbFirestore) return [];
    try {
      const colRef = collection(dbFirestore, collectionName);
      let q = query(colRef);
      if (tenantId) {
        q = query(colRef, where('tenantId', '==', tenantId));
      }
      const snapshot = await getDocs(q);
      const list: T[] = [];
      snapshot.forEach((docSnap: any) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      return list;
    } catch (err) {
      console.error(`Error fetching collection ${collectionName} from Firebase:`, err);
      return [];
    }
  }

  public subscribeTenantCollection(
    collectionName: string,
    tenantId: string,
    onChanges: (
      changes: { type: 'added' | 'modified' | 'removed'; id: string; data: any; pending: boolean }[],
      isFirst: boolean
    ) => void,
    onError?: (err: any) => void
  ): () => void {
    if (!this.isAvailable() || !dbFirestore) return () => {};
    let first = true;
    try {
      const q = query(collection(dbFirestore, collectionName), where('tenantId', '==', tenantId));
      return onSnapshot(q, (snap: any) => {
        const changes = snap.docChanges().map((c: any) => ({
          type: c.type,
          id: c.doc.id,
          data: c.doc.data(),
          pending: !!c.doc.metadata.hasPendingWrites
        }));
        const isFirst = first;
        first = false;
        onChanges(changes, isFirst);
      }, (err: any) => {
        console.warn(`Subscription error on ${collectionName}:`, err);
        if (onError) onError(err);
      });
    } catch (err) {
      console.error(`Failed to subscribe to ${collectionName}:`, err);
      return () => {};
    }
  }

  // Save document to Firestore
  public async saveDocument(collectionName: string, id: string, data: any, merge = true): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, collectionName, id);
      await setDoc(docRef, JSON.parse(JSON.stringify(data)), { merge });
      return true;
    } catch (err) {
      console.error(`Error saving document ${id} to ${collectionName} in Firebase:`, err);
      return false;
    }
  }

  // Delete document from Firestore
  public async removeDocument(collectionName: string, id: string): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error(`Error deleting document ${id} from ${collectionName} in Firebase:`, err);
      return false;
    }
  }

  // Fetch single document from Firestore
  public async fetchDocument<T>(collectionName: string, id: string): Promise<T | null> {
    if (!this.isAvailable() || !dbFirestore || !id) return null;
    try {
      const docRef = doc(dbFirestore, collectionName, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as T;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching document ${id} from ${collectionName} in Firebase:`, err);
      return null;
    }
  }

  // Fetch bird by ID or ringNumber across cloud Firestore
  public async fetchBirdAnywhere(birdIdOrRing: string): Promise<Bird | null> {
    if (!this.isAvailable() || !dbFirestore || !birdIdOrRing) return null;
    const cleanQuery = birdIdOrRing.trim();
    try {
      // 1. Try directly by document ID in 'birds'
      const docRef = doc(dbFirestore, 'birds', cleanQuery);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Bird;
      }

      // 2. Try by ringNumber in 'birds'
      const birdsRef = collection(dbFirestore, 'birds');
      const q = query(birdsRef, where('ringNumber', '==', cleanQuery));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const d = qSnap.docs[0];
        return { id: d.id, ...d.data() } as Bird;
      }

      // 3. Fallback: case insensitive ringNumber search
      const allBirdsSnap = await getDocs(birdsRef);
      for (const d of allBirdsSnap.docs) {
        const data = d.data();
        if (
          d.id.toLowerCase() === cleanQuery.toLowerCase() ||
          (data.ringNumber && String(data.ringNumber).trim().toLowerCase() === cleanQuery.toLowerCase())
        ) {
          return { id: d.id, ...data } as Bird;
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching bird from cloud:', err);
      return null;
    }
  }
}

export const firebaseSync = FirebaseSyncService.getInstance();
