import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { getAllSchemas, getAllCategories, getSchemasByCategory } from '@/lib/schemas';
import { Github } from 'lucide-react';
import { SchemaGrid } from '@/components/SchemaGrid';

// Disable static generation to enable hot reload of JSON files
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const t = await getTranslations('home');
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
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link
                href="https://github.com/RocketPHP-org/RocketSchema"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  {t('buttons.github')}
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
              {t('hero.title')}
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
              {t('hero.description')}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-2">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">{t('stats.domains')}</div>
            </div>
            <div className="w-px bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {schemas.length}
              </div>
              <div className="text-sm text-muted-foreground">{t('stats.schemas')}</div>
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
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-muted-foreground text-sm">
              {t('footer.license')}
            </p>
            <p className="text-center text-muted-foreground text-sm">
              {t('footer.madeIn')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
