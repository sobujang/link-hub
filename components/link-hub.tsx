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
      fetch("/api/folders", { cache: "no-store" }),
      fetch("/api/links", { cache: "no-store" }),
    ]);
    const [newFolders, newLinks] = await Promise.all([fRes.json(), lRes.json()]);
    setFolders(newFolders);
    setLinks(newLinks);
  }, []);

  const tree = buildTree(folders, links);

  return (
    <div className="space-y-2">
      {tree.length === 0 && !isAdmin && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-sm">아직 등록된 링크가 없습니다.</p>
        </div>
      )}
      <LinkTree tree={tree} isAdmin={isAdmin} onRefresh={refresh} />
    </div>
  );
}
