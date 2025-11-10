import { NextResponse } from 'next/server';
import { getSchema } from '@/lib/schemas';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const schema = getSchema(params.name);

  if (!schema) {
    return NextResponse.json(
      { error: 'Schema not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(schema);
}
