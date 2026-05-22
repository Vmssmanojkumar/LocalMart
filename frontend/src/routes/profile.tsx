import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Lock, Sun, Package, Heart,
  LogOut, Trash2, Download, Calendar, ShieldCheck, Edit3,
  Check, X, Settings, Star, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, auth } from "@/store/auth-store";
import { apiUserProfile, apiOrders, type ApiFullProfile, type ApiOrder } from "@/lib/api";
import { ImageUploader } from "@/components/profile/ImageUploader";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ThemeToggle } from "@/components/profile/ThemeToggle";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — LocalMart" }] }),
  component: ProfilePage,
});

type Tab = "overview" | "personal" | "security" | "appearance" | "activity";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <User className="h-4 w-4" /> },
  { id: "personal", label: "Personal Info", icon: <Edit3 className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
  { id: "appearance", label: "Appearance", icon: <Sun className="h-4 w-4" /> },
  { id: "activity", label: "Activity", icon: <Package className="h-4 w-4" /> },
];

function ProfilePage() {
  const authUser = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<ApiFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ApiOrder[]>([]);

  useEffect(() => {
    if (!authUser) { navigate({ to: "/login", search: { redirect: "/profile" } }); return; }
    if (authUser.role === "retailer") { navigate({ to: "/retailer" }); return; }
    apiUserProfile.get()
      .then(setProfile)
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
    apiOrders.myOrders().then(setOrders).catch(() => {});
  }, [authUser, navigate]);

  if (!authUser || loading) return <ProfileSkeleton />;
  if (!profile) return null;

  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleProfileUpdate = async (updates: Partial<ApiFullProfile>) => {
    const updated = await apiUserProfile.update(updates);
    setProfile(updated);
    toast.success("Profile updated!");
  };

  const handleImageUpload = async (dataUrl: string) => {
    const res = await apiUserProfile.uploadImage(dataUrl);
    setProfile((p) => p ? { ...p, profileImage: res.profileImage } : p);
    toast.success("Profile picture updated!");
  };

  const handleLogout = () => { auth.logout(); navigate({ to: "/" }); };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    await apiUserProfile.deleteAccount();
    auth.logout();
    navigate({ to: "/" });
    toast.success("Account deleted.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 pb-20">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] gradient-hero p-6 shadow-soft sm:p-10 mb-6"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-6">
          <ImageUploader
            currentImage={profile.profileImage}
            fallback={
              <span className="text-3xl font-bold font-display text-primary">{initials}</span>
            }
            onUpload={handleImageUpload}
            size="lg"
            label="Change photo"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{profile.name}</h1>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                {profile.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" />{profile.email}</span>
              {profile.mobileNumber && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" />{profile.mobileNumber}</span>}
              {profile.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{profile.city}</span>}
            </div>
            {profile.createdAt && (
              <p className="mt-1 text-xs text-foreground/50 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <StatBadge label="Orders" value={orders.length} />
            <StatBadge label="Wishlist" value={0} />
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Tabs */}
        <motion.nav
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[1.5rem] p-3 shadow-soft h-fit"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-foreground/5"}`}
            >
              {t.icon} {t.label}
              {tab === t.id && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
            </button>
          ))}

          <div className="mt-3 border-t border-border pt-3 space-y-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </motion.nav>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {tab === "overview" && <OverviewTab profile={profile} orders={orders} />}
              {tab === "personal" && <PersonalTab profile={profile} onSave={handleProfileUpdate} />}
              {tab === "security" && (
                <SectionCard title="Change Password" icon={<Lock className="h-5 w-5 text-primary" />}>
                  <ChangePasswordForm
                    onSave={(cur, nxt) => apiUserProfile.changePassword({ currentPassword: cur, newPassword: nxt })}
                  />
                </SectionCard>
              )}
              {tab === "appearance" && (
                <SectionCard title="Appearance" icon={<Sun className="h-5 w-5 text-primary" />} description="Customize how LocalMart looks to you">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/70 uppercase tracking-wide text-xs">Theme</label>
                    <ThemeToggle
                      value={profile.themePreference || "system"}
                      onChange={(t) => handleProfileUpdate({ themePreference: t })}
                    />
                    <p className="text-xs text-foreground/50">Your preference is saved to your account and synced across devices.</p>
                  </div>
                </SectionCard>
              )}
              {tab === "activity" && <ActivityTab orders={orders} profile={profile} />}
            </motion.div>
          </AnimatePresence>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 glass rounded-[1.5rem] p-6 shadow-soft border border-destructive/20"
          >
            <h3 className="font-semibold text-destructive mb-3">Danger Zone</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </button>
              <button
                onClick={() => toast.info("Feature coming soon")}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition"
              >
                <Download className="h-4 w-4" /> Download My Data
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ profile, orders }: { profile: ApiFullProfile; orders: ApiOrder[] }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-600",
    confirmed: "bg-blue-500/15 text-blue-600",
    delivered: "bg-primary/15 text-primary",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Orders", value: orders.length, icon: <Package className="h-5 w-5" /> },
          { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, icon: <ShieldCheck className="h-5 w-5" /> },
          { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: <Calendar className="h-5 w-5" /> },
          { label: "Wishlist", value: 0, icon: <Heart className="h-5 w-5" /> },
        ].map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl p-4 shadow-soft text-center"
          >
            <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{s.icon}</div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-foreground/60 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <SectionCard title="Recent Orders" icon={<Package className="h-5 w-5 text-primary" />}>
        {orders.length === 0 ? (
          <div className="py-8 text-center text-foreground/50">
            <Package className="mx-auto h-10 w-10 opacity-30 mb-3" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o, i) => (
              <motion.div
                key={o._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 rounded-xl bg-background/40 px-4 py-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{o.items.map((i) => i.name).join(", ")}</div>
                  <div className="text-xs text-foreground/50">{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
                <div className="font-semibold">₹{o.totalPrice.toLocaleString()}</div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] ?? "bg-foreground/10"}`}>
                  {o.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ── Personal Tab ──────────────────────────────────────────────────────────────
function PersonalTab({ profile, onSave }: { profile: ApiFullProfile; onSave: (u: Partial<ApiFullProfile>) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    mobileNumber: profile.mobileNumber || "",
    address: profile.address || "",
    city: profile.city || "",
    pincode: profile.pincode || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: profile.name,
      mobileNumber: profile.mobileNumber || "",
      address: profile.address || "",
      city: profile.city || "",
      pincode: profile.pincode || "",
    });
    setEditing(false);
  };

  const fields: { key: keyof typeof form; label: string; icon: React.ReactNode; type?: string; span?: boolean }[] = [
    { key: "name", label: "Full Name", icon: <User className="h-4 w-4" /> },
    { key: "mobileNumber", label: "Mobile Number", icon: <Phone className="h-4 w-4" />, type: "tel" },
    { key: "address", label: "Address", icon: <MapPin className="h-4 w-4" />, span: true },
    { key: "city", label: "City", icon: <MapPin className="h-4 w-4" /> },
    { key: "pincode", label: "Pincode", icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <SectionCard
      title="Personal Information"
      icon={<User className="h-5 w-5 text-primary" />}
      description="Manage your personal details"
      action={
        !editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="flex items-center gap-1 rounded-xl bg-foreground/10 px-3 py-1.5 text-xs font-medium hover:bg-foreground/20 transition">
              <X className="h-3 w-3" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition">
              <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )
      }
    >
      {/* Read-only: Email */}
      <div className="mb-4 rounded-xl bg-background/40 px-4 py-3 flex items-center gap-3">
        <Mail className="h-4 w-4 text-foreground/40" />
        <div>
          <div className="text-xs text-foreground/50 uppercase tracking-wide">Email Address</div>
          <div className="text-sm font-medium mt-0.5">{profile.email}</div>
        </div>
        <span className="ml-auto text-xs text-foreground/40 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Verified</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.span ? "sm:col-span-2" : ""}>
            <label className="mb-1.5 block text-xs font-medium text-foreground/60 uppercase tracking-wide">{f.label}</label>
            {editing ? (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3 focus-within:border-primary transition">
                <span className="text-foreground/40">{f.icon}</span>
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder={f.label}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-background/40 px-4 py-3">
                <span className="text-foreground/40">{f.icon}</span>
                <span className="text-sm">{form[f.key] || <span className="text-foreground/40">Not set</span>}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────────────────
function ActivityTab({ orders, profile }: { orders: ApiOrder[]; profile: ApiFullProfile }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Account Activity" icon={<Settings className="h-5 w-5 text-primary" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Member Since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A"} icon={<Calendar className="h-4 w-4" />} />
          <InfoRow label="Account ID" value={`#${profile._id?.slice(-6).toUpperCase()}`} icon={<ShieldCheck className="h-4 w-4" />} mono />
          <InfoRow label="Account Type" value={profile.role} icon={<Star className="h-4 w-4" />} capitalize />
          <InfoRow label="Total Orders" value={String(orders.length)} icon={<Package className="h-4 w-4" />} />
        </div>
      </SectionCard>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────────
function SectionCard({ title, icon, description, action, children }: {
  title: string; icon: React.ReactNode; description?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-[1.5rem] p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">{icon}</div>
          <div>
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            {description && <p className="text-xs text-foreground/50">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 text-center">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-foreground/60">{label}</div>
    </div>
  );
}

function InfoRow({ label, value, icon, mono, capitalize }: { label: string; value: string; icon: React.ReactNode; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-background/40 px-4 py-3">
      <span className="mt-0.5 text-foreground/40">{icon}</span>
      <div>
        <div className="text-xs text-foreground/50 uppercase tracking-wide">{label}</div>
        <div className={`mt-0.5 text-sm font-medium ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="h-48 rounded-[2rem] bg-foreground/5 mb-6" />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="h-64 rounded-[1.5rem] bg-foreground/5" />
        <div className="h-96 rounded-[1.5rem] bg-foreground/5" />
      </div>
    </div>
  );
}
