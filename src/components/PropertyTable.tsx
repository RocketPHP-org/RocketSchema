'use client';

import { SchemaProperty } from '@/types/schema';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface PropertyTableProps {
  properties: SchemaProperty[];
  allSchemaNames: string[];
}

// Helper function to check if a type is a schema reference
function isSchemaType(type: string): boolean {
  const primitiveTypes = ['string', 'number', 'boolean', 'date'];
  return !primitiveTypes.includes(type.toLowerCase());
}

// Helper function to render type with links
function renderType(type: string | string[], allSchemas: string[], locale: string) {

  if (Array.isArray(type)) {
    return type.map((t, index) => {
      // Remove array brackets if present (e.g., "[Person]" -> "Person")
      const cleanType = t.replace(/[\[\]]/g, '');
      const isSchema = allSchemas.includes(cleanType);

      return (
        <span key={index}>
          {index > 0 && ' | '}
          {isSchema ? (
            <Link
              href={`/${locale}/schemas/${cleanType}`}
              className="hover:underline text-primary font-semibold"
            >
              {t}
            </Link>
          ) : (
            <span>{t}</span>
          )}
        </span>
      );
    });
  }

  // Single type
  const cleanType = type.replace(/[\[\]]/g, '');
  const isSchema = allSchemas.includes(cleanType);

  if (isSchema) {
    return (
      <Link
        href={`/${locale}/schemas/${cleanType}`}
        className="hover:underline text-primary font-semibold"
      >
        {type}
      </Link>
    );
  }

  return <span>{type}</span>;
}

export default function PropertyTable({ properties, allSchemaNames }: PropertyTableProps) {
  const t = useTranslations('schema');
  const locale = useLocale();
  // Check if any property has a source (inheritance)
  const hasInheritance = properties.some(prop => prop.source);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">{t('property')}</TableHead>
          <TableHead className="w-[250px]">{t('type')}</TableHead>
          <TableHead>{t('description')}</TableHead>
          <TableHead className="w-[120px]">{t('required')}</TableHead>
          {hasInheritance && <TableHead className="w-[150px]">{t('source')}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={`${property.source || 'own'}-${property.name}`}>
            <TableCell className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400">
              {property.name}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {renderType(property.type, allSchemaNames, locale)}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="text-sm">{property.description}</p>
                {property.example && (
                  <p className="text-xs text-muted-foreground">
                    {t('exampleLabel')}{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                      {JSON.stringify(property.example)}
                    </code>
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={property.required ? "destructive" : "secondary"}>
                {property.required ? t('required') : t('optional')}
              </Badge>
            </TableCell>
            {hasInheritance && (
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {property.source || t('own')}
                </Badge>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
