import { NextResponse } from 'next/server';
import validator from '@/lib/rocketschema-validator.json';

/**
 * GET /schemas/entity-schema.json
 * Returns the RocketSchema entity validator JSON Schema
 */
export async function GET() {
  return NextResponse.json(validator, {
    headers: {
      'Content-Type': 'application/schema+json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
