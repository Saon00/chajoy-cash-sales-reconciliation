import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ClosingRecord } from '../types/reconciliation';
import { getFirebaseInstance, FIRESTORE_COLLECTION_NAME } from './firebase';

const LOCAL_STORAGE_HISTORY_KEY = 'cha_joy_closings_history';

export function getLocalRecords(): ClosingRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading local records', e);
    return [];
  }
}

export function saveLocalRecord(record: ClosingRecord): void {
  const current = getLocalRecords();
  const existingIdx = current.findIndex(r => r.id === record.id);
  let updated: ClosingRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
}

export function deleteLocalRecord(id: string): void {
  const current = getLocalRecords();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
}

export interface SaveResult {
  success: boolean;
  destination: 'firestore' | 'local';
  message: string;
  record: ClosingRecord;
}

/**
 * Save daily closing record to Firebase Firestore and mirror to LocalStorage
 */
export async function saveDailyClosing(record: ClosingRecord): Promise<SaveResult> {
  const { db, isReady } = getFirebaseInstance();

  // Always persist locally first so data is never lost
  saveLocalRecord({ ...record, syncSource: isReady ? 'firestore' : 'local' });

  if (isReady && db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION_NAME, record.id);
      await setDoc(docRef, {
        ...record,
        updatedAt: serverTimestamp(),
      });
      return {
        success: true,
        destination: 'firestore',
        message: 'Successfully saved and synced to Firebase Firestore & local storage.',
        record: { ...record, syncSource: 'firestore' },
      };
    } catch (firestoreError: any) {
      console.warn('Firestore write failed, fallback to local storage:', firestoreError);
      return {
        success: true,
        destination: 'local',
        message: `Saved to local storage. (Firestore connection notice: ${firestoreError?.message || 'Access pending'}).`,
        record: { ...record, syncSource: 'local' },
      };
    }
  }

  return {
    success: true,
    destination: 'local',
    message: 'Saved to local storage. (Ready to sync once Firebase credentials are set).',
    record: { ...record, syncSource: 'local' },
  };
}

/**
 * Fetch all closing records from Firestore (if available) or LocalStorage
 */
export async function fetchAllClosings(): Promise<{ records: ClosingRecord[]; source: 'firestore' | 'local' }> {
  const { db, isReady } = getFirebaseInstance();

  if (isReady && db) {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTION_NAME),
        orderBy('closingDate', 'desc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreRecords: ClosingRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as ClosingRecord;
          firestoreRecords.push({
            ...data,
            id: d.id,
            syncSource: 'firestore',
          });
        });
        return { records: firestoreRecords, source: 'firestore' };
      }
    } catch (e) {
      console.warn('Failed to query Firestore, falling back to local records:', e);
    }
  }

  // Fallback to local storage records
  return { records: getLocalRecords(), source: 'local' };
}

/**
 * Delete a closing record by ID
 */
export async function deleteClosingRecord(id: string): Promise<boolean> {
  deleteLocalRecord(id);
  const { db, isReady } = getFirebaseInstance();
  if (isReady && db) {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTION_NAME, id));
    } catch (e) {
      console.warn('Failed to delete from Firestore:', e);
    }
  }
  return true;
}
