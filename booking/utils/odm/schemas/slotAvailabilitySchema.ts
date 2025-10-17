import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class SlotAvailabilitySchema extends Schema {
  protected collectionName = 'slotAvailability';

  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true
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
    },
    isAvailable: {
      type: 'boolean',
      required: true,
      default: false
    },
    isManual: {
      type: 'boolean',
      required: true,
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

  // Find slots by date (public read)
  async findByDate(date: string) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: true, data: [] };
    }

    // Query only by isAvailable to avoid index requirement
    // Then filter client-side by date
    const result = await this.find({
      where: [
        { field: 'isAvailable', operator: '==', value: true }
      ]
    });

    // Filter client-side by date
    if (result.success && result.data) {
      result.data = result.data
        .filter(slot => slot.date === date)
        .sort((a, b) => a.hour - b.hour);
    }

    return result;
  }

  // Find available slots in date range (public read)
  async findAvailableSlots(startDate: string, endDate: string, userUid: string) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }

    // Query only by isAvailable to avoid index requirement
    // Then filter client-side by date range and userUid
    // TODO: Warning - this is inneficient for large datasets and insecure
    const result = await this.find({
      where: [
        { field: 'isAvailable', operator: '==', value: true }
      ]
    });

    // Filter client-side by date range and userUid (same pattern as serviceTypes)
    if (result.success && result.data) {
      result.data = result.data.filter(slot => {
        return slot.userUid === userUid &&
               slot.date >= startDate &&
               slot.date <= endDate;
      });
    }

    return result;
  }

  // Close time slots for a booked job (auto-close)
  async closeSlotsByDateAndHours(date: string, hours: number[], userUid: string) {
    try {
      // Find all slots for the specified date and hours
      const result = await this.find({
        where: [
          { field: 'isAvailable', operator: '==', value: true }
        ]
      });

      if (!result.success || !result.data) {
        return { success: false, error: 'Failed to find slots' };
      }

      // Filter client-side by date, hours, and userUid
      const slotsToClose = result.data.filter(slot => {
        return slot.userUid === userUid &&
               slot.date === date &&
               hours.includes(slot.hour);
      });

      // Update each slot to be unavailable (auto-closed)
      const updatePromises = slotsToClose.map(slot =>
        this.update(slot.id, {
          isAvailable: false,
          isManual: false // Auto-closed by job creation
        }, userUid)
      );

      await Promise.all(updatePromises);

      return { success: true, closedCount: slotsToClose.length };
    } catch (error) {
      console.error('Error closing slots:', error);
      return { success: false, error: `Failed to close slots: ${error}` };
    }
  }
}
