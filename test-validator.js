const validateSchema = (schema) => {
  const errors = [];

  if (!schema.properties || !Array.isArray(schema.properties)) {
    errors.push('properties must be an array');
    return { valid: false, errors };
  }

  schema.properties.forEach((prop, index) => {
    if (!prop.name || !prop.type || !prop.description) {
      errors.push(`Property ${index}: missing required field`);
    }
    if (prop.mode && !['stored', 'computed', 'enum'].includes(prop.mode)) {
      errors.push(`Property ${index} (${prop.name}): invalid mode '${prop.mode}'`);
    }
  });

  return { valid: errors.length === 0, errors };
};

// Test Customer.json
const customer = require('./data/crm/schemas/Customer.json');
const result = validateSchema(customer);

console.log('Testing Customer.json:');
console.log('- Properties count:', customer.properties.length);
console.log('- Validation:', result.valid ? '✅ PASSED' : '❌ FAILED');

if (!result.valid) {
  console.log('Errors:', result.errors);
}

// Count mode types
const modes = customer.properties.reduce((acc, p) => {
  const mode = p.mode || 'stored';
  acc[mode] = (acc[mode] || 0) + 1;
  return acc;
}, {});

console.log('- Modes used:', modes);

// Check for new properties
const hasNullable = customer.properties.some(p => p.hasOwnProperty('nullable'));
const hasDefault = customer.properties.some(p => p.hasOwnProperty('default'));
const hasAllowedValues = customer.properties.some(p => p.hasOwnProperty('allowedValues'));
const hasProperties = customer.properties.some(p => p.hasOwnProperty('properties'));

console.log('\nNew validator features used:');
console.log('- nullable:', hasNullable ? '✅' : '❌');
console.log('- default:', hasDefault ? '✅' : '❌');
console.log('- allowedValues:', hasAllowedValues ? '✅' : '❌');
console.log('- properties (nested):', hasProperties ? '✅' : '❌');

console.log('\n--- Testing CommercialDocument.json ---');
const commercialDoc = require('./data/financial/schemas/CommercialDocument.json');
const result2 = validateSchema(commercialDoc);

console.log('- Properties count:', commercialDoc.properties.length);
console.log('- Validation:', result2.valid ? '✅ PASSED' : '❌ FAILED');

// Count mode types
const modes2 = commercialDoc.properties.reduce((acc, p) => {
  const mode = p.mode || 'stored';
  acc[mode] = (acc[mode] || 0) + 1;
  return acc;
}, {});

console.log('- Modes used:', modes2);

console.log('\n--- Testing IpRestriction.json ---');
const ipRestriction = require('./data/api-management/schemas/IpRestriction.json');
const result3 = validateSchema(ipRestriction);

console.log('- Properties count:', ipRestriction.properties.length);
console.log('- Validation:', result3.valid ? '✅ PASSED' : '❌ FAILED');

// Check for integer type
const hasInteger = ipRestriction.properties.some(p => p.type === 'integer');
console.log('- Uses integer type:', hasInteger ? '✅' : '❌');
