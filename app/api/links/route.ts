import { auth } from "@/auth";
import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as { isAdmin?: boolean })?.isAdmin === true;
}

export async function GET() {
  const all = await db.select().from(links).orderBy(links.order);
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [link] = await db.insert(links).values(body).returning();
  return NextResponse.json(link);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  const [link] = await db.update(links).set(data).where(eq(links.id, id)).returning();
  return NextResponse.json(link);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.delete(links).where(eq(links.id, id));
  return NextResponse.json({ ok: true });
}
