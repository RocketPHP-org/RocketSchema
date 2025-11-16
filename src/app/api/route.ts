import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data");
    const domainsFile = path.join(dataPath, "domains.json");

    // Lire le fichier domains.json
    const domainsData = JSON.parse(fs.readFileSync(domainsFile, "utf-8"));

    return NextResponse.json({
      success: true,
      count: domainsData.length,
      domains: domainsData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
