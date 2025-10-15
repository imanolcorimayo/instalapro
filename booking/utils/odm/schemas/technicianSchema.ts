import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class TechniciansSchema extends Schema {
  protected collectionName = 'technicians';

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
    urlSlug: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[a-z0-9-]+$/
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
    }
  };

  // Find technician by URL slug
  async findBySlug(slug: string) {
    return this.find({
      where: [
        { field: 'urlSlug', operator: '==', value: slug },
        { field: 'isActive', operator: '==', value: true }
      ],
      limit: 1
    });
  }
}
