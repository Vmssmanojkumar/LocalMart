import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth, auth } from "@/store/auth-store";

export function UserMenu() {
  const currentUser = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link to="/login" search={{ redirect: undefined }} className="rounded-full bg-foreground/5 px-4 py-1.5 text-xs font-medium hover:bg-foreground/10">
          Sign in
        </Link>
        <Link to="/signup" className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Register
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    auth.logout();
    navigate({ to: "/" });
  };

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pr-3 transition hover:bg-foreground/5"
      >
        <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{currentUser.name}</span>
        <ChevronDown className="h-3 w-3 text-foreground/50" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-background p-1 shadow-xl"
            >
              <div className="px-3 py-2 pb-3 mb-1 border-b border-border">
                <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                <p className="truncate text-xs text-foreground/50">{currentUser.email}</p>
              </div>

              {currentUser.role === "retailer" && (
                <Link
                  to="/retailer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5"
              >
                <User className="h-4 w-4 text-foreground/70" /> Profile
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 mt-1"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
