import { NextResponse } from 'next/server';
import { getAllSchemas } from '@/lib/schemas';

export async function GET() {
  const schemas = getAllSchemas();
  return NextResponse.json(schemas);
}
