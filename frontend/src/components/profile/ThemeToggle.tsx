import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useStore, store } from "@/store/app-store";

type Theme = "light" | "dark" | "system";

interface ThemeToggleProps {
  value?: Theme;
  onChange?: (t: Theme) => void;
}

const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
  { id: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
  { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
  { id: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
];

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const dark = useStore((s) => s.dark);
  const current: Theme = value ?? (dark ? "dark" : "light");

  const handleChange = (t: Theme) => {
    if (t === "dark") store.setDark(true);
    else if (t === "light") store.setDark(false);
    else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      store.setDark(systemDark);
    }
    onChange?.(t);
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-background/50 border border-border p-1.5">
      {themes.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => handleChange(t.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            current === t.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
