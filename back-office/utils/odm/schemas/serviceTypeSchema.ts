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
      maxLength: 100,
      minLength: 1
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
      min: 15, // Minimum 15 minutes
      max: 480 // Maximum 8 hours
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
    },
    createdBy: {
      type: 'string',
      required: false
    }
  };

  // Service type specific methods
  async findByCategory(userUid: string, category: string) {
    return this.find({
      where: [
        { field: 'userUid', operator: '==', value: userUid },
        { field: 'category', operator: '==', value: category },
        { field: 'isActive', operator: '==', value: true }
      ]
    });
  }

  async findActiveServices(userUid: string) {
    return this.find({
      where: [
        { field: 'userUid', operator: '==', value: userUid },
        { field: 'isActive', operator: '==', value: true }
      ]
    });
  }

  async findByName(userUid: string, name: string) {
    return this.find({
      where: [
        { field: 'userUid', operator: '==', value: userUid },
        { field: 'name', operator: '==', value: name }
      ],
      limit: 1
    });
  }

  async deactivateService(serviceId: string) {
    return this.update(serviceId, { 
      isActive: false,
      updatedAt: new Date()
    });
  }

  async reactivateService(serviceId: string) {
    return this.update(serviceId, { 
      isActive: true,
      updatedAt: new Date()
    });
  }
}