"use client";
import { useState } from "react";
import { ChevronRight, Plus, Pencil, Trash2, ExternalLink, FolderPlus, Link2, GripVertical } from "lucide-react";
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
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  async function reorderFolders(fromId: string, toId: string) {
    const ids = tree.map(f => f.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, fromId);
    await Promise.all(
      newIds.map((id, idx) =>
        fetch("/api/folders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, order: (idx + 1) * 10 }),
        })
      )
    );
    onRefresh();
  }

  return (
    <div className="space-y-2">
      {tree.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          isAdmin={isAdmin}
          onRefresh={onRefresh}
          isDragging={draggingFolderId === folder.id}
          isDragTarget={dragOverFolderId === folder.id && draggingFolderId !== folder.id}
          onDragStart={isAdmin ? () => setDraggingFolderId(folder.id) : undefined}
          onDragOver={isAdmin ? (e) => {
            e.preventDefault();
            if (draggingFolderId !== folder.id) setDragOverFolderId(folder.id);
          } : undefined}
          onDragLeave={isAdmin ? (e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverFolderId(null);
          } : undefined}
          onDrop={isAdmin ? (e) => {
            e.preventDefault();
            if (draggingFolderId && draggingFolderId !== folder.id) {
              reorderFolders(draggingFolderId, folder.id);
            }
            setDraggingFolderId(null);
            setDragOverFolderId(null);
          } : undefined}
          onDragEnd={isAdmin ? () => {
            setDraggingFolderId(null);
            setDragOverFolderId(null);
          } : undefined}
        />
      ))}
      {isAdmin && <AddRootFolder onRefresh={onRefresh} />}
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

interface FolderNodeProps {
  folder: FolderWithChildren;
  depth: number;
  isAdmin: boolean;
  onRefresh: () => void;
  isDragging?: boolean;
  isDragTarget?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}

function FolderNode({ folder, depth, isAdmin, onRefresh, isDragging, isDragTarget, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }: FolderNodeProps) {
  const [expanded, setExpanded] = useState(folder.isExpanded);
  const [editFolder, setEditFolder] = useState(false);
  const [addSubFolder, setAddSubFolder] = useState(false);
  const [addLink, setAddLink] = useState(false);

  const [draggingLinkId, setDraggingLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const badge = TYPE_BADGE[folder.type] ?? TYPE_BADGE.shared;
  const hasContent = folder.children.length > 0 || folder.links.length > 0;

  async function reorderLinks(fromId: string, toId: string) {
    const ids = folder.links.map(l => l.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, fromId);
    await Promise.all(
      newIds.map((id, idx) =>
        fetch("/api/links", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, order: (idx + 1) * 10 }),
        })
      )
    );
    onRefresh();
  }

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
      <div
        draggable={!!onDragStart}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart?.();
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => { e.stopPropagation(); onDragOver?.(e); }}
        onDragLeave={(e) => { e.stopPropagation(); onDragLeave?.(e); }}
        onDrop={(e) => { e.stopPropagation(); onDrop?.(e); }}
        onDragEnd={(e) => { e.stopPropagation(); onDragEnd?.(); }}
        className={`bg-card rounded-xl shadow-sm overflow-hidden border transition-all duration-150 ${
          isDragging
            ? "opacity-40 border-border/60"
            : isDragTarget
            ? "border-primary ring-2 ring-primary/20 shadow-md border-border/60"
            : "border-border/60"
        }`}
      >
        {/* Header row with left accent stripe */}
        <div className="flex">
          <div
            className="w-1 flex-shrink-0"
            style={{ backgroundColor: folder.color ?? "#1967D2" }}
          />
          <div
            className="group flex items-center gap-2 py-2.5 px-3 flex-1 min-w-0 hover:bg-accent/50 transition-colors select-none"
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: onDragStart ? "grab" : "pointer" }}
          >
            {isAdmin && depth === 0 && (
              <GripVertical size={13} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 transition-colors -ml-1" />
            )}
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
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setAddLink(true)} title="링크 추가">
                  <Link2 size={12} />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setAddSubFolder(true)} title="하위 폴더 추가">
                  <FolderPlus size={12} />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditFolder(true)} title="편집">
                  <Pencil size={12} />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDeleteFolder} title="삭제">
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
              <LinkItem
                key={link.id}
                link={link}
                isAdmin={isAdmin}
                onSave={handleSaveLink}
                onRefresh={onRefresh}
                isDragging={draggingLinkId === link.id}
                isDragTarget={dragOverLinkId === link.id && draggingLinkId !== link.id}
                onDragStart={isAdmin ? (e) => {
                  e.stopPropagation();
                  setDraggingLinkId(link.id);
                  e.dataTransfer.effectAllowed = "move";
                } : undefined}
                onDragOver={isAdmin ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggingLinkId !== link.id) setDragOverLinkId(link.id);
                } : undefined}
                onDragLeave={isAdmin ? () => setDragOverLinkId(null) : undefined}
                onDrop={isAdmin ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggingLinkId && draggingLinkId !== link.id) {
                    reorderLinks(draggingLinkId, link.id);
                  }
                  setDraggingLinkId(null);
                  setDragOverLinkId(null);
                } : undefined}
                onDragEnd={isAdmin ? () => {
                  setDraggingLinkId(null);
                  setDragOverLinkId(null);
                } : undefined}
              />
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

      <FolderDialog open={editFolder} onClose={() => setEditFolder(false)} onSave={handleSaveFolder} initial={folder} />
      <FolderDialog open={addSubFolder} onClose={() => setAddSubFolder(false)} onSave={handleSaveFolder} parentId={folder.id} />
      <LinkDialog open={addLink} onClose={() => setAddLink(false)} onSave={handleSaveLink} folderId={folder.id} />
    </div>
  );
}

interface LinkItemProps {
  link: Link;
  isAdmin: boolean;
  onSave: (data: Partial<Link>) => void;
  onRefresh: () => void;
  isDragging?: boolean;
  isDragTarget?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}

function LinkItem({ link, isAdmin, onSave, onRefresh, isDragging, isDragTarget, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }: LinkItemProps) {
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
      <div
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={`group flex items-center gap-3 px-4 py-2.5 transition-colors border-b border-border/30 last:border-b-0 ${
          isDragging
            ? "opacity-40"
            : isDragTarget
            ? "border-t-2 border-t-primary bg-secondary/30"
            : "hover:bg-accent/60"
        }`}
      >
        {isAdmin && onDragStart && (
          <GripVertical size={12} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 cursor-grab transition-colors -ml-1" />
        )}
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
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground truncate group-hover/link:text-primary transition-colors">
              {link.title}
            </span>
            <ExternalLink size={10} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {link.description && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-relaxed">
              {link.description}
            </p>
          )}
        </a>
        {isAdmin && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)}>
              <Pencil size={11} />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 size={11} />
            </Button>
          </div>
        )}
      </div>
      <LinkDialog open={editing} onClose={() => setEditing(false)} onSave={onSave} initial={link} />
    </>
  );
}
