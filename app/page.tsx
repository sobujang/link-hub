import { auth } from "@/auth";
import { db } from "@/lib/db";
import { folders, links } from "@/lib/db/schema";
import { Header } from "@/components/header";
import { LinkHub } from "@/components/link-hub";
import { Toaster } from "@/components/ui/sonner";

export default async function Home() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin === true;

  const [allFolders, allLinks] = await Promise.all([
    db.select().from(folders).orderBy(folders.order),
    db.select().from(links).orderBy(links.order),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header session={session} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">팀 링크 허브</h1>
          <p className="text-sm text-muted-foreground mt-0.5">자주 사용하는 링크를 한 곳에서 관리하세요</p>
        </div>
        <LinkHub
          initialFolders={allFolders}
          initialLinks={allLinks}
          isAdmin={isAdmin}
        />
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
