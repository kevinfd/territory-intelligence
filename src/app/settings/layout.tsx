import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { CompanyDrawer } from "@/components/company-drawer";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Topbar />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:pb-8">
        {children}
      </div>
      <CompanyDrawer />
      <MobileNav />
    </div>
  );
}
