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
}

// Helper function to check if a type is a schema reference
function isSchemaType(type: string): boolean {
  const primitiveTypes = ['string', 'number', 'boolean', 'date'];
  return !primitiveTypes.includes(type.toLowerCase());
}

// Helper function to render type with links
function renderType(type: string | string[]) {
  const allSchemas = getAllSchemaNames();

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
              href={`/schemas/${cleanType}`}
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
        href={`/schemas/${cleanType}`}
        className="hover:underline text-primary font-semibold"
      >
        {type}
      </Link>
    );
  }

  return <span>{type}</span>;
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Property</TableHead>
          <TableHead className="w-[250px]">Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[120px]">Required</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.name}>
            <TableCell className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400">
              {property.name}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {renderType(property.type)}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="text-sm">{property.description}</p>
                {property.example && (
                  <p className="text-xs text-muted-foreground">
                    Example:{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
