import { SchemaDefinition } from '@/types/schema';
import PersonSchema from '@/../../data/schemas/Person.json';
import OrganizationSchema from '@/../../data/schemas/Organization.json';
import PostalAddressSchema from '@/../../data/schemas/PostalAddress.json';

/**
 * Registry of all available schemas
 */
export const schemas: Record<string, SchemaDefinition> = {
  Person: PersonSchema as SchemaDefinition,
  Organization: OrganizationSchema as SchemaDefinition,
  PostalAddress: PostalAddressSchema as SchemaDefinition,
};

/**
 * Get a schema by name
 */
export function getSchema(name: string): SchemaDefinition | undefined {
  return schemas[name];
}

/**
 * Get all schema names
 */
export function getAllSchemaNames(): string[] {
  return Object.keys(schemas);
}

/**
 * Get all schemas
 */
export function getAllSchemas(): SchemaDefinition[] {
  return Object.values(schemas);
}
