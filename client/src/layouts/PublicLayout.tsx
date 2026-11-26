import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function PublicLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
      <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="/#features" className="transition-colors hover:text-blue-600">
              Features
            </a>
            <a href="/#how-it-works" className="transition-colors hover:text-blue-600">
              How It Works
            </a>
            <a href="/#benefits" className="transition-colors hover:text-blue-600">
              Benefits
            </a>
            <Link to="/library" className="transition-colors hover:text-blue-600">
              Health Library
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            className="rounded-xl p-2 text-slate-600 hover:bg-blue-50 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              <a href="/#features" onClick={() => setMobileOpen(false)} className="py-1.5">
                Features
              </a>
              <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="py-1.5">
                How It Works
              </a>
              <a href="/#benefits" onClick={() => setMobileOpen(false)} className="py-1.5">
                Benefits
              </a>
              <Link to="/library" onClick={() => setMobileOpen(false)} className="py-1.5">
                Health Library
              </Link>
              <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
                {user ? (
                  <Button className="w-full" asChild>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      Open Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
