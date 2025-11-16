import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  request: Request,
  { params }: { params: { domain: string; entity: string } }
) {
  try {
    const { domain, entity } = params;
    const dataPath = path.join(process.cwd(), "data");
    const domainsFile = path.join(dataPath, "domains.json");
    const entityFilePath = path.join(
      dataPath,
      domain,
      "schemas",
      `${entity}.json`
    );

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

    // Vérifier que le fichier entité existe
    if (!fs.existsSync(entityFilePath)) {
      // Lister les entités disponibles dans ce domaine
      const domainSchemasPath = path.join(dataPath, domain, "schemas");
      const availableEntities = fs.existsSync(domainSchemasPath)
        ? fs
            .readdirSync(domainSchemasPath)
            .filter((file) => file.endsWith(".json"))
            .map((file) => file.replace(".json", ""))
        : [];

      return NextResponse.json(
        {
          success: false,
          error: `Entity '${entity}' not found in domain '${domain}'`,
          availableEntities,
        },
        { status: 404 }
      );
    }

    // Lire et retourner l'entité
    const entityData = JSON.parse(fs.readFileSync(entityFilePath, "utf-8"));

    return NextResponse.json({
      success: true,
      domain: domainInfo,
      entity: entityData,
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
