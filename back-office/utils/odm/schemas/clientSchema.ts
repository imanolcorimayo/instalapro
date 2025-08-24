import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class ClientSchema extends Schema {
  protected collectionName = 'clients';
  
  protected schema: SchemaDefinition = {
    id: {
      type: 'string',
      required: true
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

  // Client-specific methods
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
    // For localStorage implementation, we'll do a case-insensitive search
    const allClients = await this.findActive();
    
    if (!allClients.success) {
      return allClients;
    }

    const filtered = allClients.data?.filter(client => 
      client.name.toLowerCase().includes(name.toLowerCase())
    ) || [];

    return { success: true, data: filtered };
  }

  async findTopClients(limit: number = 10) {
    return this.findActive({
      orderBy: [{ field: 'totalSpent', direction: 'desc' }],
      limit
    });
  }

  async findFrequentClients(limit: number = 10) {
    return this.findActive({
      orderBy: [{ field: 'totalJobs', direction: 'desc' }],
      limit
    });
  }

  async findRecentClients(limit: number = 10) {
    return this.findActive({
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit
    });
  }

  async updateServiceHistory(clientId: string, jobHistoryEntry: any) {
    const clientResult = await this.findById(clientId);
    
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: 'Client not found' };
    }

    const client = clientResult.data;
    const updatedHistory = [...(client.serviceHistory || []), jobHistoryEntry];
    const newTotalJobs = updatedHistory.length;
    const newTotalSpent = updatedHistory.reduce((sum, entry) => sum + (entry.price || 0), 0);

    return this.update(clientId, {
      serviceHistory: updatedHistory,
      totalJobs: newTotalJobs,
      totalSpent: newTotalSpent
    });
  }

  async updatePreferredServices(clientId: string, serviceTypes: string[]) {
    return this.update(clientId, {
      preferredServiceTypes: serviceTypes
    });
  }

  async addNote(clientId: string, note: string) {
    const clientResult = await this.findById(clientId);
    
    if (!clientResult.success || !clientResult.data) {
      return { success: false, error: 'Client not found' };
    }

    const client = clientResult.data;
    const existingNotes = client.notes || '';
    const timestamp = new Date().toLocaleDateString('es-AR');
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`;

    return this.update(clientId, {
      notes: updatedNotes
    });
  }

  async getClientStats() {
    const allClients = await this.findActive();
    
    if (!allClients.success) {
      return { success: false, error: 'Failed to load clients' };
    }

    const clients = allClients.data || [];
    const totalClients = clients.length;
    const totalRevenue = clients.reduce((sum, client) => sum + (client.totalSpent || 0), 0);
    const totalJobs = clients.reduce((sum, client) => sum + (client.totalJobs || 0), 0);
    const averageRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;

    return {
      success: true,
      data: {
        totalClients,
        totalRevenue,
        totalJobs,
        averageRevenuePerClient
      }
    };
  }
}