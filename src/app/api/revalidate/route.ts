import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { WP_TAG } from "@/lib/wordpress";

// Called by WordPress (see wordpress/headless-revalidate.php) whenever a post is published,
// updated or deleted, so the change is live within seconds instead of waiting for the hourly refresh.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? new URL(req.url).searchParams.get("secret");
  const ok = secret && given && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  revalidateTag(WP_TAG, "max");
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, slug: body.slug ?? null, at: new Date().toISOString() });
}
