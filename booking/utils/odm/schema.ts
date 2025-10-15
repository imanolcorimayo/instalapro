import { Validator } from './validator';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint
} from 'firebase/firestore'
import { getFirestoreInstance } from '~/utils/firebase'
import type {
  SchemaDefinition,
  QueryOptions,
  DocumentWithId,
  FetchResult,
  FetchSingleResult
} from './types';

// Simplified Schema class for public read-only access (no authentication required)
export abstract class Schema {
  protected abstract collectionName: string;
  protected abstract schema: SchemaDefinition;

  // Firestore instance
  private db = getFirestoreInstance();

  constructor() {}

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
