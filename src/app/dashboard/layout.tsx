import { Topbar } from "@/components/topbar";
import { TabNav } from "@/components/tab-nav";
import { CompanyDrawer } from "@/components/company-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <TabNav />
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
        {children}
      </div>
      <CompanyDrawer />
    </div>
  );
}
