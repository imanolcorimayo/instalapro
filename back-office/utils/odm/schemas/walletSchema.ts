import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class WalletSchema extends Schema {
  protected collectionName = 'wallets';

  protected schema: SchemaDefinition = {
    userUid: {
      type: 'string',
      required: true // Added automatically by schema base class
    },
    clientId: {
      type: 'string',
      required: false,
      maxLength: 50
    },
    jobId: {
      type: 'string',
      required: false,
      maxLength: 50
    },
    movementType: {
      type: 'string',
      required: true,
      // Currently only 'outcome' is allowed, but field exists for future expansion
      default: 'outcome'
    },
    amount: {
      type: 'number',
      required: true,
      min: 0 // Amount must be positive
    },
    date: {
      type: 'date',
      required: true
    },
    category: {
      type: 'string',
      required: true,
      maxLength: 50,
      minLength: 1
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 500,
      default: ''
    },
    createdAt: {
      type: 'date',
      required: true
    },
    createdBy: {
      type: 'string',
      required: false
    },
    updatedAt: {
      type: 'date',
      required: true
    },
    deletedAt: {
      type: 'date',
      required: false
    }
  };

  // Wallet-specific query methods (validation and basic queries only)
  async findByDateRange(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
      return { success: true, data: [] };
    }

    return this.find({
      where: [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
        { field: 'deletedAt', operator: '==', value: null }
      ],
      orderBy: [{ field: 'date', direction: 'desc' }]
    });
  }

  async findByCategory(category: string) {
    if (!category) {
      return { success: true, data: [] };
    }

    return this.find({
      where: [
        { field: 'category', operator: '==', value: category },
        { field: 'deletedAt', operator: '==', value: null }
      ],
      orderBy: [{ field: 'date', direction: 'desc' }]
    });
  }

  async findByClientId(clientId: string) {
    if (!clientId) {
      return { success: true, data: [] };
    }

    return this.find({
      where: [
        { field: 'clientId', operator: '==', value: clientId },
        { field: 'deletedAt', operator: '==', value: null }
      ],
      orderBy: [{ field: 'date', direction: 'desc' }]
    });
  }

  async findByJobId(jobId: string) {
    if (!jobId) {
      return { success: true, data: [] };
    }

    return this.find({
      where: [
        { field: 'jobId', operator: '==', value: jobId },
        { field: 'deletedAt', operator: '==', value: null }
      ],
      orderBy: [{ field: 'date', direction: 'desc' }]
    });
  }

  async findActiveWallets() {
    // Calculate date 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    return this.find({
      where: [
        { field: 'deletedAt', operator: '==', value: null },
        { field: 'date', operator: '>=', value: twoMonthsAgo }
      ],
      orderBy: [{ field: 'date', direction: 'desc' }]
    });
  }

  async softDelete(walletId: string) {
    return this.update(walletId, {
      deletedAt: new Date(),
      updatedAt: new Date()
    });
  }

  async restore(walletId: string) {
    return this.update(walletId, {
      deletedAt: null,
      updatedAt: new Date()
    });
  }
}
