import type { Folder, Link } from "./db/schema";

export type FolderWithChildren = Folder & {
  children: FolderWithChildren[];
  links: Link[];
};

export function buildTree(folders: Folder[], links: Link[]): FolderWithChildren[] {
  const map = new Map<string, FolderWithChildren>();

  for (const folder of folders) {
    map.set(folder.id, { ...folder, children: [], links: [] });
  }

  for (const link of links) {
    if (link.folderId && map.has(link.folderId)) {
      map.get(link.folderId)!.links.push(link);
    }
  }

  const roots: FolderWithChildren[] = [];
  for (const folder of folders) {
    const node = map.get(folder.id)!;
    if (folder.parentId && map.has(folder.parentId)) {
      map.get(folder.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
