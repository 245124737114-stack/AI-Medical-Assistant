import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  FileText,
  FolderHeart,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareHeart,
  ShieldCheck,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/chat", label: "AI Medical Chat", icon: MessageSquareHeart },
  { to: "/dashboard/symptoms", label: "Symptom Checker", icon: Activity },
  { to: "/dashboard/reports", label: "Report Summarizer", icon: FileText },
  { to: "/dashboard/images", label: "Medical Imaging", icon: ImageIcon },
  { to: "/dashboard/library", label: "Health Library", icon: BookOpen },
  { to: "/dashboard/records", label: "Personal Health", icon: FolderHeart },
];

export function DashboardLayout() {
  const { user, logout, aiConfigured } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <NavLink to="/" onClick={() => setSidebarOpen(false)}>
            <BrandLogo />
          </NavLink>
          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <div className="rounded-xl bg-blue-50/80 p-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-blue-800">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Educational Support Only
          </div>
          <p className="mt-1 leading-relaxed text-slate-600">
            AI status:{" "}
            <span className={aiConfigured ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
              {aiConfigured ? "Connected" : "API Key Required"}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F8FF]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-blue-100 bg-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 h-full w-72 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-blue-100 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-xl p-2 text-slate-600 hover:bg-blue-50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo compact />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
