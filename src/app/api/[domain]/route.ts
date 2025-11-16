import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  request: Request,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;
    const dataPath = path.join(process.cwd(), "data");
    const domainsFile = path.join(dataPath, "domains.json");
    const domainSchemasPath = path.join(dataPath, domain, "schemas");

    // Vérifier que le domaine existe
    const domainsData = JSON.parse(fs.readFileSync(domainsFile, "utf-8"));
    const domainInfo = domainsData.find((d: any) => d.name === domain);

    if (!domainInfo) {
      return NextResponse.json(
        {
          success: false,
          error: `Domain '${domain}' not found`,
          availableDomains: domainsData.map((d: any) => d.name),
        },
        { status: 404 }
      );
    }

    // Vérifier que le dossier schemas existe
    if (!fs.existsSync(domainSchemasPath)) {
      return NextResponse.json(
        {
          success: true,
          domain: domainInfo,
          entities: [],
          count: 0,
        }
      );
    }

    // Lire tous les fichiers JSON dans le dossier schemas
    const files = fs
      .readdirSync(domainSchemasPath)
      .filter((file) => file.endsWith(".json"));

    const entities = files.map((file) => {
      const filePath = path.join(domainSchemasPath, file);
      const entityData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return {
        name: entityData.name,
        description: entityData.description || "",
        file: file,
        path: `/api/${domain}/${file.replace(".json", "")}`,
      };
    });

    return NextResponse.json({
      success: true,
      domain: domainInfo,
      entities,
      count: entities.length,
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
