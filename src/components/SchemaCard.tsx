'use client';

import { SchemaDefinition } from '@/types/schema';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface SchemaCardProps {
  schema: SchemaDefinition;
}

export default function SchemaCard({ schema }: SchemaCardProps) {
  const t = useTranslations('schema');
  const locale = useLocale();

  return (
    <Link href={`/${locale}/schemas/${schema.name}`} className="block transition-transform hover:scale-105">
      <Card className="h-full hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl">{schema.name}</CardTitle>
          <CardDescription className="line-clamp-2">{schema.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between">
          <Badge variant="secondary">
            {t('propertiesCount', { count: schema.properties.length })}
          </Badge>
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            {t('viewDetails')}
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
