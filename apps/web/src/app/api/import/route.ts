import { createDb, wikiPages } from "@wikiwonder/db";
import { importFromWikipedia } from "@wikiwonder/wiki-core/import";
import { importSourceSchema } from "@wikiwonder/wiki-core";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = importSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const imported = await importFromWikipedia(parsed.data.url);
    const db = createDb(url);

    const [existing] = await db.select().from(wikiPages).where(eq(wikiPages.slug, imported.slug)).limit(1);

    if (existing) {
      const [updated] = await db
        .update(wikiPages)
        .set({
          title: imported.title,
          summary: imported.summary,
          content: imported.content,
          sourceUrl: imported.sourceUrl,
          sourceType: imported.sourceType,
          updatedAt: new Date(),
        })
        .where(eq(wikiPages.id, existing.id))
        .returning();

      return NextResponse.json({ page: updated, updated: true });
    }

    const [created] = await db
      .insert(wikiPages)
      .values({
        slug: imported.slug,
        title: imported.title,
        summary: imported.summary,
        content: imported.content,
        sourceUrl: imported.sourceUrl,
        sourceType: imported.sourceType,
      })
      .returning();

    return NextResponse.json({ page: created, updated: false }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
