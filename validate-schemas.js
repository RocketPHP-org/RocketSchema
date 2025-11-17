const fs = require('fs');
const path = require('path');

// Load the validator schema
const validatorSchema = require('./src/lib/rocketschema-validator.json');

// Function to validate a schema file
function validateSchema(filePath) {
  try {
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check required fields
    const errors = [];

    if (!schema['@type'] || schema['@type'] !== 'Schema') {
      errors.push('@type must be "Schema"');
    }

    if (!schema['@context'] || schema['@context'] !== 'https://rocketschema.org/context') {
      errors.push('@context must be "https://rocketschema.org/context"');
    }

    if (!schema.name || typeof schema.name !== 'string') {
      errors.push('name is required and must be a string');
    }

    if (!schema.description || typeof schema.description !== 'string') {
      errors.push('description is required and must be a string');
    }

    if (!schema.properties || !Array.isArray(schema.properties)) {
      errors.push('properties is required and must be an array');
    } else if (schema.properties.length === 0) {
      // Warning only for empty properties (stub schemas)
      errors.push('⚠️  WARNING: properties array is empty (stub schema)');
    }

    // Validate each property
    if (schema.properties) {
      schema.properties.forEach((prop, index) => {
        if (!prop.name || typeof prop.name !== 'string') {
          errors.push(`Property ${index}: name is required`);
        }
        if (!prop.type || typeof prop.type !== 'string') {
          errors.push(`Property ${index} (${prop.name}): type is required`);
        }
        if (!prop.description || typeof prop.description !== 'string') {
          errors.push(`Property ${index} (${prop.name}): description is required`);
        }
        if (prop.mode && !['stored', 'computed', 'enum'].includes(prop.mode)) {
          errors.push(`Property ${index} (${prop.name}): mode must be 'stored', 'computed', or 'enum'`);
        }
      });
    }

    return { valid: errors.length === 0, errors, schema };
  } catch (e) {
    return { valid: false, errors: ['Failed to parse JSON: ' + e.message], schema: null };
  }
}

// Find all schema files
function findSchemaFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSchemaFiles(fullPath));
    } else if (entry.name.endsWith('.json') && entry.name !== 'domains.json' && entry.name !== 'solutions.json') {
      files.push(fullPath);
    }
  }

  return files;
}

// Main validation
const schemaFiles = findSchemaFiles('./data');
let validCount = 0;
let warningCount = 0;
let invalidCount = 0;
const issues = [];
const warnings = [];

console.log(`Found ${schemaFiles.length} schema files to validate\n`);

schemaFiles.forEach(file => {
  const result = validateSchema(file);
  const hasWarnings = result.errors.some(e => e.startsWith('⚠️'));
  const hasErrors = result.errors.some(e => !e.startsWith('⚠️'));

  if (result.valid) {
    validCount++;
  } else if (hasWarnings && !hasErrors) {
    warningCount++;
    warnings.push({ file, errors: result.errors });
  } else {
    invalidCount++;
    issues.push({ file, errors: result.errors });
  }
});

console.log(`\n=== Validation Summary ===`);
console.log(`✅ Valid: ${validCount}`);
console.log(`⚠️  Warnings (stub schemas): ${warningCount}`);
console.log(`❌ Invalid: ${invalidCount}`);

if (warnings.length > 0 && process.argv.includes('--show-warnings')) {
  console.log(`\n=== Warnings (Stub Schemas) ===`);
  warnings.forEach(({ file, errors }) => {
    console.log(`\n${file}:`);
    errors.forEach(err => console.log(`  - ${err}`));
  });
}

if (issues.length > 0) {
  console.log(`\n=== Critical Issues Found ===`);
  issues.forEach(({ file, errors }) => {
    console.log(`\n${file}:`);
    errors.forEach(err => console.log(`  - ${err}`));
  });
}

console.log(`\nNote: Use --show-warnings to see stub schemas with empty properties`);

process.exit(invalidCount > 0 ? 1 : 0);
