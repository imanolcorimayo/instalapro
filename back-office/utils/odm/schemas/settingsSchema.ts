import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class SettingsSchema extends Schema {
  protected collectionName = 'settings';
  
  protected schema: SchemaDefinition = {
    id: {
      type: 'string',
      required: true
    },
    userUid: {
      type: 'string',
      required: true,
      maxLength: 128
    },
    fullName: {
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
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    createdAt: {
      type: 'date',
      required: true
    },
    updatedAt: {
      type: 'date',
      required: true
    },
    archivedAt: {
      type: 'date',
      required: false
    }
  };

  // Override storage key for settings
  protected override getStorageKey(): string {
    return 'instalapro_user_settings';
  }

  // Settings-specific methods
  async findByUserUid(userUid: string) {
    return this.find({
      where: [{ field: 'userUid', operator: '==', value: userUid }],
      limit: 1
    });
  }

  async findByEmail(email: string) {
    return this.find({
      where: [{ field: 'email', operator: '==', value: email }],
      limit: 1
    });
  }

  async archiveAccount(userUid: string) {
    const settingsResult = await this.findByUserUid(userUid);
    
    if (!settingsResult.success || !settingsResult.data || settingsResult.data.length === 0) {
      return { success: false, error: 'User settings not found' };
    }

    const settings = settingsResult.data[0];
    return this.update(settings.id, { archivedAt: new Date() });
  }

  async isAccountArchived(userUid: string): Promise<{ success: boolean; data?: boolean; error?: string }> {
    const settingsResult = await this.findByUserUid(userUid);
    
    if (!settingsResult.success || !settingsResult.data || settingsResult.data.length === 0) {
      return { success: false, error: 'User settings not found' };
    }

    const settings = settingsResult.data[0];
    return {
      success: true,
      data: !!settings.archivedAt
    };
  }

  // Override storage methods to handle single user settings object
  protected override loadFromStorage(): any[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Convert single settings object to array format for consistency with base schema
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error(`Error loading ${this.collectionName} from localStorage:`, error);
      return [];
    }
  }

  protected override saveToStorage(documents: any[]): void {
    try {
      // Save only the first settings object (single-user app for MVP)
      const settings = documents[0];
      if (!settings) return;
      
      // Serialize dayjs objects to ISO strings for storage
      const serialized = {
        ...settings,
        createdAt: settings.createdAt && typeof settings.createdAt.toISOString === 'function' 
          ? settings.createdAt.toISOString() 
          : settings.createdAt,
        updatedAt: settings.updatedAt && typeof settings.updatedAt.toISOString === 'function' 
          ? settings.updatedAt.toISOString() 
          : settings.updatedAt,
        archivedAt: settings.archivedAt && typeof settings.archivedAt.toISOString === 'function' 
          ? settings.archivedAt.toISOString() 
          : settings.archivedAt
      };
      
      localStorage.setItem(this.getStorageKey(), JSON.stringify(serialized));
    } catch (error) {
      console.error(`Error saving ${this.collectionName} to localStorage:`, error);
      throw new Error(`Failed to save ${this.collectionName} data`);
    }
  }
}