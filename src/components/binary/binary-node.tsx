"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { BinaryNode, BinarySide, Database } from "@/types";
import { getActivePackage, isUserActive } from "@/lib/packages";
import { cn } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";

export type TreeNodeProps = {
  node: BinaryNode;
  db: Database;
  depth: number;
  side?: BinarySide;
  currentUserId?: string;
  isCollapsed: (id: string, depth: number) => boolean;
  onToggle: (id: string, depth: number) => void;
  onOpen: (id: string) => void;
};

function EmptySlot({ side }: { side: BinarySide }) {
  return (
    <li>
      <div className="flex h-[132px] w-[148px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line-2 text-dim">
        <span className="text-xs font-medium capitalize">{side}</span>
        <span className="text-[11px]">Open position</span>
      </div>
    </li>
  );
}

export function TreeNode({ node, db, depth, side, currentUserId, isCollapsed, onToggle, onOpen }: TreeNodeProps) {
  const { user } = node;
  const pkg = getActivePackage(db, user.id);
  const active = isUserActive(db, user.id);
  const hasChildren = !!(node.left || node.right);
  const collapsed = hasChildren && isCollapsed(user.id, depth);
  const isYou = user.id === currentUserId;

  return (
    <li>
      <div
        className={cn(
          "surface-tile relative flex w-[148px] flex-col items-center gap-1.5 px-3 pt-4 pb-3 text-center transition-colors duration-200",
          isYou && "border-primary/50 shadow-[0_0_28px_-12px_rgba(57,255,90,0.6)]",
          !isYou && "hover:border-primary/35",
        )}
      >
        {side && (
          <span className="absolute top-2 left-2.5 rounded-full border border-line-2 bg-bg-2 px-1.5 text-[10px] font-semibold text-secondary uppercase">
            {side === "left" ? "L" : "R"}
          </span>
        )}
        <button
          onClick={() => onOpen(user.id)}
          aria-label={`Open ${user.name}'s tree`}
          className="flex flex-col items-center gap-1.5 rounded-xl"
        >
          <Avatar name={user.name} size={42} className={active ? "border-primary/50" : ""} />
          <span className="max-w-[120px] truncate text-[13px] font-semibold text-fg">{isYou ? "You" : user.name}</span>
        </button>
        <span className="num text-xs font-semibold text-soft">{pkg ? pkg.code : "No package"}</span>
        <span className={cn("flex items-center gap-1.5 text-[11px]", active ? "text-primary" : "text-dim")}>
          <span className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-dim")} aria-hidden />
          {active ? "Active" : "Inactive"}
        </span>
        <span className="text-[11px] text-secondary">
          Directs <span className="num font-semibold text-fg">{user.directReferralCount}</span>
        </span>
        {hasChildren && (
          <button
            onClick={() => onToggle(user.id, depth)}
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? "Expand" : "Collapse"} ${user.name}'s branch`}
            className="absolute -bottom-3 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full border border-line-2 bg-bg-2 text-secondary transition-colors hover:border-primary/60 hover:text-primary"
          >
            {collapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
          </button>
        )}
      </div>

      {hasChildren && !collapsed && (
        <ul>
          {node.left ? (
            <TreeNode
              node={node.left}
              db={db}
              depth={depth + 1}
              side="left"
              currentUserId={currentUserId}
              isCollapsed={isCollapsed}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          ) : (
            <EmptySlot side="left" />
          )}
          {node.right ? (
            <TreeNode
              node={node.right}
              db={db}
              depth={depth + 1}
              side="right"
              currentUserId={currentUserId}
              isCollapsed={isCollapsed}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          ) : (
            <EmptySlot side="right" />
          )}
        </ul>
      )}
    </li>
  );
}
