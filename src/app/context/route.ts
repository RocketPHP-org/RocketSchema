import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), 'src/lib/rocketschema-validator.json');
    const rocketSchemaDefinition = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

    return NextResponse.json(rocketSchemaDefinition);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
