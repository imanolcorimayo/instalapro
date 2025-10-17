import { Schema } from '../schema';
import type { SchemaDefinition } from '../types';

export class ClientsSchema extends Schema {
  protected collectionName = 'clients';

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
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: 'string',
      required: true,
      maxLength: 20,
      minLength: 1
    },
    address: {
      type: 'string',
      required: true,
      maxLength: 200,
      minLength: 1
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 500
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

  // Find client by email for a specific technician
  async findByEmailAndTechnicianUid(email: string, technicianUserUid: string) {
    return this.find({
      where: [
        { field: 'email', operator: '==', value: email.toLowerCase().trim() },
        { field: 'userUid', operator: '==', value: technicianUserUid }
      ],
      limit: 1
    });
  }
}
