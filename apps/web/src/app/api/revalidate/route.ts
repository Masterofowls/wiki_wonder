import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const slug = searchParams.get("slug");

  revalidateTag("wiki-pages");
  revalidatePath("/");
  revalidatePath("/wiki");

  if (slug) {
    revalidatePath(`/wiki/${slug}`);
  }

  return NextResponse.json({
    revalidated: true,
    slug,
    timestamp: Date.now(),
  });
}
