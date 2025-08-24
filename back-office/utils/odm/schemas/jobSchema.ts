import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class JobSchema extends Schema {
  protected collectionName = 'jobs';
  
  protected schema: SchemaDefinition = {
    id: {
      type: 'string',
      required: true
    },
    clientId: {
      type: 'reference',
      required: true,
      referenceTo: 'clients'
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
    serviceType: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: true,
      maxLength: 500,
      minLength: 1
    },
    address: {
      type: 'string',
      required: true,
      maxLength: 200,
      minLength: 1
    },
    scheduledDate: {
      type: 'date',
      required: true
    },
    estimatedDuration: {
      type: 'number',
      required: true,
      min: 30,
      max: 480 // Max 8 hours
    },
    status: {
      type: 'string',
      required: true,
      default: 'pending'
    },
    price: {
      type: 'number',
      required: true,
      min: 0
    },
    paid: {
      type: 'boolean',
      required: true,
      default: false
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 1000,
      default: ''
    },
    technicianId: {
      type: 'string',
      required: false // Will be added automatically by schema base class
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

  // Job-specific methods
  async findByStatus(status: string) {
    return this.find({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'scheduledDate', direction: 'asc' }]
    });
  }

  async findByClient(clientId: string) {
    return this.find({
      where: [{ field: 'clientId', operator: '==', value: clientId }],
      orderBy: [{ field: 'scheduledDate', direction: 'desc' }]
    });
  }

  async findUpcoming() {
    const now = new Date();
    return this.find({
      where: [
        { field: 'scheduledDate', operator: '>', value: now },
        { field: 'status', operator: 'in', value: ['pending', 'confirmed'] }
      ],
      orderBy: [{ field: 'scheduledDate', direction: 'asc' }]
    });
  }

  async findToday() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.find({
      where: [
        { field: 'scheduledDate', operator: '>=', value: startOfDay },
        { field: 'scheduledDate', operator: '<', value: endOfDay }
      ],
      orderBy: [{ field: 'scheduledDate', direction: 'asc' }]
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.find({
      where: [
        { field: 'scheduledDate', operator: '>=', value: startDate },
        { field: 'scheduledDate', operator: '<=', value: endDate }
      ],
      orderBy: [{ field: 'scheduledDate', direction: 'asc' }]
    });
  }

  async findPendingPayments() {
    return this.find({
      where: [
        { field: 'paid', operator: '==', value: false },
        { field: 'status', operator: '==', value: 'completed' }
      ],
      orderBy: [{ field: 'scheduledDate', direction: 'desc' }]
    });
  }

  async markAsPaid(jobId: string) {
    return this.update(jobId, { paid: true });
  }

  async updateStatus(jobId: string, status: string) {
    return this.update(jobId, { status });
  }

  async reschedule(jobId: string, newDate: Date) {
    return this.update(jobId, { 
      scheduledDate: newDate,
      status: 'confirmed' // Auto-confirm when rescheduling
    });
  }
}