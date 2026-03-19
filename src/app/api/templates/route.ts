import { NextResponse } from "next/server";

import { fetchTemplateSeeds } from "@/features/templates/lib/template-seeds.server";

export async function GET() {
  try {
    const seeds = await fetchTemplateSeeds();
    return NextResponse.json(seeds);
  } catch (error) {
    console.error("BigQuery query failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch template data" },
      { status: 500 },
    );
  }
}
