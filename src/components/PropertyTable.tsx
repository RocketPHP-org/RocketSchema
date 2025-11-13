import { SchemaProperty } from '@/types/schema';
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
import { getAllSchemaNames } from '@/lib/schemas';

interface PropertyTableProps {
  properties: SchemaProperty[];
  solutionName?: string; // Optional: if provided, type links will be scoped to solution
}

// Helper function to check if a type is a schema reference
function isSchemaType(type: string): boolean {
  const primitiveTypes = ['string', 'number', 'boolean', 'date'];
  return !primitiveTypes.includes(type.toLowerCase());
}

// Helper function to render type with links
function renderType(type: string | string[], solutionName?: string) {
  const allSchemas = getAllSchemaNames();

  // Helper to generate schema link
  const getSchemaLink = (schemaName: string) => {
    return solutionName
      ? `/solutions/${solutionName}/schemas/${schemaName}`
      : `/schemas/${schemaName}`;
  };

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
              href={getSchemaLink(cleanType)}
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

  // Single type - check if it contains union (|) or array ([])
  const typeString = String(type);

  // Handle union types (e.g., "Person | Organization")
  if (typeString.includes(' | ')) {
    const unionTypes = typeString.split(' | ').map(t => t.trim());
    return unionTypes.map((t, index) => {
      const cleanType = t.replace(/[\[\]]/g, '');
      const isSchema = allSchemas.includes(cleanType);

      return (
        <span key={index}>
          {index > 0 && ' | '}
          {isSchema ? (
            <Link
              href={getSchemaLink(cleanType)}
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

  // Single type with possible array brackets
  const cleanType = typeString.replace(/[\[\]]/g, '');
  const isSchema = allSchemas.includes(cleanType);

  if (isSchema) {
    return (
      <Link
        href={getSchemaLink(cleanType)}
        className="hover:underline text-primary font-semibold"
      >
        {typeString}
      </Link>
    );
  }

  return <span>{typeString}</span>;
}

export default function PropertyTable({ properties, solutionName }: PropertyTableProps) {
  // Check if any property has a source (inheritance)
  const hasInheritance = properties.some(prop => prop.source);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Property</TableHead>
          <TableHead className="w-[250px]">Type</TableHead>
          <TableHead className="w-[100px]">Mode</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[120px]">Required</TableHead>
          {hasInheritance && <TableHead className="w-[150px]">Source</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={`${property.source || 'own'}-${property.name}`}>
            <TableCell className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400">
              {property.name}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {renderType(property.type, solutionName)}
            </TableCell>
            <TableCell>
              {property.mode && (
                <Badge
                  variant={
                    property.mode === 'computed' ? 'default' :
                    property.mode === 'enum' ? 'outline' :
                    'secondary'
                  }
                  className="font-mono text-xs"
                >
                  {property.mode}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="text-sm">{property.description}</p>
                {property.enum && (
                  <p className="text-xs text-muted-foreground">
                    Values:{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                      {property.enum.join(', ')}
                    </code>
                  </p>
                )}
                {property.example && (
                  <p className="text-xs text-muted-foreground">
                    Example:{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono break-all whitespace-pre-wrap max-w-full overflow-wrap-anywhere">
                      {JSON.stringify(property.example)}
                    </code>
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={property.required ? "destructive" : "secondary"}>
                {property.required ? 'Required' : 'Optional'}
              </Badge>
            </TableCell>
            {hasInheritance && (
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {property.source || 'Own'}
                </Badge>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
