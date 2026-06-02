"use client";
import { useState } from "react";
import { ChevronRight, Plus, Pencil, Trash2, ExternalLink, FolderPlus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkDialog } from "./link-dialog";
import { FolderDialog } from "./folder-dialog";
import type { FolderWithChildren } from "@/lib/types";
import type { Folder, Link } from "@/lib/db/schema";
import { toast } from "sonner";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  work: { label: "업무", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0" },
  personal: { label: "개인", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0" },
  shared: { label: "공용", className: "bg-secondary text-secondary-foreground border-0" },
};

interface Props {
  tree: FolderWithChildren[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export function LinkTree({ tree, isAdmin, onRefresh }: Props) {
  return (
    <div className="space-y-2">
      {tree.map((folder) => (
        <FolderNode key={folder.id} folder={folder} depth={0} isAdmin={isAdmin} onRefresh={onRefresh} />
      ))}
      {isAdmin && (
        <AddRootFolder onRefresh={onRefresh} />
      )}
    </div>
  );
}

function AddRootFolder({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);

  async function handleSave(data: Partial<Folder>) {
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, order: 999 }),
    });
    toast.success("폴더가 추가되었습니다");
    onRefresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary/70 hover:border-primary/60 hover:text-primary hover:bg-secondary/50 transition-all text-[13px] font-medium"
      >
        <FolderPlus size={15} />
        폴더 추가
      </button>
      <FolderDialog open={open} onClose={() => setOpen(false)} onSave={handleSave} />
    </>
  );
}

function FolderNode({ folder, depth, isAdmin, onRefresh }: {
  folder: FolderWithChildren;
  depth: number;
  isAdmin: boolean;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(folder.isExpanded);
  const [editFolder, setEditFolder] = useState(false);
  const [addSubFolder, setAddSubFolder] = useState(false);
  const [addLink, setAddLink] = useState(false);

  const badge = TYPE_BADGE[folder.type] ?? TYPE_BADGE.shared;
  const hasContent = folder.children.length > 0 || folder.links.length > 0;

  async function handleDeleteFolder() {
    if (!confirm(`"${folder.name}" 폴더를 삭제할까요? 안의 링크도 모두 삭제됩니다.`)) return;
    await fetch("/api/folders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: folder.id }),
    });
    toast.success("폴더가 삭제되었습니다");
    onRefresh();
  }

  async function handleSaveFolder(data: Partial<Folder>) {
    if (data.id) {
      await fetch("/api/folders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("폴더가 수정되었습니다");
    } else {
      await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, order: 999 }),
      });
      toast.success("하위 폴더가 추가되었습니다");
    }
    onRefresh();
  }

  async function handleSaveLink(data: Partial<Link>) {
    if (data.id) {
      await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, order: 999 }),
      });
      toast.success("링크가 추가되었습니다");
    }
    onRefresh();
  }

  return (
    <div className={depth > 0 ? "ml-4 mt-1.5" : ""}>
      <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border/60">
        {/* Header row with left accent stripe */}
        <div className="flex">
          <div
            className="w-1 flex-shrink-0"
            style={{ backgroundColor: folder.color ?? "#1967D2" }}
          />
          <div
            className="group flex items-center gap-2 py-2.5 px-3 flex-1 min-w-0 hover:bg-accent/50 transition-colors cursor-pointer select-none"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight
              size={15}
              className={`text-muted-foreground flex-shrink-0 transition-transform duration-200
                ${expanded ? "rotate-90" : ""}
                ${!hasContent ? "opacity-0 pointer-events-none" : ""}`}
            />
            <span className="text-base flex-shrink-0 leading-none">{folder.icon}</span>
            <span className="font-semibold text-[13px] truncate flex-1 text-foreground">
              {folder.name}
            </span>
            <Badge
              className={`text-[10px] px-2 py-0 h-[18px] rounded-full font-medium flex-shrink-0 ${badge.className}`}
              variant="secondary"
            >
              {badge.label}
            </Badge>

            {isAdmin && (
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setAddLink(true)}
                  title="링크 추가"
                >
                  <Link2 size={12} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setAddSubFolder(true)}
                  title="하위 폴더 추가"
                >
                  <FolderPlus size={12} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditFolder(true)}
                  title="편집"
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={handleDeleteFolder}
                  title="삭제"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="bg-muted/40 border-t border-border/40 animate-in fade-in-0 slide-in-from-top-1 duration-150">
            {folder.links.map((link) => (
              <LinkItem key={link.id} link={link} isAdmin={isAdmin} onSave={handleSaveLink} onRefresh={onRefresh} />
            ))}
            {folder.children.map((child) => (
              <div key={child.id} className="px-3 py-1.5">
                <FolderNode folder={child} depth={depth + 1} isAdmin={isAdmin} onRefresh={onRefresh} />
              </div>
            ))}
            {isAdmin && (
              <button
                onClick={() => setAddLink(true)}
                className="w-full flex items-center gap-2 px-10 py-2.5 text-[12px] text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              >
                <Plus size={11} />
                링크 추가
              </button>
            )}
          </div>
        )}
      </div>

      <FolderDialog
        open={editFolder}
        onClose={() => setEditFolder(false)}
        onSave={handleSaveFolder}
        initial={folder}
      />
      <FolderDialog
        open={addSubFolder}
        onClose={() => setAddSubFolder(false)}
        onSave={handleSaveFolder}
        parentId={folder.id}
      />
      <LinkDialog
        open={addLink}
        onClose={() => setAddLink(false)}
        onSave={handleSaveLink}
        folderId={folder.id}
      />
    </div>
  );
}

function LinkItem({ link, isAdmin, onSave, onRefresh }: {
  link: Link;
  isAdmin: boolean;
  onSave: (data: Partial<Link>) => void;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const favicon = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`;

  async function handleDelete() {
    if (!confirm(`"${link.title}" 링크를 삭제할까요?`)) return;
    await fetch("/api/links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: link.id }),
    });
    toast.success("링크가 삭제되었습니다");
    onRefresh();
  }

  return (
    <>
      <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-accent/60 transition-colors border-b border-border/30 last:border-b-0">
        <img
          src={favicon}
          alt=""
          className="w-4 h-4 flex-shrink-0 rounded-sm opacity-80"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 group/link"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground truncate group-hover/link:text-primary transition-colors">
              {link.title}
            </span>
            <ExternalLink
              size={10}
              className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          {link.description && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-relaxed">
              {link.description}
            </p>
          )}
        </a>
        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(true)}
            >
              <Pencil size={11} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 size={11} />
            </Button>
          </div>
        )}
      </div>
      <LinkDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSave={onSave}
        initial={link}
      />
    </>
  );
}
