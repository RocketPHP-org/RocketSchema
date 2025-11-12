import { notFound } from 'next/navigation';
import { getAllSolutions, getAllCategories, getSchemasByCategory } from '@/lib/schemas';
import { SchemaGrid } from '@/components/SchemaGrid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SolutionPageProps {
  params: {
    name: string;
  };
}

export default function SolutionPage({ params }: SolutionPageProps) {
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <SchemaGrid
        categories={categories}
        schemasByCategory={schemasByCategory}
        solutions={[]}
        solutionName={params.name}
      />
    </div>
  );
}
