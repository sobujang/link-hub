import { auth } from "@/auth";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as { isAdmin?: boolean })?.isAdmin === true;
}

export async function GET() {
  const all = await db.select().from(folders).orderBy(folders.order);
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [folder] = await db.insert(folders).values(body).returning();
  return NextResponse.json(folder);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  const [folder] = await db.update(folders).set(data).where(eq(folders.id, id)).returning();
  return NextResponse.json(folder);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.delete(folders).where(eq(folders.id, id));
  return NextResponse.json({ ok: true });
}
