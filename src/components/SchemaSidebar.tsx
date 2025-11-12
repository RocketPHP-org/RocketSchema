'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CategoryMetadata } from '@/types/category';
import { SchemaDefinition } from '@/types/schema';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SchemaSidebarProps {
  categories: CategoryMetadata[];
  schemasByCategory: Record<string, SchemaDefinition[]>;
  solutionName?: string; // Optional: if provided, schema links will be scoped to solution
  activeSchema?: string; // Optional: currently active schema name
}

export function SchemaSidebar({ categories, schemasByCategory, solutionName, activeSchema }: SchemaSidebarProps) {
  // Find which domain contains the active schema
  const getDomainForSchema = (schemaName: string | undefined) => {
    if (!schemaName) return null;
    for (const category of categories) {
      const schemas = schemasByCategory[category.name] || [];
      if (schemas.some(s => s.name === schemaName)) {
        return category.name;
      }
    }
    return null;
  };

  // Start with all domains collapsed
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  // Auto-expand domain when active schema changes (but keep others open if manually expanded)
  useEffect(() => {
    if (activeSchema) {
      const activeDomain = getDomainForSchema(activeSchema);
      if (activeDomain && !expandedDomains.has(activeDomain)) {
        setExpandedDomains(prev => new Set([...prev, activeDomain]));
      }
    }
  }, [activeSchema]);

  const toggleDomain = (domainName: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainName)) {
      newExpanded.delete(domainName);
    } else {
      newExpanded.add(domainName);
    }
    setExpandedDomains(newExpanded);
  };

  // Separate business and foundation domains
  const sharedDomains = ['support-types', 'reference-data', 'core-entities', 'transverse'];
  const businessCategories = categories.filter(cat => !sharedDomains.includes(cat.name));
  const foundationCategories = categories.filter(cat => sharedDomains.includes(cat.name));

  // Helper to generate schema link based on context
  const getSchemaLink = (schemaName: string) => {
    return solutionName
      ? `/solutions/${solutionName}/schemas/${schemaName}`
      : `/schemas/${schemaName}`;
  };

  return (
    <aside className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6">
        {/* Business Domains Section */}
        {businessCategories.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Business Domains
            </h2>
            <nav className="space-y-2 mb-8">
              {businessCategories.map(category => {
                const categorySchemas = schemasByCategory[category.name] || [];
                const isExpanded = expandedDomains.has(category.name);

                return (
                  <div key={category.name}>
                    <button
                      onClick={() => toggleDomain(category.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <span>{category.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {categorySchemas.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 space-y-1 ml-2">
                        {categorySchemas.map(schema => {
                          const isActive = activeSchema === schema.name;
                          const hasNoProperties = schema.properties.length === 0;
                          return (
                            <li key={schema.name}>
                              <Link
                                href={getSchemaLink(schema.name)}
                                className={`flex items-center justify-between gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <span className="truncate">{schema.name}</span>
                                {hasNoProperties && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                                    WIP
                                  </Badge>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          </>
        )}

        {/* Foundation Domains Section */}
        {foundationCategories.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Foundation Domains
            </h2>
            <nav className="space-y-2">
              {foundationCategories.map(category => {
                const categorySchemas = schemasByCategory[category.name] || [];
                const isExpanded = expandedDomains.has(category.name);

                return (
                  <div key={category.name}>
                    <button
                      onClick={() => toggleDomain(category.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <span>{category.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {categorySchemas.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 space-y-1 ml-2">
                        {categorySchemas.map(schema => {
                          const isActive = activeSchema === schema.name;
                          const hasNoProperties = schema.properties.length === 0;
                          return (
                            <li key={schema.name}>
                              <Link
                                href={getSchemaLink(schema.name)}
                                className={`flex items-center justify-between gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <span className="truncate">{schema.name}</span>
                                {hasNoProperties && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                                    WIP
                                  </Badge>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </aside>
  );
}
