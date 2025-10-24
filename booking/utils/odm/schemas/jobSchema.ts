import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class JobSchema extends Schema {
  protected collectionName = 'jobs';

  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true // Technician's userUid
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
    notes: {
      type: 'string',
      required: false,
      maxLength: 1000,
      default: ''
    },
    source: {
      type: 'string',
      required: false,
      default: 'client_booking'
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
}
