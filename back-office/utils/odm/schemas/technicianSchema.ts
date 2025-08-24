import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class TechnicianSchema extends Schema {
  protected collectionName = 'technicians';
  
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
    whatsappNumber: {
      type: 'string',
      required: true,
      maxLength: 20,
      pattern: /^[+]?[0-9\s\-()]+$/
    },
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    businessName: {
      type: 'string',
      required: false,
      maxLength: 100
    },
    serviceArea: {
      type: 'array',
      required: true,
      arrayOf: 'string'
    },
    services: {
      type: 'array',
      required: true,
      arrayOf: 'object',
      default: []
    },
    availability: {
      type: 'object',
      required: true
    },
    bookingUrl: {
      type: 'string',
      required: true,
      maxLength: 200
    },
    profileSetupComplete: {
      type: 'boolean',
      required: true,
      default: false
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

  // Override storage key to match existing localStorage key
  protected override getStorageKey(): string {
    return 'instalapro_technician_profile';
  }

  // Technician-specific methods
  async findByEmail(email: string) {
    return this.find({
      where: [{ field: 'email', operator: '==', value: email }],
      limit: 1
    });
  }

  async findByPhone(phone: string) {
    return this.find({
      where: [{ field: 'phone', operator: '==', value: phone }],
      limit: 1
    });
  }

  async updateServices(technicianId: string, services: any[]) {
    return this.update(technicianId, { services });
  }

  async addService(technicianId: string, service: any) {
    const technicianResult = await this.findById(technicianId);
    
    if (!technicianResult.success || !technicianResult.data) {
      return { success: false, error: 'Technician not found' };
    }

    const technician = technicianResult.data;
    const updatedServices = [...(technician.services || []), service];

    return this.update(technicianId, { services: updatedServices });
  }

  async updateService(technicianId: string, serviceId: string, serviceUpdates: any) {
    const technicianResult = await this.findById(technicianId);
    
    if (!technicianResult.success || !technicianResult.data) {
      return { success: false, error: 'Technician not found' };
    }

    const technician = technicianResult.data;
    const services = technician.services || [];
    const updatedServices = services.map((service: any) =>
      service.id === serviceId ? { ...service, ...serviceUpdates } : service
    );

    return this.update(technicianId, { services: updatedServices });
  }

  async removeService(technicianId: string, serviceId: string) {
    const technicianResult = await this.findById(technicianId);
    
    if (!technicianResult.success || !technicianResult.data) {
      return { success: false, error: 'Technician not found' };
    }

    const technician = technicianResult.data;
    const services = technician.services || [];
    const updatedServices = services.filter((service: any) => service.id !== serviceId);

    return this.update(technicianId, { services: updatedServices });
  }

  async updateAvailability(technicianId: string, availability: any) {
    return this.update(technicianId, { availability });
  }

  async updateDaySchedule(technicianId: string, day: string, schedule: any) {
    const technicianResult = await this.findById(technicianId);
    
    if (!technicianResult.success || !technicianResult.data) {
      return { success: false, error: 'Technician not found' };
    }

    const technician = technicianResult.data;
    const availability = technician.availability || {};
    const updatedAvailability = {
      ...availability,
      [day]: schedule
    };

    return this.update(technicianId, { availability: updatedAvailability });
  }

  async toggleDayAvailability(technicianId: string, day: string) {
    const technicianResult = await this.findById(technicianId);
    
    if (!technicianResult.success || !technicianResult.data) {
      return { success: false, error: 'Technician not found' };
    }

    const technician = technicianResult.data;
    const availability = technician.availability || {};
    const daySchedule = availability[day] || {};
    const updatedDaySchedule = {
      ...daySchedule,
      enabled: !daySchedule.enabled
    };

    return this.updateDaySchedule(technicianId, day, updatedDaySchedule);
  }

  async markProfileComplete(technicianId: string) {
    return this.update(technicianId, { profileSetupComplete: true });
  }

  async updateServiceArea(technicianId: string, serviceArea: string[]) {
    return this.update(technicianId, { serviceArea });
  }

  async getActiveServices(technicianId: string) {
    const technicianResult = await this.findById(technicianId);
    
    if (!technicianResult.success || !technicianResult.data) {
      return { success: false, error: 'Technician not found' };
    }

    const technician = technicianResult.data;
    const services = technician.services || [];
    const activeServices = services.filter((service: any) => service.isActive !== false);

    return {
      success: true,
      data: activeServices
    };
  }

  async getServicesCount(technicianId: string) {
    const servicesResult = await this.getActiveServices(technicianId);
    
    if (!servicesResult.success) {
      return servicesResult;
    }

    return {
      success: true,
      data: {
        total: servicesResult.data?.length || 0,
        byCategory: this.groupServicesByCategory(servicesResult.data || [])
      }
    };
  }

  private groupServicesByCategory(services: any[]) {
    const grouped: Record<string, number> = {};
    
    services.forEach(service => {
      const category = service.category || 'other';
      grouped[category] = (grouped[category] || 0) + 1;
    });

    return grouped;
  }

  // Override storage methods to handle single technician object instead of array
  protected override loadFromStorage(): any[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Convert single technician object to array format for consistency with base schema
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error(`Error loading ${this.collectionName} from localStorage:`, error);
      return [];
    }
  }

  protected override saveToStorage(documents: any[]): void {
    try {
      // Save only the first technician object (single-technician app)
      const technician = documents[0];
      if (!technician) return;
      
      // Serialize dayjs objects to ISO strings for storage
      const serialized = {
        ...technician,
        createdAt: technician.createdAt && typeof technician.createdAt.toISOString === 'function' 
          ? technician.createdAt.toISOString() 
          : technician.createdAt,
        updatedAt: technician.updatedAt && typeof technician.updatedAt.toISOString === 'function' 
          ? technician.updatedAt.toISOString() 
          : technician.updatedAt
      };
      
      localStorage.setItem(this.getStorageKey(), JSON.stringify(serialized));
    } catch (error) {
      console.error(`Error saving ${this.collectionName} to localStorage:`, error);
      throw new Error(`Failed to save ${this.collectionName} data`);
    }
  }
}