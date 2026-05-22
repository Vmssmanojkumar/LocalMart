import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getStrength(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-destructive", "bg-yellow-500", "bg-blue-500", "bg-primary"];
  return { score, label: pw ? labels[score - 1] || "Weak" : "", color: pw ? colors[score - 1] || colors[0] : "bg-muted" };
}

interface ChangePasswordFormProps {
  onSave: (current: string, next: string) => Promise<any>;
}

export function ChangePasswordForm({ onSave }: ChangePasswordFormProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(next);
  const mismatch = confirm && next !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { toast.error("Passwords don't match"); return; }
    if (next.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (!current) { toast.error("Please enter your current password"); return; }
    setLoading(true);
    try {
      await onSave(current, next);
      toast.success("Password changed successfully!");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        label="Current Password"
        value={current}
        onChange={setCurrent}
        show={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
        icon={<Lock className="h-4 w-4" />}
        placeholder="Enter current password"
      />
      <PasswordField
        label="New Password"
        value={next}
        onChange={setNext}
        show={showNext}
        onToggle={() => setShowNext((v) => !v)}
        icon={<ShieldCheck className="h-4 w-4" />}
        placeholder="Enter new password"
      />

      {/* Strength indicator */}
      {next && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : "bg-muted"}`}
              />
            ))}
          </div>
          <p className="text-xs text-foreground/60">{strength.label} password</p>
        </motion.div>
      )}

      <PasswordField
        label="Confirm New Password"
        value={confirm}
        onChange={setConfirm}
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        icon={<ShieldCheck className="h-4 w-4" />}
        placeholder="Confirm new password"
        error={mismatch ? "Passwords don't match" : undefined}
      />

      <button
        type="submit"
        disabled={loading || !current || !next || !confirm}
        className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
      >
        {loading ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, icon, placeholder, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">{label}</label>
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 bg-background/50 transition focus-within:border-primary ${error ? "border-destructive" : "border-border"}`}>
        <span className="text-foreground/40">{icon}</span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button type="button" onClick={onToggle} className="text-foreground/40 hover:text-foreground transition">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
