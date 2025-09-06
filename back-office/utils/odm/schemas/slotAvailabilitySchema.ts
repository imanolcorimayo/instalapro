import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class SlotAvailabilitySchema extends Schema {
  protected collectionName = 'slotAvailability';
  
  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true // Added automatically by schema base class
    },
    date: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
      maxLength: 10,
      minLength: 10
    },
    hour: {
      type: 'number',
      required: true,
      min: 6,  // 6 AM
      max: 22, // 10 PM
      integer: true
    },
    isAvailable: {
      type: 'boolean',
      required: true,
      default: false
    },
    isManual: {
      type: 'boolean',
      required: true,
      default: true // Most changes are manual unless auto-closed by job creation
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

  // Slot-specific query methods (validation and basic queries only)
  async findByDate(date: string) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [{ field: 'date', operator: '==', value: date }],
      orderBy: [{ field: 'hour', direction: 'asc' }]
    });
  }

  async findByDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate }
      ],
      orderBy: [
        { field: 'date', direction: 'asc' },
        { field: 'hour', direction: 'asc' }
      ]
    });
  }

  async findByDateAndHour(date: string, hour: number) {
    if (!date || hour < 6 || hour > 22) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [
        { field: 'date', operator: '==', value: date },
        { field: 'hour', operator: '==', value: hour }
      ],
      limit: 1
    });
  }

  async findAvailableSlots(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
        { field: 'isAvailable', operator: '==', value: true }
      ],
      orderBy: [
        { field: 'date', direction: 'asc' },
        { field: 'hour', direction: 'asc' }
      ]
    });
  }

  async findManuallyClosedSlots(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
        { field: 'isAvailable', operator: '==', value: false },
        { field: 'isManual', operator: '==', value: true }
      ],
      orderBy: [
        { field: 'date', direction: 'asc' },
        { field: 'hour', direction: 'asc' }
      ]
    });
  }

  async findAutoClosedSlots(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }
    
    return this.find({
      where: [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
        { field: 'isAvailable', operator: '==', value: false },
        { field: 'isManual', operator: '==', value: false }
      ],
      orderBy: [
        { field: 'date', direction: 'asc' },
        { field: 'hour', direction: 'asc' }
      ]
    });
  }
}