import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { getAllSolutions, getAllCategories, getSchemasByCategory } from '@/lib/schemas';
import { Github, ArrowLeft } from 'lucide-react';
import { SolutionLayoutClient } from '@/components/SolutionLayoutClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SolutionLayoutProps {
  children: React.ReactNode;
  params: {
    name: string;
  };
}

export default function SolutionLayout({ children, params }: SolutionLayoutProps) {
  const solutions = getAllSolutions();
  const solution = solutions.find(s => s.name === params.name);

  if (!solution) {
    notFound();
  }

  const allCategories = getAllCategories();
  const categories = allCategories.filter(cat => solution.domains.includes(cat.name));

  // Prepare schemas by category
  const schemasByCategory: Record<string, any[]> = {};
  categories.forEach(category => {
    schemasByCategory[category.name] = getSchemasByCategory(category.name);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-50 backdrop-blur">
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
                <Link href={`/solutions/${params.name}`} className="hover:opacity-80 transition-opacity">
                  <h1 className="text-xl font-bold">
                    {solution.label}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {solution.description}
                  </p>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="https://github.com/RocketPHP-org/RocketSchema"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <SolutionLayoutClient
        categories={categories}
        schemasByCategory={schemasByCategory}
        solutionName={params.name}
      >
        {children}
      </SolutionLayoutClient>
    </div>
  );
}
