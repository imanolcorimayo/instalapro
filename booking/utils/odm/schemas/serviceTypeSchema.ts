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
  // NOTE: We query all active services and filter client-side by userUid
  // This is because Firestore security rules only allow reading by isActive,
  // not compound queries with userUid (which would require authentication)
  async findByTechnicianUserUid(userUid: string) {
    const result = await this.find({
      where: [
        { field: 'isActive', operator: '==', value: true }
      ]
    });

    // Filter client-side by userUid
    if (result.success && result.data) {
      result.data = result.data.filter(service => service.userUid === userUid);
    }

    return result;
  }
}
