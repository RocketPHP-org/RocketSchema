import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSchema, getAllSchemaNames, getAllCategories, getSchemasByCategory } from '@/lib/schemas';
import PropertyTable from '@/components/PropertyTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SchemaSidebar } from '@/components/SchemaSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Disable static generation to enable hot reload of JSON files
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { name: string };
}

export function generateStaticParams() {
  return getAllSchemaNames().map((name) => ({
    name,
  }));
}

export default function SchemaDetailPage({ params }: PageProps) {
  const schema = getSchema(params.name);

  if (!schema) {
    notFound();
  }

  // Get all categories and schemas for sidebar
  const allCategories = getAllCategories();
  const schemasByCategory: Record<string, any[]> = {};
  allCategories.forEach(category => {
    schemasByCategory[category.name] = getSchemasByCategory(category.name);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">
                  {schema.name}
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Left Sidebar */}
        <SchemaSidebar
          categories={allCategories}
          schemasByCategory={schemasByCategory}
        />

        {/* Schema Details */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{schema.description}</p>
          <div className="flex gap-4 flex-wrap">
            {schema.extends && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Extends: {schema.extends}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {schema.properties.length + (schema.inheritedProperties?.length || 0)} properties
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {schema['@type']}
            </span>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h2>
            {schema.extends && (
              <p className="text-sm text-muted-foreground mt-2">
                Includes inherited properties from {schema.extends}
              </p>
            )}
          </div>
          <PropertyTable properties={schema.properties} />
        </div>

        {/* Example Section */}
        {schema.examples && schema.examples.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Examples</h2>
            </div>
            <div className="p-8">
              {schema.examples.map((example, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Example {index + 1}
                  </h3>
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(example, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
