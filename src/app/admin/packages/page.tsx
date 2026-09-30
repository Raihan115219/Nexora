"use client";

import { useMemo } from "react";
import { countPackageHolders, getPackages } from "@/lib/packages";
import { formatDate, formatUsd } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { useDb } from "@/store/hooks";

export default function AdminPackagesPage() {
  const db = useDb();
  const packages = useMemo(() => getPackages(db).reverse(), [db]);

  return (
    <>
      <PageHeader title="Packages" description="Package catalogue, driven by configuration data." />
      <TableShell>
        <thead>
          <tr>
            <Th>Package</Th>
            <Th>Category</Th>
            <Th className="text-right">Price</Th>
            <Th>Status</Th>
            <Th className="text-right">Users</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <Tr key={pkg.id}>
              <Td>
                <span className="font-semibold text-fg">{pkg.code}</span>{" "}
                <span className="text-dim">{pkg.name}</span>
              </Td>
              <Td className="capitalize">{pkg.category}</Td>
              <Td className="num text-right font-semibold text-fg">{formatUsd(pkg.price, { whole: true })}</Td>
              <Td>
                <Badge tone={pkg.active ? "success" : "neutral"} dot>
                  {pkg.active ? "Active" : "Inactive"}
                </Badge>
              </Td>
              <Td className="num text-right text-fg">{countPackageHolders(db, pkg.id)}</Td>
              <Td>{formatDate(pkg.createdAt)}</Td>
            </Tr>
          ))}
        </tbody>
      </TableShell>
    </>
  );
}
