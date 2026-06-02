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
  work: { label: "업무", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  personal: { label: "개인", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  shared: { label: "공용", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
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
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-indigo-400 hover:text-indigo-500 transition-all text-sm"
      >
        <FolderPlus size={16} />
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
    <div className={depth > 0 ? "ml-4 border-l border-border pl-3" : ""}>
      {/* Folder header */}
      <div className="group flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-accent transition-colors">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <ChevronRight
            size={16}
            className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""} ${!hasContent ? "opacity-0" : ""}`}
          />
          <span className="text-lg flex-shrink-0">{folder.icon}</span>
          <span className="font-semibold text-sm truncate">{folder.name}</span>
          <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${badge.className}`} variant="secondary">
            {badge.label}
          </Badge>
        </button>

        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setAddLink(true)}
              title="링크 추가"
            >
              <Link2 size={13} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setAddSubFolder(true)}
              title="하위 폴더 추가"
            >
              <FolderPlus size={13} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setEditFolder(true)}
              title="편집"
            >
              <Pencil size={13} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={handleDeleteFolder}
              title="삭제"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-1 space-y-1">
          {folder.links.map((link) => (
            <LinkItem key={link.id} link={link} isAdmin={isAdmin} onSave={handleSaveLink} onRefresh={onRefresh} />
          ))}
          {folder.children.map((child) => (
            <FolderNode key={child.id} folder={child} depth={depth + 1} isAdmin={isAdmin} onRefresh={onRefresh} />
          ))}
          {isAdmin && (
            <button
              onClick={() => setAddLink(true)}
              className="w-full flex items-center gap-2 px-8 py-2 text-xs text-muted-foreground hover:text-indigo-500 transition-colors"
            >
              <Plus size={12} />
              링크 추가
            </button>
          )}
        </div>
      )}

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
      <div className="group flex items-center gap-3 px-8 py-2 rounded-xl hover:bg-accent transition-colors">
        <img src={favicon} alt="" className="w-4 h-4 flex-shrink-0 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{link.title}</span>
            <ExternalLink size={11} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
          </div>
          {link.description && (
            <p className="text-xs text-muted-foreground truncate">{link.description}</p>
          )}
        </a>
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditing(true)}>
              <Pencil size={12} />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 size={12} />
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
