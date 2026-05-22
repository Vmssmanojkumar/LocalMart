import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShoppingBag, Store, Mail, Lock, ArrowRight, ShoppingCart, Eye, EyeOff, Check } from "lucide-react";
import { auth } from "@/store/auth-store";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in to LocalMart" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [role, setRole] = useState<"customer" | "retailer">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const u = await auth.login(email, password, role);
      toast.success("Welcome back to LocalMart!", {
        description: `Logged in successfully as ${u.name}`,
        icon: "✨",
      });
      if (redirect) {
        navigate({ to: redirect as any });
      } else {
        navigate({ to: u.role === "retailer" ? "/retailer" : "/" });
      }
    } catch (e: any) {
      setErr(e.message || "Failed to sign in. Please verify your credentials.");
      toast.error("Authentication Error", {
        description: e.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* ═══════════════ LEFT SIDE: DYNAMIC BANNER (lg only) ═══════════════ */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-16 flex-col justify-between text-white">
        {/* Banner image with overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-500 to-rose-600">
          <img
            src="/assets/auth_banner.png"
            alt="LocalMart Auth Cover"
            className="w-full h-full object-cover opacity-85 mix-blend-multiply transition-transform duration-[10000ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-transparent to-orange-500/30" />
        </div>

        {/* Top brand */}
        <div className="relative z-10">
          <Logo className="invert brightness-0" />
        </div>

        {/* Middle glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md shadow-2xl space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" />
            Hyperlocal Delivery in 2 Hours
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
            Discover. Shop.<br />Delivered Instantly.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            LocalMart bridges the gap between premium retail items and your doorstep. Enjoy high-quality electronics, fashionable styles, fresh groceries and luxurious cosmetics curated just for you.
          </p>
        </motion.div>

        {/* Bottom footer credit */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/60">
          <span>© 2026 LocalMart Inc.</span>
          <div className="flex gap-4">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* ═══════════════ RIGHT SIDE: LOGIN FORM WORKSPACE ═══════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-gray-50/50">
        {/* Colorful background glowing circles */}
        <div className="absolute top-0 right-0 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-orange-400/10 to-coral-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-pink-400/10 to-rose-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-[2.2rem] border border-gray-100 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.06)]"
        >
          {/* Logo on mobile view */}
          <div className="flex lg:hidden justify-center mb-6">
            <Logo />
          </div>

          {/* Checkout redirect banner */}
          <AnimatePresence>
            {redirect === "/checkout" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3.5 text-xs font-semibold text-orange-600"
              >
                <ShoppingCart className="h-4 w-4 shrink-0 text-orange-500 animate-bounce" />
                Please sign in to complete your checkout order.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to access your premium LocalMart dashboard.</p>
          </div>

          {/* Role selector switches */}
          <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1 border border-gray-100">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                role === "customer"
                  ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ShoppingBag className={`h-4 w-4 ${role === "customer" ? "text-orange-500" : ""}`} /> Customer
            </button>
            <button
              type="button"
              onClick={() => setRole("retailer")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                role === "retailer"
                  ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Store className={`h-4 w-4 ${role === "retailer" ? "text-orange-500" : ""}`} /> Retailer
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Email field */}
            <AuthField
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="you@email.com"
              label="Email Address"
              value={email}
              onChange={setEmail}
            />

            {/* Password field */}
            <AuthField
              icon={<Lock className="h-4 w-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              label="Password"
              value={password}
              onChange={setPassword}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 text-gray-500 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 h-4 w-4 transition"
                />
                Remember me
              </label>
              <span className="font-bold text-orange-500 hover:text-orange-600 cursor-pointer transition">
                Forgot password?
              </span>
            </div>

            {/* Error UI */}
            {err && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 rounded-xl p-3"
              >
                ⚠️ {err}
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-coral-500 to-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          {/* Social Sign-Ins */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <SocialButton brand="google" />
              <SocialButton brand="facebook" />
              <SocialButton brand="apple" />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-orange-500 hover:text-orange-600 transition">
              Create free account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════ REUSABLE PREMIUM UI COMPONENTS ═══════════════

export interface AuthFieldProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  required?: boolean;
}

export function AuthField({
  icon,
  type,
  placeholder,
  label,
  value,
  onChange,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  required = true,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-700 tracking-wide block">{label}</label>
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 bg-gray-50/50 border transition-all duration-300 ${
          focused
            ? "border-orange-500 bg-white ring-4 ring-orange-500/10 shadow-sm"
            : "border-gray-200"
        }`}
      >
        <span className={`transition-colors duration-300 ${focused ? "text-orange-500" : "text-gray-400"}`}>
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300"
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer shrink-0"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function SocialButton({ brand }: { brand: "google" | "facebook" | "apple" }) {
  const handleSocialClick = () => {
    toast.info(`${brand.charAt(0).toUpperCase() + brand.slice(1)} Authentication`, {
      description: "Social authentication is active. Connecting to API partner...",
    });
  };

  const logos = {
    google: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          fill="#EA4335"
        />
      </svg>
    ),
    facebook: (
      <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    apple: (
      <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.73-1.16 1.87-1.01 2.98 1.1.09 2.24-.55 2.96-1.43z" />
      </svg>
    ),
  };

  return (
    <button
      onClick={handleSocialClick}
      type="button"
      className="flex items-center justify-center rounded-2xl py-3 border border-gray-200 bg-white hover:bg-gray-50 transition cursor-pointer hover:border-gray-300"
    >
      {logos[brand]}
    </button>
  );
}

// Deprecated old field exporter for backward compatibility
export function Field({ icon, type, placeholder, value, onChange }: { icon: React.ReactNode; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <AuthField
      icon={icon}
      type={type}
      placeholder={placeholder}
      label=""
      value={value}
      onChange={onChange}
    />
  );
}
