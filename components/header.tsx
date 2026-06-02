"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Link2 } from "lucide-react";
import type { Session } from "next-auth";

export function Header({ session }: { session: Session | null }) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Link2 size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-base tracking-tight">소부장 링크</span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <img
                src={session.user.image ?? ""}
                alt=""
                className="w-7 h-7 rounded-full ring-2 ring-border"
              />
              <span className="text-sm text-muted-foreground hidden sm:block">
                {session.user.name}
              </span>
              {(session.user as { isAdmin?: boolean }).isAdmin && (
                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-full font-medium">
                  관리자
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut()}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
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
              className="h-8 gap-1.5 border-primary text-primary hover:bg-primary/5 hover:text-primary"
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
