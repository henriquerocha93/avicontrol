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
  where 
} from './firebase';
import { db } from './db';
import { 
  Bird, Cage, Ring, BreedingPair, Clutch, Egg, DiseaseRecord, Medication, 
  Treatment, SexingRecord, GenotypingRecord, BirdTimelineEvent, 
  NotificationItem, Tenant, User, SupportTicket, CalendarEvent, NoteItem 
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

  // Save document to Firestore
  public async saveDocument(collectionName: string, id: string, data: any): Promise<boolean> {
    if (!this.isAvailable() || !dbFirestore) return false;
    try {
      const docRef = doc(dbFirestore, collectionName, id);
      await setDoc(docRef, JSON.parse(JSON.stringify(data)), { merge: true });
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

  // Sync entire local Database to Firestore (Cloud Push / Migration)
  public async pushAllToFirebase(): Promise<{ success: boolean; message: string; count: number }> {
    if (!this.isAvailable() || !dbFirestore) {
      return { 
        success: false, 
        message: 'Firebase não está configurado. Preencha as credenciais no .env.local ou nas variáveis da Vercel.', 
        count: 0 
      };
    }

    try {
      let count = 0;
      const tenants = db.getAllTenants();
      for (const t of tenants) {
        await this.saveDocument('tenants', t.id, t);
        count++;
      }

      const birds = db.getBirds();
      for (const b of birds) {
        await this.saveDocument('birds', b.id, b);
        count++;
      }

      const cages = db.getCages();
      for (const c of cages) {
        await this.saveDocument('cages', c.id, c);
        count++;
      }

      const rings = db.getRings();
      for (const r of rings) {
        await this.saveDocument('rings', r.id, r);
        count++;
      }

      const pairs = db.getPairs();
      for (const p of pairs) {
        await this.saveDocument('pairs', p.id, p);
        count++;
      }

      const clutches = db.getClutches();
      for (const cl of clutches) {
        await this.saveDocument('clutches', cl.id, cl);
        count++;
      }

      const eggs = db.getEggs();
      for (const eg of eggs) {
        await this.saveDocument('eggs', eg.id, eg);
        count++;
      }

      return { 
        success: true, 
        message: `Sincronização concluída com sucesso! ${count} registros exportados para o Firestore.`, 
        count 
      };
    } catch (err: any) {
      console.error('Push to Firebase error:', err);
      return { 
        success: false, 
        message: `Erro na sincronização com Firebase: ${err?.message || err}`, 
        count: 0 
      };
    }
  }

  // Sync from Firestore to Local DataService
  public async pullAllFromFirebase(tenantId: string = 'tenant-demo-01'): Promise<{ success: boolean; message: string }> {
    if (!this.isAvailable() || !dbFirestore) {
      return { success: false, message: 'Firebase não está configurado.' };
    }

    try {
      const remoteBirds = await this.fetchCollection<Bird>('birds', tenantId);
      const remoteCages = await this.fetchCollection<Cage>('cages', tenantId);
      const remoteRings = await this.fetchCollection<Ring>('rings', tenantId);
      const remotePairs = await this.fetchCollection<BreedingPair>('pairs', tenantId);
      const remoteClutches = await this.fetchCollection<Clutch>('clutches', tenantId);
      const remoteEggs = await this.fetchCollection<Egg>('eggs', tenantId);

      if (remoteBirds.length > 0 || remoteCages.length > 0) {
        // Update local items if present
        remoteBirds.forEach(b => {
          if (!db.getBirdById(b.id)) {
            db.addBird(b);
          }
        });
      }

      return { success: true, message: 'Dados baixados do Firestore com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Erro ao baixar dados: ${err?.message || err}` };
    }
  }
}

export const firebaseSync = FirebaseSyncService.getInstance();
