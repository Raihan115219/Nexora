"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ChevronsDownUp, ChevronsUpDown, Home, Search, ZoomIn, ZoomOut } from "lucide-react";
import type { BinaryNode, Database } from "@/types";
import { getBinaryCounts, getBinaryDownlineIds, getBinaryTree, getLeftVolume, getRightVolume } from "@/lib/binary";
import { countTeamMembers, getDirectReferrals, getUserById } from "@/lib/referrals";
import { getActivePackage } from "@/lib/packages";
import { formatUsd } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TreeNode } from "./binary-node";

const DEFAULT_OPEN_DEPTH = 3;

function collectIds(node: BinaryNode | undefined, out: string[] = []): string[] {
  if (!node) return out;
  if (node.left || node.right) out.push(node.user.id);
  collectIds(node.left, out);
  collectIds(node.right, out);
  return out;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface-tile px-4 py-3">
      <p className="text-[11px] tracking-wider text-dim uppercase">{label}</p>
      <p className="num mt-0.5 text-lg font-semibold text-fg">{value}</p>
    </div>
  );
}

/**
 * Data-driven binary tree explorer shared by /dashboard/binary-tree and
 * /admin/tree. `homeId` is the top of the tree; `restrictToDownline`
 * limits search to that member's own downline (member view).
 */
export function BinaryTreeView({
  db,
  homeId,
  restrictToDownline,
  showMemberPanel,
}: {
  db: Database;
  homeId: string;
  restrictToDownline?: boolean;
  /** Admin view: list the viewed member's direct referrals and team size. */
  showMemberPanel?: boolean;
}) {
  const [rootId, setRootId] = useState(homeId);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);

  const root = getUserById(db.users, rootId) ?? getUserById(db.users, homeId);
  const tree = useMemo(() => (root ? getBinaryTree(db.users, root.id) : undefined), [db.users, root]);

  const allowedIds = useMemo(() => {
    if (!restrictToDownline) return null;
    return new Set([homeId, ...getBinaryDownlineIds(db.users, homeId)]);
  }, [db.users, homeId, restrictToDownline]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return db.users
      .filter((u) => !allowedIds || allowedIds.has(u.id))
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.referralCode.toLowerCase().includes(q))
      .slice(0, 6);
  }, [db.users, query, allowedIds]);

  // Keep the root node centred in the scroll area when the tree changes.
  const viewedId = root?.id;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = Math.max((el.scrollWidth - el.clientWidth) / 2, 0);
  }, [viewedId, zoom, expanded, collapsed, db.users]);

  const isCollapsed = useCallback(
    (id: string, depth: number) => collapsed.has(id) || (depth >= DEFAULT_OPEN_DEPTH && !expanded.has(id)),
    [collapsed, expanded],
  );

  const onToggle = useCallback(
    (id: string, depth: number) => {
      const currentlyCollapsed = isCollapsed(id, depth);
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (currentlyCollapsed) next.delete(id);
        else next.add(id);
        return next;
      });
      setExpanded((prev) => {
        const next = new Set(prev);
        if (currentlyCollapsed) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [isCollapsed],
  );

  const open = useCallback(
    (id: string) => {
      if (allowedIds && !allowedIds.has(id)) return;
      setRootId(id);
      setQuery("");
      setCollapsed(new Set());
      setExpanded(new Set());
    },
    [allowedIds],
  );

  if (!root || !tree) {
    return (
      <Card>
        <EmptyState title="User not found" description="This member is no longer in the tree." />
      </Card>
    );
  }

  const counts = getBinaryCounts(db.users, root.id);
  const parent = getUserById(db.users, root.binaryParentId);
  const canGoUp = !!parent && root.id !== homeId && (!allowedIds || allowedIds.has(parent.id));
  const left = getUserById(db.users, root.leftChildId);
  const right = getUserById(db.users, root.rightChildId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <div className="field-pill">
            <Search className="size-4 text-dim" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member by name, email or code…"
              aria-label="Search member"
              
            />
          </div>
          {query.trim() && (
            <div className="surface-card absolute top-[calc(100%+8px)] z-30 w-full animate-slide-up border-line-2 bg-surface-2 p-1.5 shadow-2xl">
              {matches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-secondary">No members found</p>
              ) : (
                matches.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => open(u.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-3"
                  >
                    <Avatar name={u.name} size={30} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-fg">{u.name}</span>
                      <span className="block truncate text-xs text-dim">{u.email}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => open(homeId)} disabled={root.id === homeId}>
            <Home className="size-3.5" aria-hidden /> Home
          </Button>
          <Button size="sm" variant="secondary" onClick={() => parent && open(parent.id)} disabled={!canGoUp}>
            <ArrowUp className="size-3.5" aria-hidden /> Up
          </Button>
          <Button size="sm" variant="secondary" onClick={() => left && open(left.id)} disabled={!left}>
            Left branch
          </Button>
          <Button size="sm" variant="secondary" onClick={() => right && open(right.id)} disabled={!right}>
            Right branch
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCollapsed(new Set());
              setExpanded(new Set(collectIds(tree)));
            }}
          >
            <ChevronsUpDown className="size-3.5" aria-hidden /> Expand all
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setExpanded(new Set());
              setCollapsed(new Set(collectIds(tree).filter((id) => id !== root.id)));
            }}
          >
            <ChevronsDownUp className="size-3.5" aria-hidden /> Collapse
          </Button>
          <div className="ml-1 flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))}
              aria-label="Zoom out"
              className="grid size-8 place-items-center rounded-full border border-line-2 text-secondary hover:text-primary"
            >
              <ZoomOut className="size-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(1.3, +(z + 0.1).toFixed(1)))}
              aria-label="Zoom in"
              className="grid size-8 place-items-center rounded-full border border-line-2 text-secondary hover:text-primary"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <section aria-label="Branch statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Viewing" value={root.id === homeId && restrictToDownline ? "You" : root.name} />
        <Stat label="Left members" value={counts.left} />
        <Stat label="Right members" value={counts.right} />
        <Stat label="Left volume" value={formatUsd(getLeftVolume(db, root.id), { whole: true })} />
        <Stat label="Right volume" value={formatUsd(getRightVolume(db, root.id), { whole: true })} />
      </section>
      {!showMemberPanel && (
        <p className="text-xs text-secondary">
          Direct referrals: <span className="num text-fg">{root.directReferralCount}</span> · Sponsorship team:{" "}
          <span className="num text-fg">{countTeamMembers(db.users, root.id)}</span>
        </p>
      )}

      {showMemberPanel && (
        <Card>
          <h2 className="mb-1 text-base font-semibold">{root.name}</h2>
          <p className="mb-4 text-xs text-secondary">
            {root.email} · Code <span className="num text-fg">{root.referralCode}</span> · Direct referrals{" "}
            <span className="num text-fg">{root.directReferralCount}</span> · Total team{" "}
            <span className="num text-fg">{countTeamMembers(db.users, root.id)}</span>
          </p>
          {getDirectReferrals(db.users, root.id).length === 0 ? (
            <p className="text-sm text-secondary">No direct referrals.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {getDirectReferrals(db.users, root.id).map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => open(m.id)}
                    className="flex items-center gap-2 rounded-full border border-line-2 bg-surface-3/60 py-1 pr-3 pl-1 text-sm text-fg transition-colors hover:border-primary/50"
                  >
                    <Avatar name={m.name} size={26} />
                    {m.name}
                    <span className="num text-xs text-dim">{getActivePackage(db, m.id)?.code ?? "—"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Card padded={false} className="overflow-hidden">
        <div ref={scrollRef} className="overflow-auto p-6" tabIndex={0} aria-label="Binary tree — scroll to explore" style={{ maxHeight: "70vh" }}>
          <div className="bt-tree mx-auto w-max min-w-full" style={{ zoom }}>
            <ul>
              <TreeNode
                node={tree}
                db={db}
                depth={0}
                currentUserId={restrictToDownline ? homeId : undefined}
                isCollapsed={isCollapsed}
                onToggle={onToggle}
                onOpen={open}
              />
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
