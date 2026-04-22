import { Topbar } from "@/components/topbar";
import { CompanyDrawer } from "@/components/company-drawer";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar />
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
        {children}
      </div>
      <CompanyDrawer />
    </div>
  );
}
