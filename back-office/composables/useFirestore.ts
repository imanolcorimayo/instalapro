import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { getFirestoreInstance } from '~/utils/firebase'

export interface FirestoreDocument {
  id: string
  createdAt?: Date
  updatedAt?: Date
  [key: string]: any
}

export interface UseFirestoreReturn<T extends FirestoreDocument> {
  data: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  add: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  get: (id: string) => Promise<T | null>
  update: (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  list: (constraints?: QueryConstraint[]) => Promise<T[]>
  subscribe: (constraints?: QueryConstraint[]) => Unsubscribe
  unsubscribe: () => void
}

export function useFirestore<T extends FirestoreDocument>(
  collectionName: string
): UseFirestoreReturn<T> {
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let unsubscribeFn: Unsubscribe | null = null

  const db = getFirestoreInstance()
  const collectionRef = collection(db, collectionName)

  // Convert Firestore timestamp to Date
  const convertTimestamps = (doc: DocumentData): T => {
    const data = { ...doc }
    
    // Convert Firestore Timestamps to Date objects
    if (data.createdAt && data.createdAt instanceof Timestamp) {
      data.createdAt = data.createdAt.toDate()
    }
    if (data.updatedAt && data.updatedAt instanceof Timestamp) {
      data.updatedAt = data.updatedAt.toDate()
    }
    
    return data as T
  }

  // Add a new document
  const add = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      loading.value = true
      error.value = null

      const docData = {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collectionRef, docData)
      
      loading.value = false
      return docRef.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error adding document'
      loading.value = false
      throw err
    }
  }

  // Get a single document
  const get = async (id: string): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      loading.value = false

      if (docSnap.exists()) {
        return convertTimestamps({ id: docSnap.id, ...docSnap.data() })
      }
      
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error getting document'
      loading.value = false
      throw err
    }
  }

  // Update a document
  const update = async (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(db, collectionName, id)
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      await updateDoc(docRef, updateData)
      loading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating document'
      loading.value = false
      throw err
    }
  }

  // Delete a document
  const remove = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
      
      loading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting document'
      loading.value = false
      throw err
    }
  }

  // List documents with optional query constraints
  const list = async (constraints: QueryConstraint[] = []): Promise<T[]> => {
    try {
      loading.value = true
      error.value = null

      const q = query(collectionRef, ...constraints)
      const querySnapshot = await getDocs(q)
      
      const documents = querySnapshot.docs.map(doc => 
        convertTimestamps({ id: doc.id, ...doc.data() })
      )

      data.value = documents
      loading.value = false
      return documents
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error listing documents'
      loading.value = false
      throw err
    }
  }

  // Subscribe to real-time updates
  const subscribe = (constraints: QueryConstraint[] = []): Unsubscribe => {
    try {
      error.value = null
      
      const q = query(collectionRef, ...constraints)
      
      unsubscribeFn = onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => 
          convertTimestamps({ id: doc.id, ...doc.data() })
        )
        data.value = documents
      }, (err) => {
        error.value = err.message
        console.error('Firestore subscription error:', err)
      })

      return unsubscribeFn
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error setting up subscription'
      throw err
    }
  }

  // Unsubscribe from real-time updates
  const unsubscribe = () => {
    if (unsubscribeFn) {
      unsubscribeFn()
      unsubscribeFn = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    data,
    loading,
    error,
    add,
    get,
    update,
    remove,
    list,
    subscribe,
    unsubscribe
  }
}

// Utility function for common query constraints
export const firestoreConstraints = {
  orderByCreated: () => orderBy('createdAt', 'desc'),
  orderByUpdated: () => orderBy('updatedAt', 'desc'),
  whereEquals: (field: string, value: any) => where(field, '==', value),
  whereIn: (field: string, values: any[]) => where(field, 'in', values),
  whereGreater: (field: string, value: any) => where(field, '>', value),
  whereLess: (field: string, value: any) => where(field, '<', value)
}