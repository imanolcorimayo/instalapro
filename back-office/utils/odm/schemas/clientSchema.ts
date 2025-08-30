import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class ClientSchema extends Schema {
  protected collectionName = 'clients';
  
  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true // Added automatically by schema base class
    },
    name: {
      type: 'string',
      required: true,
      maxLength: 100,
      minLength: 1
    },
    phone: {
      type: 'string',
      required: true,
      maxLength: 20,
      pattern: /^[+]?[0-9\s\-()]+$/
    },
    address: {
      type: 'string',
      required: true,
      maxLength: 200,
      minLength: 1
    },
    email: {
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    serviceHistory: {
      type: 'array',
      required: false,
      default: [],
      arrayOf: 'object'
    },
    totalJobs: {
      type: 'number',
      required: false,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: 'number',
      required: false,
      default: 0,
      min: 0
    },
    preferredServiceTypes: {
      type: 'array',
      required: false,
      default: [],
      arrayOf: 'string'
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 1000,
      default: ''
    },
    isActive: {
      type: 'boolean',
      required: false,
      default: true
    },
    createdAt: {
      type: 'date',
      required: true
    },
    updatedAt: {
      type: 'date',
      required: true
    },
    createdBy: {
      type: 'string',
      required: false
    },
    archivedAt: {
      type: 'date',
      required: false
    }
  };

  // Client-specific query methods (validation and basic queries only)
  async findByPhone(phone: string) {
    return this.find({
      where: [{ field: 'phone', operator: '==', value: phone }],
      limit: 1
    });
  }

  async findByEmail(email: string) {
    if (!email) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [{ field: 'email', operator: '==', value: email }],
      limit: 1
    });
  }

  async findByName(name: string) {
    // Basic name search - for more complex searches, use store methods
    if (!name.trim()) {
      return { success: true, data: [] };
    }
    
    // Note: Firestore doesn't support case-insensitive queries natively
    // For now, we'll search by exact name match. Complex search logic should be in store.
    return this.find({
      where: [{ field: 'name', operator: '>=', value: name }, { field: 'name', operator: '<=', value: name + '\uf8ff' }]
    });
  }
}