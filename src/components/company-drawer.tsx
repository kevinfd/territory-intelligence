"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { CompanyDetail } from "./company-detail";

export function CompanyDrawer() {
  const selectedId = useAppStore((s) => s.selectedCompanyId);
  const selectCompany = useAppStore((s) => s.selectCompany);
  const scored = useScoredCompanies();
  const match = scored.find((s) => s.company.id === selectedId);

  return (
    <Sheet
      open={!!selectedId}
      onOpenChange={(open) => {
        if (!open) selectCompany(null);
      }}
    >
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="sr-only">Company detail</SheetTitle>
        </SheetHeader>
        {match ? (
          <div className="p-6">
            <CompanyDetail scored={match} variant="drawer" />
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            Select a company to see details.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
