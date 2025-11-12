'use client';

import { useState } from 'react';
import { SchemaDefinition } from '@/types/schema';
import { CategoryMetadata } from '@/types/category';
import { SolutionMetadata } from '@/lib/schemas';
import SchemaCard from '@/components/SchemaCard';
import { SchemaSearch } from '@/components/SchemaSearch';
import { Badge } from '@/components/ui/badge';

interface SchemaGridProps {
  categories: CategoryMetadata[];
  schemasByCategory: Record<string, SchemaDefinition[]>;
  solutions: SolutionMetadata[];
}

export function SchemaGrid({ categories, schemasByCategory, solutions }: SchemaGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);

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

  // Filter categories based on selected solution
  const filteredCategories = selectedSolution
    ? (() => {
        const solution = solutions.find(s => s.name === selectedSolution);
        return solution
          ? categories.filter(cat => solution.domains.includes(cat.name))
          : categories;
      })()
    : categories;

  // Separate shared/foundation domains from business domains
  const sharedDomains = ['support-types', 'reference-data', 'core-entities', 'transverse'];
  const businessCategories = filteredCategories.filter(cat => !sharedDomains.includes(cat.name));
  const foundationCategories = filteredCategories.filter(cat => sharedDomains.includes(cat.name));

  // Handle solution selection
  const handleSolutionClick = (solutionName: string) => {
    setSelectedSolution(selectedSolution === solutionName ? null : solutionName);
  };

  // Calculate dynamic stats
  const totalDomains = filteredCategories.length;
  const totalSchemas = filteredCategories.reduce((sum, cat) => {
    return sum + (schemasByCategory[cat.name] || []).length;
  }, 0);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <SchemaSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Dynamic Stats */}
      <div className="flex justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {totalDomains}
          </div>
          <div className="text-sm text-muted-foreground">Domains</div>
        </div>
        <div className="w-px bg-border"></div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {totalSchemas}
          </div>
          <div className="text-sm text-muted-foreground">Schemas</div>
        </div>
      </div>

      {/* Solution Filter Chips */}
      {solutions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Solutions:</span>
            <Badge
              variant={selectedSolution === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => setSelectedSolution(null)}
            >
              All Domains
            </Badge>
            {solutions.map(solution => (
              <Badge
                key={solution.name}
                variant={selectedSolution === solution.name ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleSolutionClick(solution.name)}
              >
                {solution.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Business Domains */}
      {businessCategories.map((category, index) => {
        const categorySchemas = schemasByCategory[category.name] || [];
        const filteredSchemas = filterSchemas(categorySchemas);

        if (filteredSchemas.length === 0) {
          return null;
        }

        return (
          <div key={category.name} className="mb-12">
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

      {/* Foundation/Shared Domains - At the bottom */}
      {foundationCategories.length > 0 && (
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-xl font-semibold text-muted-foreground mb-8">Foundation & Shared Domains</h2>
          {foundationCategories.map((category, index) => {
            const categorySchemas = schemasByCategory[category.name] || [];
            const filteredSchemas = filterSchemas(categorySchemas);

            if (filteredSchemas.length === 0) {
              return null;
            }

            return (
              <div key={category.name} className={index < foundationCategories.length - 1 ? 'mb-12' : ''}>
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
        </div>
      )}

      {/* No results message */}
      {searchQuery && filteredCategories.every(cat => filterSchemas(schemasByCategory[cat.name] || []).length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No schemas found for "{searchQuery}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try a different search term
          </p>
        </div>
      )}

      {/* No results for solution filter */}
      {!searchQuery && selectedSolution && filteredCategories.every(cat => (schemasByCategory[cat.name] || []).length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No schemas found in this solution
          </p>
        </div>
      )}
    </>
  );
}
