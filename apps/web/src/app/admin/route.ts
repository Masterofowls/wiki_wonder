import { NextResponse } from "next/server";

const STRAPI_ADMIN_URL =
  process.env.STRAPI_ADMIN_URL ??
  process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL ??
  (process.env.STRAPI_PUBLIC_URL ? `${process.env.STRAPI_PUBLIC_URL}/admin` : null);

export function GET() {
  if (!STRAPI_ADMIN_URL) {
    return NextResponse.json(
      {
        message: "Strapi admin URL is not configured.",
        hint: "Set STRAPI_ADMIN_URL on Vercel (e.g. https://your-cms.onrender.com/admin)",
      },
      { status: 503 },
    );
  }

  return NextResponse.redirect(STRAPI_ADMIN_URL);
}
