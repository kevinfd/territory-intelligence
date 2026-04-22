"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CompanyDetail } from "@/components/company-detail";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";

export default function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const activeBankerId = useRequireBanker();
  const scored = useScoredCompanies();
  if (!activeBankerId) return null;
  const match = scored.find((s) => s.company.id === id);
  if (!match) return notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:pb-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>
      <CompanyDetail scored={match} variant="page" />
    </div>
  );
}
