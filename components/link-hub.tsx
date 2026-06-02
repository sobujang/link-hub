"use client";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { LinkTree } from "./link-tree";
import { buildTree } from "@/lib/types";
import type { Folder, Link } from "@/lib/db/schema";
import type { FolderWithChildren } from "@/lib/types";

function filterTree(tree: FolderWithChildren[], q: string): FolderWithChildren[] {
  const lower = q.toLowerCase();
  return tree.flatMap(folder => {
    const folderMatch = folder.name.toLowerCase().includes(lower);
    const matchLinks = folder.links.filter(l =>
      l.title.toLowerCase().includes(lower) ||
      (l.description?.toLowerCase().includes(lower) ?? false)
    );
    const matchChildren = filterTree(folder.children, q);

    if (folderMatch) return [{ ...folder, children: matchChildren }];
    if (matchLinks.length > 0 || matchChildren.length > 0) {
      return [{ ...folder, links: matchLinks, children: matchChildren }];
    }
    return [];
  });
}

interface Props {
  initialFolders: Folder[];
  initialLinks: Link[];
  isAdmin: boolean;
}

export function LinkHub({ initialFolders, initialLinks, isAdmin }: Props) {
  const [folders, setFolders] = useState(initialFolders);
  const [links, setLinks] = useState(initialLinks);
  const [query, setQuery] = useState("");

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
  const trimmed = query.trim();
  const displayTree = trimmed ? filterTree(tree, trimmed) : tree;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="폴더, 링크 검색..."
          className="w-full h-9 pl-9 pr-8 rounded-xl border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {trimmed && displayTree.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[13px] text-muted-foreground">
            &ldquo;{trimmed}&rdquo;에 대한 결과가 없습니다.
          </p>
        </div>
      )}

      {!trimmed && tree.length === 0 && !isAdmin && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
            <span className="text-3xl">🔗</span>
          </div>
          <p className="text-[15px] font-semibold text-foreground mb-1">링크가 없습니다</p>
          <p className="text-[13px] text-muted-foreground">아직 등록된 링크가 없습니다.</p>
        </div>
      )}

      {/* DnD는 검색 중에 비활성화 */}
      <LinkTree tree={displayTree} isAdmin={isAdmin && !trimmed} onRefresh={refresh} />
    </div>
  );
}
