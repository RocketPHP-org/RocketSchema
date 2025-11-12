'use client';

import { useState } from 'react';
import { SchemaDefinition } from '@/types/schema';
import { CategoryMetadata } from '@/types/category';
import { SolutionMetadata } from '@/lib/schemas';
import { SchemaSearch } from '@/components/SchemaSearch';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SchemaGridProps {
  categories: CategoryMetadata[];
  schemasByCategory: Record<string, SchemaDefinition[]>;
  solutions: SolutionMetadata[];
  solutionName?: string; // Optional: if provided, schema links will be scoped to solution
}

export function SchemaGrid({ categories, schemasByCategory, solutions, solutionName }: SchemaGridProps) {
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

  // Helper to generate schema link based on context
  const getSchemaLink = (schemaName: string) => {
    return solutionName
      ? `/solutions/${solutionName}/schemas/${schemaName}`
      : `/schemas/${schemaName}`;
  };

  return (
    <div className="w-full">

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
            <div className="rounded-md border bg-white dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schema Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Properties</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchemas.map((schema) => (
                    <TableRow key={schema.name} className="hover:bg-muted/50">
                      <TableCell className="font-medium w-[250px]">
                        <Link href={getSchemaLink(schema.name)} className="hover:text-primary hover:underline">
                          {schema.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {schema.description}
                      </TableCell>
                      <TableCell className="text-right w-[120px]">
                        <Badge variant="secondary">
                          {schema.properties.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right w-[80px]">
                        <Link href={getSchemaLink(schema.name)}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                            <ArrowRight className="h-3 w-3" />
                          </Badge>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <div className="rounded-md border bg-white dark:bg-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Schema Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Properties</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchemas.map((schema) => (
                        <TableRow key={schema.name} className="hover:bg-muted/50">
                          <TableCell className="font-medium w-[250px]">
                            <Link href={getSchemaLink(schema.name)} className="hover:text-primary hover:underline">
                              {schema.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {schema.description}
                          </TableCell>
                          <TableCell className="text-right w-[120px]">
                            <Badge variant="secondary">
                              {schema.properties.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right w-[80px]">
                            <Link href={getSchemaLink(schema.name)}>
                              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                                <ArrowRight className="h-3 w-3" />
                              </Badge>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
    </div>
  );
}
