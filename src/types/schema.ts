/**
 * Base schema type that all RocketSchema entities extend
 */
export interface BaseSchema {
  '@type': string;
  '@context': string;
  id?: string;
  name?: string;
  description?: string;
}

/**
 * Property definition for a schema
 */
export interface SchemaProperty {
  name: string;
  type: string | string[];
  description: string;
  required?: boolean;
  format?: string;
  example?: any;
  source?: string; // Which schema this property comes from (for inheritance)
}

/**
 * Complete schema definition
 */
export interface SchemaDefinition {
  '@type': string;
  '@context': string;
  name: string;
  description: string;
  extends?: string;
  inheritedProperties?: SchemaProperty[];
  properties: SchemaProperty[];
  examples?: any[];
}
