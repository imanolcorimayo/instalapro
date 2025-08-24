import { nowInBuenosAires, toBuenosAires } from '~/utils/timezone'
import { Validator } from './validator';
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

  constructor() {}

  // Get current technician ID (instead of business ID for this single-technician app)
  protected getCurrentTechnicianId(): string | null {
    if (typeof localStorage !== 'undefined') {
      const technicianProfile = localStorage.getItem('instalapro_technician_profile');
      if (technicianProfile) {
        try {
          const parsed = JSON.parse(technicianProfile);
          return parsed.id;
        } catch {
          return null;
        }
      }
    }
    return null;
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

  // Validate references exist (placeholder for localStorage - in Firestore implementation this would check actual refs)
  async validateReferences(data: any): Promise<ValidationResult> {
    const errors: any[] = [];
    
    // For localStorage implementation, we'll skip reference validation
    // In production Firestore implementation, this would validate actual document references
    for (const [fieldName, definition] of Object.entries(this.schema)) {
      if (definition.type === 'reference' && definition.referenceTo && data[fieldName]) {
        // For MVP/localStorage, we assume references are valid
        // TODO: Implement actual reference validation when moving to Firestore
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Prepare document for saving (add timestamps, technicianId, etc.)
  protected prepareForSave(data: any, isUpdate = false): any {
    const technicianId = this.getCurrentTechnicianId();

    let prepared = { ...data };

    // Apply defaults
    prepared = this.applyDefaults(prepared);

    // Add technician ID if not present and needed
    if (!prepared.technicianId && technicianId && this.schema.technicianId) {
      prepared.technicianId = technicianId;
    }

    if (!isUpdate) {
      // For new documents
      if (technicianId) {
        prepared.createdBy = technicianId;
      }
      prepared.createdAt = nowInBuenosAires();
    }

    // Always update timestamp
    prepared.updatedAt = nowInBuenosAires();

    return prepared;
  }

  // Add document ID to fetched data
  protected addDocumentId(doc: any, id: string): DocumentWithId {
    return {
      id,
      ...doc,
      // Format common timestamp fields for display
      createdAtFormatted: doc.createdAt ? this.formatDate(doc.createdAt) : undefined,
      updatedAtFormatted: doc.updatedAt ? this.formatDate(doc.updatedAt) : undefined,
      // Keep original timestamps as dayjs objects
      createdAt: doc.createdAt ? toBuenosAires(doc.createdAt) : undefined,
      updatedAt: doc.updatedAt ? toBuenosAires(doc.updatedAt) : undefined,
    };
  }

  // Generate unique ID
  protected generateId(prefix: string = 'doc'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get localStorage key for this collection
  protected getStorageKey(): string {
    return `instalapro_${this.collectionName}`;
  }

  // Load all documents from localStorage
  protected loadFromStorage(): any[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Error loading ${this.collectionName} from localStorage:`, error);
      return [];
    }
  }

  // Save all documents to localStorage
  protected saveToStorage(documents: any[]): void {
    try {
      // Serialize dayjs objects to ISO strings for storage
      const serialized = documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt && typeof doc.createdAt.toISOString === 'function' 
          ? doc.createdAt.toISOString() 
          : doc.createdAt,
        updatedAt: doc.updatedAt && typeof doc.updatedAt.toISOString === 'function' 
          ? doc.updatedAt.toISOString() 
          : doc.updatedAt
      }));
      
      localStorage.setItem(this.getStorageKey(), JSON.stringify(serialized));
    } catch (error) {
      console.error(`Error saving ${this.collectionName} to localStorage:`, error);
      throw new Error(`Failed to save ${this.collectionName} data`);
    }
  }

  // Create a new document
  async create(data: any, validateRefs = false): Promise<CreateResult> {
    try {
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
      
      // Generate ID
      const id = this.generateId(this.collectionName);
      const documentWithId = { ...prepared, id };

      // Load existing documents
      const documents = this.loadFromStorage();
      
      // Add new document
      documents.push(documentWithId);
      
      // Save back to storage
      this.saveToStorage(documents);

      // Return with proper formatting
      return { 
        success: true, 
        data: this.addDocumentId(prepared, id)
      };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return { success: false, error: `Failed to create document: ${error}` };
    }
  }

  // Update an existing document
  async update(id: string, data: any, validateRefs = false): Promise<UpdateResult> {
    try {
      // Load existing documents
      const documents = this.loadFromStorage();
      const docIndex = documents.findIndex(doc => doc.id === id);

      if (docIndex === -1) {
        return { success: false, error: 'Document not found' };
      }

      const existingDoc = documents[docIndex];

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

      // Update document
      documents[docIndex] = { ...existingDoc, ...prepared };

      // Save back to storage
      this.saveToStorage(documents);

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return { success: false, error: `Failed to update document: ${error}` };
    }
  }

  // Delete a document
  async delete(id: string): Promise<DeleteResult> {
    try {
      // Load existing documents
      const documents = this.loadFromStorage();
      const docIndex = documents.findIndex(doc => doc.id === id);

      if (docIndex === -1) {
        return { success: false, error: 'Document not found' };
      }

      // Remove document
      documents.splice(docIndex, 1);

      // Save back to storage
      this.saveToStorage(documents);

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
      archivedAt: nowInBuenosAires()
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
      const documents = this.loadFromStorage();
      const doc = documents.find(d => d.id === id);

      if (!doc) {
        return { success: false, error: 'Document not found' };
      }

      return { 
        success: true, 
        data: this.addDocumentId(doc, id)
      };
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by ID:`, error);
      return { success: false, error: `Failed to find document: ${error}` };
    }
  }

  // Find multiple documents with query options
  async find(options: QueryOptions = {}): Promise<FetchResult> {
    try {
      let documents = this.loadFromStorage();

      // Apply where clauses
      if (options.where) {
        for (const condition of options.where) {
          documents = documents.filter(doc => {
            const fieldValue = doc[condition.field];
            
            switch (condition.operator) {
              case '==':
                return fieldValue === condition.value;
              case '!=':
                return fieldValue !== condition.value;
              case '<':
                return fieldValue < condition.value;
              case '<=':
                return fieldValue <= condition.value;
              case '>':
                return fieldValue > condition.value;
              case '>=':
                return fieldValue >= condition.value;
              case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);
              case 'not-in':
                return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
              case 'array-contains':
                return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
              default:
                return true;
            }
          });
        }
      }

      // Apply ordering
      if (options.orderBy) {
        documents = documents.sort((a, b) => {
          for (const order of options.orderBy!) {
            const aValue = a[order.field];
            const bValue = b[order.field];
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            else if (aValue > bValue) comparison = 1;
            
            if (comparison !== 0) {
              return order.direction === 'desc' ? -comparison : comparison;
            }
          }
          return 0;
        });
      }

      // Apply limit
      if (options.limit) {
        documents = documents.slice(0, options.limit);
      }

      // Add IDs and format dates
      const formatted = documents.map(doc => this.addDocumentId(doc, doc.id));

      return { success: true, data: formatted };
    } catch (error) {
      console.error(`Error finding ${this.collectionName}:`, error);
      return { success: false, error: `Failed to find documents: ${error}` };
    }
  }

  // Find all active documents
  async findActive(additionalOptions: QueryOptions = {}): Promise<FetchResult> {
    const options: QueryOptions = {
      ...additionalOptions,
      where: [
        ...(additionalOptions.where || []),
        { field: 'isActive', operator: '==', value: true }
      ]
    };

    return this.find(options);
  }

  // Find all archived documents
  async findArchived(additionalOptions: QueryOptions = {}): Promise<FetchResult> {
    const options: QueryOptions = {
      ...additionalOptions,
      where: [
        ...(additionalOptions.where || []),
        { field: 'isActive', operator: '==', value: false }
      ]
    };

    return this.find(options);
  }

  // Clear reference cache
  clearCache(): void {
    this.referenceCache.clear();
  }
}