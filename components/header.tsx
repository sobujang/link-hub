"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import type { Session } from "next-auth";

export function Header({ session }: { session: Session | null }) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔗</span>
          <span className="font-bold text-base">소부장 링크</span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <img
                src={session.user.image ?? ""}
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <span className="text-sm text-muted-foreground hidden sm:block">
                {session.user.name}
              </span>
              {(session.user as { isAdmin?: boolean }).isAdmin && (
                <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                  관리자
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut()}
                className="h-8 gap-1.5"
              >
                <LogOut size={14} />
                <span className="hidden sm:block">로그아웃</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => signIn("google")}
              className="h-8 gap-1.5"
            >
              <LogIn size={14} />
              Google 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
