"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { BinaryTreeView } from "@/components/binary/binary-tree-view";
import { useDb } from "@/store/hooks";

export default function AdminTreePage() {
  const db = useDb();

  // The company root is the earliest-joined admin account.
  const rootId = useMemo(
    () => db.users.filter((u) => u.role === "admin").sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0]?.id,
    [db.users],
  );

  if (!rootId) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Binary Tree"
        description="The full company tree — search any member, open their tree and inspect either leg. Same data as the member view."
      />
      <BinaryTreeView db={db} homeId={rootId} showMemberPanel />
    </>
  );
}
