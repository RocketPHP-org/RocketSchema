import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { getAllSolutions } from '@/lib/schemas';
import { Github, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Disable static generation to enable hot reload of JSON files
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  const solutions = getAllSolutions();

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
                {solutions.length}
              </div>
              <div className="text-sm text-muted-foreground">Solutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">Choose Your Solution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution) => (
            <Link key={solution.name} href={`/solutions/${solution.name}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>{solution.label}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Includes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {solution.domains.slice(0, 4).map(domain => (
                          <Badge key={domain} variant="secondary" className="text-xs">
                            {domain}
                          </Badge>
                        ))}
                        {solution.domains.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{solution.domains.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {solution.domains.length} domains
                  </span>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
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
