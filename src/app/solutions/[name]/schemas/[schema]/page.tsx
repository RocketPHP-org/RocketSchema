import { notFound } from 'next/navigation';
import { getSchema } from '@/lib/schemas';
import PropertyTable from '@/components/PropertyTable';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SchemaPageProps {
  params: {
    name: string;
    schema: string;
  };
}

export default function SchemaPage({ params }: SchemaPageProps) {
  const schema = getSchema(params.schema);

  if (!schema) {
    notFound();
  }

  // The active schema highlighting is handled by passing params.schema to the layout
  // which then passes it to the sidebar

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12">
      {/* Title Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {schema.name}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{schema.description}</p>
        <div className="flex gap-4 flex-wrap">
          {schema.extends && (
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              Extends: {schema.extends}
            </Badge>
          )}
          <Badge variant="secondary">
            {schema.properties.length + (schema.inheritedProperties?.length || 0)} properties
          </Badge>
          <Badge variant="outline">
            {schema['@type']}
          </Badge>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Properties</h2>
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
            <h2 className="text-2xl font-bold">Examples</h2>
          </div>
          <div className="p-8">
            {schema.examples.map((example, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Example {index + 1}
                </h3>
                <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{JSON.stringify(example, null, 2)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
