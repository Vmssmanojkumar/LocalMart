import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export function Logo({ className = "", hideText = false }: { className?: string, hideText?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
        <Store className="h-6 w-6" />
      </div>
      {!hideText && (
        <span className="font-display text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          LocalMart
        </span>
      )}
    </Link>
  );
}
