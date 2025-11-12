'use client';

import { usePathname } from 'next/navigation';
import { SchemaSidebar } from '@/components/SchemaSidebar';
import { CategoryMetadata } from '@/types/category';
import { SchemaDefinition } from '@/types/schema';

interface SolutionLayoutClientProps {
  categories: CategoryMetadata[];
  schemasByCategory: Record<string, SchemaDefinition[]>;
  solutionName: string;
  children: React.ReactNode;
}

export function SolutionLayoutClient({
  categories,
  schemasByCategory,
  solutionName,
  children,
}: SolutionLayoutClientProps) {
  const pathname = usePathname();

  // Extract active schema name from pathname
  // e.g., /solutions/crm-complete/schemas/Customer -> Customer
  const activeSchema = pathname.includes('/schemas/')
    ? pathname.split('/schemas/')[1]?.split('/')[0]
    : undefined;

  return (
    <div className="flex">
      {/* Left Sidebar - Persistent across schema navigation */}
      <SchemaSidebar
        categories={categories}
        schemasByCategory={schemasByCategory}
        solutionName={solutionName}
        activeSchema={activeSchema}
      />

      {/* Main Content - Children will be rendered here */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
