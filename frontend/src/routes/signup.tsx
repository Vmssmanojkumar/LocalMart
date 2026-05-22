import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShoppingBag, Store, Mail, Lock, User, ArrowRight, Building2, Check, ShieldCheck } from "lucide-react";
import { auth } from "@/store/auth-store";
import { AuthField, SocialButton } from "./login";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — LocalMart" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"customer" | "retailer">("customer");
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match. Please verify.");
      return;
    }
    if (!agreeTerms) {
      setErr("Please review and agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    try {
      const u = await auth.signup({
        name,
        email,
        password,
        role,
        shopName: role === "retailer" ? shopName : undefined,
      });
      toast.success("Account Created!", {
        description: `Welcome to LocalMart, ${u.name}! Ready to explore.`,
        icon: "🎉",
      });
      navigate({ to: u.role === "retailer" ? "/retailer" : "/" });
    } catch (e: any) {
      setErr(e.message || "Failed to create account. Please try again.");
      toast.error("Registration Failed", {
        description: e.message || "Invalid input or email already registered.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* ═══════════════ LEFT SIDE: DYNAMIC COVER BANNER (lg only) ═══════════════ */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-16 flex-col justify-between text-white">
        {/* Cover image with elegant filters */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-500 to-rose-600">
          <img
            src="/assets/auth_banner.png"
            alt="LocalMart Signup Cover"
            className="w-full h-full object-cover opacity-85 mix-blend-multiply transition-transform duration-[10000ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-transparent to-orange-500/30" />
        </div>

        {/* Top brand logo */}
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
            Join the Neighborhood Marketplace
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
            Join LocalMart.<br />Start Shopping Local.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Create an account in less than a minute. Gain instant access to a vast network of nearby retail stores offering electronics, boutique fashion, organics, cosmetics, and toys with quick local dispatch.
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

      {/* ═══════════════ RIGHT SIDE: SIGNUP FORM WORKSPACE ═══════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-gray-50/50 my-auto">
        {/* Decorative background blurs */}
        <div className="absolute top-0 right-0 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-orange-400/10 to-coral-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-pink-400/10 to-rose-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-[2.2rem] border border-gray-100 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.06)] my-8"
        >
          {/* Logo on mobile view */}
          <div className="flex lg:hidden justify-center mb-6">
            <Logo />
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-gray-500">Register as a customer shopper or local retail seller.</p>
          </div>

          {/* Role selector card cards */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl p-4 border text-center transition cursor-pointer hover:shadow-md ${
                role === "customer"
                  ? "border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/10 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`h-10 w-10 flex items-center justify-center rounded-xl transition ${
                  role === "customer" ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-500"
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs font-bold ${role === "customer" ? "text-gray-900" : "text-gray-700"}`}>
                  Customer
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Order from local shops</p>
              </div>
              {role === "customer" && (
                <div className="absolute top-2 right-2 h-4 w-4 bg-orange-500 text-white rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRole("retailer")}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl p-4 border text-center transition cursor-pointer hover:shadow-md ${
                role === "retailer"
                  ? "border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/10 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`h-10 w-10 flex items-center justify-center rounded-xl transition ${
                  role === "retailer" ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-500"
                }`}
              >
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs font-bold ${role === "retailer" ? "text-gray-900" : "text-gray-700"}`}>
                  Retailer
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Sell locally to shoppers</p>
              </div>
              {role === "retailer" && (
                <div className="absolute top-2 right-2 h-4 w-4 bg-orange-500 text-white rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Full Name field */}
            <AuthField
              icon={<User className="h-4 w-4" />}
              type="text"
              placeholder="Your full name"
              label="Full Name"
              value={name}
              onChange={setName}
            />

            {/* Shop Name field (Dynamic) */}
            <AnimatePresence mode="popLayout">
              {role === "retailer" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <AuthField
                    icon={<Building2 className="h-4 w-4" />}
                    type="text"
                    placeholder="Your legal shop name"
                    label="Shop Name"
                    value={shopName}
                    onChange={setShopName}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
            <div className="space-y-1">
              <AuthField
                icon={<Lock className="h-4 w-4" />}
                type={showPassword ? "text" : "password"}
                placeholder="Choose safe password"
                label="Password (min 6 chars)"
                value={password}
                onChange={setPassword}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password field */}
            <AuthField
              icon={<ShieldCheck className="h-4 w-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="Retype password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            {/* Agree Terms Checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-gray-500 font-semibold cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 h-4 w-4 transition"
              />
              <span>
                I agree to the LocalMart{" "}
                <span className="text-orange-500 font-bold hover:underline">Terms of Service</span> and{" "}
                <span className="text-orange-500 font-bold hover:underline">Privacy Policy</span>.
              </span>
            </label>

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

            {/* Create Account button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-coral-500 to-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          {/* Social login options */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Or sign up with
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <SocialButton brand="google" />
              <SocialButton brand="facebook" />
              <SocialButton brand="apple" />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" search={{ redirect: undefined }} className="font-bold text-orange-500 hover:text-orange-600 transition">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════ PASSWORD STRENGTH CALCULATOR ═══════════════

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const label = ["Weak", "Fair", "Medium", "Strong"][Math.min(score - 1, 3)] || "Weak";
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const color = colors[Math.min(score - 1, 3)] || "bg-red-500";

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span>Password Strength:</span>
        <span className={score >= 3 ? "text-green-600" : "text-red-500"}>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 transition-all duration-300 ${
              i < score ? color : "bg-gray-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
