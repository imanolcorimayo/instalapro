import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class ServiceTypesSchema extends Schema {
  protected collectionName = 'serviceTypes';

  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 500
    },
    basePrice: {
      type: 'number',
      required: true,
      min: 0
    },
    estimatedDuration: {
      type: 'number',
      required: true,
      min: 15
    },
    category: {
      type: 'string',
      required: true,
      maxLength: 50
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
    }
  };

  // Find active service types for a technician
  async findByTechnicianUserUid(userUid: string) {
    return this.find({
      where: [
        { field: 'userUid', operator: '==', value: userUid },
        { field: 'isActive', operator: '==', value: true }
      ],
      orderBy: [{ field: 'name', direction: 'asc' }]
    });
  }
}
