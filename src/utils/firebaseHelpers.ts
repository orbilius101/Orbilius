import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Firestore helper functions to simplify database operations
 * and make migration from Supabase easier
 */

// Type for Firestore query results
export interface FirestoreQueryResult<T = DocumentData> {
  data: T[] | T | null;
  error: Error | null;
}

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<FirestoreQueryResult<T>> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        data: { id: docSnap.id, ...docSnap.data() } as T,
        error: null,
      };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get multiple documents with optional query constraints
 */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<FirestoreQueryResult<T>> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    return { data, error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Create a new document with auto-generated ID
 */
export async function createDocument<T = DocumentData>(
  collectionName: string,
  data: Partial<T>,
  customId?: string
): Promise<FirestoreQueryResult<T>> {
  try {
    const docRef = customId
      ? doc(db, collectionName, customId)
      : doc(collection(db, collectionName));

    const dataWithTimestamp = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    await setDoc(docRef, dataWithTimestamp);

    return {
      data: { id: docRef.id, ...dataWithTimestamp } as T,
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<FirestoreQueryResult<T>> {
  try {
    const docRef = doc(db, collectionName, docId);

    const dataWithTimestamp = {
      ...data,
      updated_at: serverTimestamp(),
    };

    await updateDoc(docRef, dataWithTimestamp);

    return {
      data: { id: docId, ...dataWithTimestamp } as T,
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<FirestoreQueryResult<null>> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Convert Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

/**
 * Build query constraints from object (similar to Supabase .eq(), .gt(), etc.)
 */
export function buildConstraints(filters: {
  eq?: Record<string, unknown>;
  orderBy?: { field: string; direction?: 'asc' | 'desc' };
  limit?: number;
}): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Add equality filters
  if (filters.eq) {
    Object.entries(filters.eq).forEach(([field, value]) => {
      constraints.push(where(field, '==', value));
    });
  }

  // Add ordering
  if (filters.orderBy) {
    constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction || 'asc'));
  }

  // Add limit
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }

  return constraints;
}

export { where, orderBy, limit, serverTimestamp, Timestamp };
