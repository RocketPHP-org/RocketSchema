'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SchemaDefinition } from '@/types/schema';
import { CategoryMetadata } from '@/types/category';
import SchemaCard from '@/components/SchemaCard';
import { SchemaSearch } from '@/components/SchemaSearch';

interface SchemaGridProps {
  categories: CategoryMetadata[];
  schemasByCategory: Record<string, SchemaDefinition[]>;
}

export function SchemaGrid({ categories, schemasByCategory }: SchemaGridProps) {
  const t = useTranslations('search');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter schemas based on search query
  const filterSchemas = (schemas: SchemaDefinition[]) => {
    if (!searchQuery.trim()) return schemas;

    const query = searchQuery.toLowerCase();
    return schemas.filter(schema => {
      // Search in name
      if (schema.name.toLowerCase().includes(query)) return true;

      // Search in description
      if (schema.description?.toLowerCase().includes(query)) return true;

      // Search in properties
      return schema.properties.some(prop =>
        prop.name.toLowerCase().includes(query) ||
        prop.description.toLowerCase().includes(query)
      );
    });
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-12">
        <SchemaSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Schemas Grid */}
      {categories.map((category, index) => {
        const categorySchemas = schemasByCategory[category.name] || [];
        const filteredSchemas = filterSchemas(categorySchemas);

        if (filteredSchemas.length === 0) {
          return null;
        }

        return (
          <div key={category.name} className={index < categories.length - 1 ? 'mb-12' : ''}>
            <h3 className="text-2xl font-bold mb-2">
              {category.label}
            </h3>
            <p className="text-muted-foreground mb-6">{category.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemas.map((schema) => (
                <SchemaCard key={schema.name} schema={schema} />
              ))}
            </div>
          </div>
        );
      })}

      {/* No results message */}
      {searchQuery && categories.every(cat => filterSchemas(schemasByCategory[cat.name] || []).length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {t('noResults', { query: searchQuery })}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('tryDifferent')}
          </p>
        </div>
      )}
    </>
  );
}
