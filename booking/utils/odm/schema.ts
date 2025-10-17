import { Validator } from './validator';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type QueryConstraint
} from 'firebase/firestore'
import { getFirestoreInstance } from '~/utils/firebase'
import type {
  SchemaDefinition,
  QueryOptions,
  DocumentWithId,
  FetchResult,
  FetchSingleResult,
  CreateResult,
  UpdateResult,
  ValidationResult
} from './types';

// Simplified Schema class for public read-only access (no authentication required)
export abstract class Schema {
  protected abstract collectionName: string;
  protected abstract schema: SchemaDefinition;

  // Firestore instance
  private db = getFirestoreInstance();

  constructor() {}

  // Validate document against schema
  validate(data: any): ValidationResult {
    return Validator.validateDocument(data, this.schema)
  }

  // Apply default values to document
  applyDefaults(data: any): any {
    return Validator.applyDefaults(data, this.schema)
  }

  // Prepare document for saving (add timestamps, apply defaults)
  protected prepareForSave(data: any): any {
    let prepared = { ...data }

    // Apply defaults
    prepared = this.applyDefaults(prepared)

    // Add timestamps
    prepared.createdAt = serverTimestamp()
    prepared.updatedAt = serverTimestamp()

    // Convert Date objects to Firestore-compatible format
    for (const [fieldName, definition] of Object.entries(this.schema)) {
      if (definition.type === 'date' && prepared[fieldName] !== undefined) {
        const dateValue = prepared[fieldName]

        // Skip if already a serverTimestamp or null
        if (dateValue === null || (dateValue && typeof dateValue === 'object' && dateValue.constructor.name === 'ServerTimestampTransform')) {
          continue
        }

        // Convert Date objects or date strings
        if (dateValue instanceof Date) {
          // Keep Date objects as is - Firestore will convert them
          continue
        } else if (typeof dateValue === 'string') {
          // Convert string dates to Date objects
          const parsedDate = new Date(dateValue)
          if (!isNaN(parsedDate.getTime())) {
            prepared[fieldName] = parsedDate
          } else {
            console.warn(`Invalid date string for field ${fieldName}:`, dateValue)
            prepared[fieldName] = null
          }
        }
      }
    }

    return prepared
  }

  // Create a new document (public access - requires userUid parameter)
  async create(data: any): Promise<CreateResult> {
    try {
      // Validate userUid is provided
      if (!data.userUid) {
        return {
          success: false,
          error: 'userUid is required for creating documents'
        }
      }

      // Prepare document for saving (this adds timestamps and defaults)
      const prepared = this.prepareForSave(data)

      // Validate schema AFTER adding timestamps
      const validation = this.validate(prepared)
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        }
      }

      // Add to Firestore
      const docRef = await addDoc(this.getCollectionRef(), prepared)

      // Get the created document to return
      const docSnapshot = await getDoc(docRef)

      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document was not created successfully' }
      }

      // Return with proper formatting
      return {
        success: true,
        data: this.convertFirestoreDoc(docSnapshot)
      }
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error)
      return { success: false, error: `Failed to create document: ${error}` }
    }
  }

  // Convert Firestore document to DocumentWithId
  protected convertFirestoreDoc(docSnapshot: any): DocumentWithId {
    const data = docSnapshot.data();
    const id = docSnapshot.id;

    // Convert Firestore timestamps to JavaScript Dates
    const convertedData: DocumentWithId = {
      id,
      ...data
    };

    // Convert Firestore timestamps to Date objects
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      convertedData.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      convertedData.updatedAt = data.updatedAt.toDate();
    }

    return convertedData;
  }

  // Get Firestore collection reference
  protected getCollectionRef() {
    return collection(this.db, this.collectionName);
  }

  // Build query with constraints
  protected buildQuery(constraints: QueryConstraint[] = []): any {
    return query(this.getCollectionRef(), ...constraints);
  }

  // Find by ID (public read)
  async findById(id: string): Promise<FetchSingleResult> {
    try {
      // Get document reference
      const docRef = doc(this.getCollectionRef(), id);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document not found' };
      }

      return {
        success: true,
        data: this.convertFirestoreDoc(docSnapshot)
      };
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by ID:`, error);
      return { success: false, error: `Failed to find document: ${error}` };
    }
  }

  // Update an existing document (no authentication - requires userUid verification)
  async update(id: string, data: any, userUid: string): Promise<UpdateResult> {
    try {
      // Get document reference
      const docRef = doc(this.getCollectionRef(), id)
      const docSnapshot = await getDoc(docRef)

      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document not found' }
      }

      const existingDoc = docSnapshot.data()

      // Verify document belongs to the specified user
      if (existingDoc.userUid !== userUid) {
        return { success: false, error: 'Document does not belong to specified user' }
      }

      // Prepare update data
      const prepared = {
        ...data,
        updatedAt: serverTimestamp()
      }

      // Update document in Firestore
      const { updateDoc } = await import('firebase/firestore')
      await updateDoc(docRef, prepared)

      return { success: true }
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error)
      return { success: false, error: `Failed to update document: ${error}` }
    }
  }

  // Find multiple documents with query options (public read)
  async find(options: QueryOptions = {}): Promise<FetchResult> {
    try {
      // Build Firestore query constraints
      const constraints: QueryConstraint[] = [];

      // Apply where clauses
      if (options.where) {
        for (const condition of options.where) {
          constraints.push(where(condition.field, condition.operator, condition.value));
        }
      }

      // Apply ordering
      if (options.orderBy) {
        for (const order of options.orderBy) {
          constraints.push(orderBy(order.field, order.direction));
        }
      }

      // Apply limit
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      // Build query
      const q = this.buildQuery(constraints);

      // Execute query
      const querySnapshot = await getDocs(q);

      // Convert documents
      const documents = querySnapshot.docs.map(doc => this.convertFirestoreDoc(doc));

      return { success: true, data: documents };
    } catch (error) {
      console.error(`Error finding ${this.collectionName}:`, error);
      return { success: false, error: `Failed to find documents: ${error}` };
    }
  }
}
