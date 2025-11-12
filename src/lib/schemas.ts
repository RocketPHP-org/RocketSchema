import { SchemaDefinition, SchemaProperty } from '@/types/schema';
import { CategoryMetadata } from '@/types/category';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DOMAINS_FILE = path.join(DATA_DIR, 'domains.json');
const SOLUTIONS_FILE = path.join(DATA_DIR, 'solutions.json');

/**
 * Load all categories from domains.json
 */
function loadCategories(): Record<string, CategoryMetadata> {
  const categories: Record<string, CategoryMetadata> = {};

  if (!fs.existsSync(DOMAINS_FILE)) {
    return categories;
  }

  const domainsData = JSON.parse(fs.readFileSync(DOMAINS_FILE, 'utf-8'));
  const domains = Array.isArray(domainsData) ? domainsData : [];

  for (const domain of domains) {
    categories[domain.name] = domain as CategoryMetadata;
  }

  return categories;
}

/**
 * Load all schemas organized by category
 */
function loadSchemasByCategory(): Record<string, Record<string, SchemaDefinition>> {
  const schemasByCategory: Record<string, Record<string, SchemaDefinition>> = {};

  if (!fs.existsSync(DATA_DIR)) {
    return schemasByCategory;
  }

  const categoryDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const categoryName of categoryDirs) {
    const schemasDir = path.join(DATA_DIR, categoryName, 'schemas');

    if (!fs.existsSync(schemasDir)) {
      continue;
    }

    const schemaFiles = fs.readdirSync(schemasDir)
      .filter(file => file.endsWith('.json'));

    schemasByCategory[categoryName] = {};

    for (const schemaFile of schemaFiles) {
      const schemaPath = path.join(schemasDir, schemaFile);
      const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      const schemaName = path.basename(schemaFile, '.json');

      schemasByCategory[categoryName][schemaName] = schemaData as SchemaDefinition;
    }
  }

  return schemasByCategory;
}

/**
 * Recursively collect all properties from inheritance chain
 */
function collectInheritedProperties(
  schema: SchemaDefinition,
  allSchemas: Record<string, Record<string, SchemaDefinition>>,
  visited: Set<string> = new Set()
): SchemaProperty[] {
  if (!schema.extends || visited.has(schema.extends)) {
    return [];
  }

  visited.add(schema.extends);

  // Find parent schema
  let parentSchema: SchemaDefinition | undefined;
  for (const categorySchemas of Object.values(allSchemas)) {
    if (categorySchemas[schema.extends]) {
      parentSchema = categorySchemas[schema.extends];
      break;
    }
  }

  if (!parentSchema) {
    return [];
  }

  // Recursively collect from grandparent first
  const grandparentProps = collectInheritedProperties(parentSchema, allSchemas, visited);

  // Then add parent's own properties
  const parentProps = parentSchema.properties.map(prop => ({
    ...prop,
    source: schema.extends
  })) as SchemaProperty[];

  // Return grandparent properties first, then parent (maintains hierarchy order)
  return [...grandparentProps, ...parentProps];
}

/**
 * Resolve schema inheritance by loading parent schema properties recursively
 */
function resolveInheritance(schema: SchemaDefinition, allSchemas: Record<string, Record<string, SchemaDefinition>>): SchemaDefinition {
  if (!schema.extends) {
    // No inheritance - return as is (no source needed)
    return schema;
  }

  // Collect all inherited properties (recursive)
  const inheritedProps = collectInheritedProperties(schema, allSchemas);

  // Mark own properties with source
  const ownProps = schema.properties.map(prop => ({
    ...prop,
    source: prop.source || schema.name
  })) as SchemaProperty[];

  // Merge all properties: inherited first, then own
  const allProperties = [...inheritedProps, ...ownProps];

  return {
    ...schema,
    properties: allProperties,
    inheritedProperties: inheritedProps
  };
}

/**
 * Get a schema by name (reloads from disk in dev for hot reload)
 */
export function getSchema(name: string): SchemaDefinition | undefined {
  const allSchemas = loadSchemasByCategory();
  for (const categorySchemas of Object.values(allSchemas)) {
    if (categorySchemas[name]) {
      return resolveInheritance(categorySchemas[name], allSchemas);
    }
  }
  return undefined;
}

/**
 * Get all schema names (reloads from disk in dev)
 */
export function getAllSchemaNames(): string[] {
  const allSchemas = loadSchemasByCategory();
  const names: string[] = [];
  for (const categorySchemas of Object.values(allSchemas)) {
    names.push(...Object.keys(categorySchemas));
  }
  return names;
}

/**
 * Get all schemas (reloads from disk in dev)
 */
export function getAllSchemas(): SchemaDefinition[] {
  const allSchemas = loadSchemasByCategory();
  const schemas: SchemaDefinition[] = [];
  for (const categorySchemas of Object.values(allSchemas)) {
    schemas.push(...Object.values(categorySchemas));
  }
  return schemas;
}

/**
 * Get schemas by category (reloads from disk in dev)
 */
export function getSchemasByCategory(categoryName: string): SchemaDefinition[] {
  const allSchemas = loadSchemasByCategory();
  return Object.values(allSchemas[categoryName] || {});
}

/**
 * Get all categories (reloads from disk in dev)
 */
export function getAllCategories(): CategoryMetadata[] {
  const cats = loadCategories();
  return Object.values(cats).sort((a, b) => (a.order || 999) - (b.order || 999));
}

/**
 * Get category metadata (reloads from disk in dev)
 */
export function getCategory(name: string): CategoryMetadata | undefined {
  const cats = loadCategories();
  return cats[name];
}

/**
 * Solution metadata interface
 */
export interface SolutionMetadata {
  name: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  domains: string[];
  features: string[];
  useCases: string[];
}

/**
 * Get all solutions (reloads from disk in dev)
 */
export function getAllSolutions(): SolutionMetadata[] {
  if (!fs.existsSync(SOLUTIONS_FILE)) {
    return [];
  }

  const solutionsData = JSON.parse(fs.readFileSync(SOLUTIONS_FILE, 'utf-8'));
  return Array.isArray(solutionsData) ? solutionsData : [];
}
