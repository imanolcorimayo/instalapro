import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class JobSchema extends Schema {
  protected collectionName = 'jobs';
  
  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true // Added automatically by schema base class
    },
    clientId: {
      type: 'string',
      required: false, // Optional reference to client document
      maxLength: 50
    },
    clientName: {
      type: 'string',
      required: true,
      maxLength: 100,
      minLength: 1
    },
    clientPhone: {
      type: 'string',
      required: true,
      maxLength: 20,
      pattern: /^[+]?[0-9\s\-()]+$/
    },
    clientEmail: {
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    serviceType: {
      type: 'string',
      required: true,
      maxLength: 100,
      minLength: 1
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 500,
      default: ''
    },
    address: {
      type: 'string',
      required: true,
      maxLength: 300,
      minLength: 1
    },
    scheduledDate: {
      type: 'date',
      required: true
    },
    estimatedDuration: {
      type: 'number',
      required: true,
      min: 15, // Minimum 15 minutes
      max: 480, // Maximum 8 hours
      default: 120
    },
    status: {
      type: 'string',
      required: true,
      default: 'pending'
    },
    price: {
      type: 'number',
      required: false,
      min: 0,
      default: 0
    },
    paid: {
      type: 'boolean',
      required: false,
      default: false
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 1000,
      default: ''
    },
    source: {
      type: 'string',
      required: false,
      default: 'back_office'
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

  // Job-specific query methods (validation and basic queries only)
  async findByClientId(clientId: string) {
    if (!clientId) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [{ field: 'clientId', operator: '==', value: clientId }],
      orderBy: [{ field: 'scheduledDate', direction: 'desc' }]
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [
        { field: 'scheduledDate', operator: '>=', value: startDate },
        { field: 'scheduledDate', operator: '<=', value: endDate }
      ],
    });
  }

  async findByStatus(status: string) {
    if (!status) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'scheduledDate', direction: 'asc' }]
    });
  }

  async findByPhone(phone: string) {
    if (!phone) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [{ field: 'clientPhone', operator: '==', value: phone }],
      orderBy: [{ field: 'scheduledDate', direction: 'desc' }]
    });
  }

  async findUpcoming(limit: number = 10) {
    const now = new Date();
    
    return this.find({
      where: [
        { field: 'scheduledDate', operator: '>=', value: now },
        { field: 'status', operator: 'in', value: ['pending', 'confirmed', 'in_progress'] }
      ],
      orderBy: [{ field: 'scheduledDate', direction: 'asc' }],
      limit
    });
  }

  async findCompleted(limit: number = 50) {
    return this.find({
      where: [{ field: 'status', operator: '==', value: 'completed' }],
      orderBy: [{ field: 'scheduledDate', direction: 'desc' }],
      limit
    });
  }
}