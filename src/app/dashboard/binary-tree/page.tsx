"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { BinaryTreeView } from "@/components/binary/binary-tree-view";
import { useCurrentUser, useDb } from "@/store/hooks";

export default function BinaryTreePage() {
  const db = useDb();
  const user = useCurrentUser();
  if (!user) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Binary Tree"
        description="Your left and right legs, built from live placement data. Click a member to open their tree."
      />
      <BinaryTreeView db={db} homeId={user.id} restrictToDownline />
    </>
  );
}
