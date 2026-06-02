"use client";
import { useState, useCallback } from "react";
import { LinkTree } from "./link-tree";
import { buildTree } from "@/lib/types";
import type { Folder, Link } from "@/lib/db/schema";

interface Props {
  initialFolders: Folder[];
  initialLinks: Link[];
  isAdmin: boolean;
}

export function LinkHub({ initialFolders, initialLinks, isAdmin }: Props) {
  const [folders, setFolders] = useState(initialFolders);
  const [links, setLinks] = useState(initialLinks);

  const refresh = useCallback(async () => {
    const [fRes, lRes] = await Promise.all([
      fetch("/api/folders"),
      fetch("/api/links"),
    ]);
    const [newFolders, newLinks] = await Promise.all([fRes.json(), lRes.json()]);
    setFolders(newFolders);
    setLinks(newLinks);
  }, []);

  const tree = buildTree(folders, links);

  return (
    <div className="space-y-2">
      {tree.length === 0 && !isAdmin && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
            <span className="text-3xl">🔗</span>
          </div>
          <p className="text-[15px] font-semibold text-foreground mb-1">링크가 없습니다</p>
          <p className="text-[13px] text-muted-foreground">아직 등록된 링크가 없습니다.</p>
        </div>
      )}
      <LinkTree tree={tree} isAdmin={isAdmin} onRefresh={refresh} />
    </div>
  );
}
