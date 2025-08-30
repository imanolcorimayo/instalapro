import { nowInBuenosAires, toBuenosAires } from '~/utils/timezone'
import { Validator } from './validator';
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
  limit,
  onSnapshot,
  serverTimestamp,
  type QueryConstraint,
  type QuerySnapshot,
  type Unsubscribe
} from 'firebase/firestore'
import { getFirestoreInstance, getCurrentUser } from '~/utils/firebase'
import type { 
  SchemaDefinition, 
  ValidationResult, 
  QueryOptions, 
  DocumentWithId,
  CreateResult,
  UpdateResult,
  DeleteResult,
  FetchResult,
  FetchSingleResult
} from './types';

export abstract class Schema {
  protected abstract collectionName: string;
  protected abstract schema: SchemaDefinition;
  
  // Reference cache to avoid duplicate fetches
  private referenceCache = new Map<string, any>();
  
  // Firestore instances
  private db = getFirestoreInstance();

  constructor() {}

  // Get current user UID from Firebase Auth
  protected getCurrentUserUid(): string | null {
    const user = getCurrentUser();
    return user ? user.uid : null;
  }

  // Format date for display using dayjs
  protected formatDate(timestamp: any): string {
    try {
      // Handle dayjs objects
      if (timestamp && typeof timestamp.format === 'function') {
        return timestamp.format('DD/MM/YYYY');
      }
      // Handle Date objects
      if (timestamp instanceof Date) {
        return toBuenosAires(timestamp).format('DD/MM/YYYY');
      }
      // Handle Firestore Timestamps
      if (timestamp && typeof timestamp.toDate === 'function') {
        return toBuenosAires(timestamp.toDate()).format('DD/MM/YYYY');
      }
      return '';
    } catch {
      return '';
    }
  }

  // Validate document against schema
  validate(data: any): ValidationResult {
    return Validator.validateDocument(data, this.schema);
  }

  // Apply default values to document
  applyDefaults(data: any): any {
    return Validator.applyDefaults(data, this.schema);
  }

  // Validate references exist in Firestore
  async validateReferences(data: any): Promise<ValidationResult> {
    const errors: any[] = [];
    const userUid = this.getCurrentUserUid();
    
    if (!userUid) {
      errors.push({
        field: 'userUid',
        message: 'User must be authenticated to validate references'
      });
      return { valid: false, errors };
    }
    
    // Validate each reference field
    for (const [fieldName, definition] of Object.entries(this.schema)) {
      if (definition.type === 'reference' && definition.referenceTo && data[fieldName]) {
        try {
          const refCollection = collection(this.db, definition.referenceTo);
          const refDoc = doc(refCollection, data[fieldName]);
          const refSnapshot = await getDoc(refDoc);
          
          if (!refSnapshot.exists()) {
            errors.push({
              field: fieldName,
              message: `Referenced document ${data[fieldName]} does not exist in ${definition.referenceTo}`
            });
          } else {
            // Verify reference belongs to same user
            const refData = refSnapshot.data();
            if (refData.userUid !== userUid) {
              errors.push({
                field: fieldName,
                message: `Referenced document ${data[fieldName]} does not belong to current user`
              });
            }
          }
        } catch (error) {
          errors.push({
            field: fieldName,
            message: `Error validating reference ${data[fieldName]}: ${error}`
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Prepare document for saving (add timestamps, userUid, etc.)
  protected prepareForSave(data: any, isUpdate = false): any {
    const userUid = this.getCurrentUserUid();
    
    if (!userUid) {
      throw new Error('User must be authenticated to save documents');
    }

    let prepared = { ...data };

    // Apply defaults
    prepared = this.applyDefaults(prepared);

    // Add userUid if not present (required for all documents)
    if (!prepared.userUid && this.schema.userUid) {
      prepared.userUid = userUid;
    }

    if (!isUpdate) {
      // For new documents
      if (userUid) {
        prepared.createdBy = userUid;
      }
      prepared.createdAt = serverTimestamp();
    }

    // Always update timestamp
    prepared.updatedAt = serverTimestamp();

    // Ensure date fields are properly handled for Firestore
    // Convert any $dayjs or Date objects to Firestore timestamps or serverTimestamp
    for (const [fieldName, definition] of Object.entries(this.schema)) {
      if (definition.type === 'date' && prepared[fieldName] !== undefined) {
        const dateValue = prepared[fieldName];
        
        // Skip if already a serverTimestamp or null
        if (dateValue === null || (dateValue && typeof dateValue === 'object' && dateValue.constructor.name === 'ServerTimestampTransform')) {
          continue;
        }
        
        // Convert $dayjs objects, Date objects, or invalid dates to proper Firestore timestamps
        if (dateValue && typeof dateValue === 'object') {
          if (typeof dateValue.toDate === 'function') {
            // Already a Firestore timestamp, keep as is
            continue;
          } else if (dateValue._isAMomentObject || (dateValue.constructor && dateValue.constructor.name === 'Dayjs')) {
            // Convert dayjs to JavaScript Date, then let Firestore handle it
            prepared[fieldName] = dateValue.toDate ? dateValue.toDate() : new Date(dateValue.valueOf());
          } else if (dateValue instanceof Date) {
            // Keep Date objects as is - Firestore will convert them
            continue;
          }
        } else if (typeof dateValue === 'string') {
          // Convert string dates to Date objects
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            prepared[fieldName] = parsedDate;
          } else {
            // Invalid date string, remove the field or set to null
            console.warn(`Invalid date string for field ${fieldName}:`, dateValue);
            prepared[fieldName] = null;
          }
        }
      }
    }

    return prepared;
  }

  // Convert Firestore document to DocumentWithId
  protected convertFirestoreDoc(docSnapshot: any): DocumentWithId {
    const data = docSnapshot.data();
    const id = docSnapshot.id;
    
    // Convert Firestore timestamps to dayjs objects
    const convertedData = {
      id,
      ...data,
      // Format common timestamp fields for display
      createdAtFormatted: data.createdAt ? this.formatDate(data.createdAt) : undefined,
      updatedAtFormatted: data.updatedAt ? this.formatDate(data.updatedAt) : undefined,
      // Convert Firestore timestamps to dayjs objects
      createdAt: data.createdAt ? toBuenosAires(data.createdAt.toDate()) : undefined,
      updatedAt: data.updatedAt ? toBuenosAires(data.updatedAt.toDate()) : undefined,
    };
    
    return convertedData;
  }

  // Get Firestore collection reference
  protected getCollectionRef() {
    return collection(this.db, this.collectionName);
  }
  
  // Build user-scoped query
  protected buildUserQuery(additionalConstraints: QueryConstraint[] = []): any {
    const userUid = this.getCurrentUserUid();
    if (!userUid) {
      throw new Error('User must be authenticated to query documents');
    }
    
    const baseConstraints = [where('userUid', '==', userUid)];
    return query(this.getCollectionRef(), ...baseConstraints, ...additionalConstraints);
  }

  // Add system fields and create document
  protected addSystemFields(data: any): any {
    const userUid = this.getCurrentUserUid();
    if (!userUid) {
      throw new Error('User must be authenticated to create documents');
    }

    let updatedData = { ...data };
    const schemaFields = this.schema;

    // For new documents
    if (userUid && !updatedData.createdBy && schemaFields.createdBy?.required) {
      updatedData.createdBy = userUid;
    }

    // If userUid is part of schema, ensure it's set
    if (schemaFields.userUid?.required) {
      updatedData.userUid = userUid;
    }

    // These fields will always be required
    updatedData.createdAt = serverTimestamp();
    updatedData.updatedAt = serverTimestamp();

    return updatedData;
  }

  // Create a new document
  async create(data: any, validateRefs = false): Promise<CreateResult> {
    try {

      // Add system fields
      data = this.addSystemFields(data);

      // Validate schema
      const validation = this.validate(data);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}` 
        };
      }

      // Validate references if requested
      if (validateRefs) {
        const refValidation = await this.validateReferences(data);
        if (!refValidation.valid) {
          return { 
            success: false, 
            error: `Reference validation failed: ${refValidation.errors.map(e => e.message).join(', ')}` 
          };
        }
      }

      // Prepare document for saving
      const prepared = this.prepareForSave(data, false);
      
      // Add to Firestore
      const docRef = await addDoc(this.getCollectionRef(), prepared);
      
      // Get the created document to return
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document was not created successfully' };
      }

      // Return with proper formatting
      return { 
        success: true, 
        data: this.convertFirestoreDoc(docSnapshot)
      };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return { success: false, error: `Failed to create document: ${error}` };
    }
  }

  // Update an existing document
  async update(id: string, data: any, validateRefs = false): Promise<UpdateResult> {
    try {
      const userUid = this.getCurrentUserUid();
      if (!userUid) {
        return { success: false, error: 'User must be authenticated to update documents' };
      }
      
      // Get document reference
      const docRef = doc(this.getCollectionRef(), id);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document not found' };
      }
      
      const existingDoc = docSnapshot.data();
      
      // Verify user owns this document
      if (existingDoc.userUid !== userUid) {
        return { success: false, error: 'Document does not belong to current user' };
      }

      // Validate schema (merge with existing data)
      const mergedData = { ...existingDoc, ...data };
      const validation = this.validate(mergedData);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}` 
        };
      }

      // Validate references if requested
      if (validateRefs) {
        const refValidation = await this.validateReferences(mergedData);
        if (!refValidation.valid) {
          return { 
            success: false, 
            error: `Reference validation failed: ${refValidation.errors.map(e => e.message).join(', ')}` 
          };
        }
      }

      // Prepare document for saving
      const prepared = this.prepareForSave(data, true);

      // Update document in Firestore
      await updateDoc(docRef, prepared);

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return { success: false, error: `Failed to update document: ${error}` };
    }
  }

  // Delete a document
  async delete(id: string): Promise<DeleteResult> {
    try {
      const userUid = this.getCurrentUserUid();
      if (!userUid) {
        return { success: false, error: 'User must be authenticated to delete documents' };
      }
      
      // Get document reference
      const docRef = doc(this.getCollectionRef(), id);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document not found' };
      }
      
      const existingDoc = docSnapshot.data();
      
      // Verify user owns this document
      if (existingDoc.userUid !== userUid) {
        return { success: false, error: 'Document does not belong to current user' };
      }

      // Delete document from Firestore
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return { success: false, error: `Failed to delete document: ${error}` };
    }
  }

  // Archive a document (soft delete)
  async archive(id: string): Promise<UpdateResult> {
    return this.update(id, {
      isActive: false,
      archivedAt: serverTimestamp()
    }, false);
  }

  // Restore an archived document
  async restore(id: string): Promise<UpdateResult> {
    return this.update(id, {
      isActive: true,
      archivedAt: null
    }, false);
  }

  // Find by ID
  async findById(id: string): Promise<FetchSingleResult> {
    try {
      const userUid = this.getCurrentUserUid();
      if (!userUid) {
        return { success: false, error: 'User must be authenticated to find documents' };
      }
      
      // Get document reference
      const docRef = doc(this.getCollectionRef(), id);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return { success: false, error: 'Document not found' };
      }
      
      const docData = docSnapshot.data();
      
      // Verify user owns this document
      if (docData.userUid !== userUid) {
        return { success: false, error: 'Document does not belong to current user' };
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

  // Find multiple documents with query options
  async find(options: QueryOptions = {}): Promise<FetchResult> {
    try {
      const userUid = this.getCurrentUserUid();
      if (!userUid) {
        return { success: false, error: 'User must be authenticated to find documents' };
      }
      
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
      
      // Build user-scoped query
      const q = this.buildUserQuery(constraints);
      
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

  // Subscribe to real-time updates
  subscribeToCollection(
    callback: (documents: DocumentWithId[]) => void,
    options: QueryOptions = {}
  ): Unsubscribe | null {
    try {
      const userUid = this.getCurrentUserUid();
      if (!userUid) {
        console.error('User must be authenticated to subscribe to documents');
        return null;
      }
      
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
      
      // Build user-scoped query
      const q = this.buildUserQuery(constraints);
      
      // Set up real-time listener
      return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
        const documents = querySnapshot.docs.map(doc => this.convertFirestoreDoc(doc));
        callback(documents);
      }, (error) => {
        console.error(`Error in ${this.collectionName} subscription:`, error);
      });
    } catch (error) {
      console.error(`Error setting up ${this.collectionName} subscription:`, error);
      return null;
    }
  }
  
  // Clear reference cache
  clearCache(): void {
    this.referenceCache.clear();
  }
}