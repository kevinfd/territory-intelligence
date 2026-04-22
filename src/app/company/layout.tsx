import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { CompanyDrawer } from "@/components/company-drawer";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Topbar />
      {children}
      <CompanyDrawer />
      <MobileNav />
    </div>
  );
}
