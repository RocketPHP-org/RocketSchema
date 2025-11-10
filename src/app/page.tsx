import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { getAllSchemas, getAllCategories, getSchemasByCategory } from '@/lib/schemas';
import { Github } from 'lucide-react';
import { SchemaGrid } from '@/components/SchemaGrid';

// Disable static generation to enable hot reload of JSON files
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  const schemas = getAllSchemas();
  const categories = getAllCategories();

  // Prepare schemas by category for the client component
  const schemasByCategory: Record<string, any[]> = {};
  categories.forEach(category => {
    schemasByCategory[category.name] = getSchemasByCategory(category.name);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                🚀 RocketSchema
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                A schema standard for business applications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="https://github.com/RocketPHP-org/RocketSchema"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Standardized Business Schemas
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
              A universal standard for business application data models. Stop reinventing the wheel - capitalize on proven, reusable schemas for CRM, ERP, e-commerce, and any business solution.
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-2">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">Domains</div>
            </div>
            <div className="w-px bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {schemas.length}
              </div>
              <div className="text-sm text-muted-foreground">Schemas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Schemas Grid with Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SchemaGrid categories={categories} schemasByCategory={schemasByCategory} />
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground text-sm">
            MIT License - Free to use for all commercial and open source projects
          </p>
        </div>
      </footer>
    </div>
  );
}
