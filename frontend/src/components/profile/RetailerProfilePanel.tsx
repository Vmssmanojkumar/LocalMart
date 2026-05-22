import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Store, Mail, Phone, MapPin, Lock, Sun, Package, Users,
  LogOut, Trash2, Edit3, Check, X, ShieldCheck, Star,
  Clock, Truck, FileText, Palette, ChevronRight, BarChart3,
  DollarSign, Calendar, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/store/auth-store";
import { apiRetailerProfile, type ApiFullProfile } from "@/lib/api";
import { ImageUploader } from "@/components/profile/ImageUploader";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ThemeToggle } from "@/components/profile/ThemeToggle";
import { useNavigate } from "@tanstack/react-router";

type RetailerTab = "overview" | "business" | "branding" | "security" | "appearance";

const RETAILER_TABS: { id: RetailerTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Store className="h-4 w-4" /> },
  { id: "business", label: "Business Info", icon: <FileText className="h-4 w-4" /> },
  { id: "branding", label: "Store Branding", icon: <Palette className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
  { id: "appearance", label: "Appearance", icon: <Sun className="h-4 w-4" /> },
];

const STATUS_BADGES = {
  verified: "bg-primary/15 text-primary",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  rejected: "bg-destructive/15 text-destructive",
};

interface RetailerProfilePanelProps {
  profile: ApiFullProfile;
  onProfileUpdate: (p: ApiFullProfile) => void;
  analytics?: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    customerCount: number;
  };
}

export function RetailerProfilePanel({ profile, onProfileUpdate, analytics }: RetailerProfilePanelProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RetailerTab>("overview");

  const handleProfileUpdate = async (updates: Partial<ApiFullProfile>) => {
    const updated = await apiRetailerProfile.update(updates);
    onProfileUpdate(updated);
    toast.success("Profile updated!");
  };

  const handleLogoUpload = async (dataUrl: string) => {
    const res = await apiRetailerProfile.uploadLogo(dataUrl);
    onProfileUpdate({ ...profile, storeLogo: res.storeLogo });
    toast.success("Store logo updated!");
  };

  const handleBannerUpload = async (dataUrl: string) => {
    const res = await apiRetailerProfile.uploadBanner(dataUrl);
    onProfileUpdate({ ...profile, storeBanner: res.storeBanner });
    toast.success("Store banner updated!");
  };

  const handleProfileImageUpload = async (dataUrl: string) => {
    // Retailers upload logo as their profile image
    await handleLogoUpload(dataUrl);
  };

  const handleLogout = () => { auth.logout(); navigate({ to: "/" }); };

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your store and all data. Continue?")) return;
    await apiRetailerProfile.deleteAccount();
    auth.logout();
    navigate({ to: "/" });
  };

  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Retailer Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] shadow-soft"
      >
        {/* Banner */}
        <div
          className="h-36 w-full bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30"
          style={profile.storeBanner ? { backgroundImage: `url(${profile.storeBanner})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        />
        {/* Main info overlay */}
        <div className="gradient-hero px-6 pb-6 pt-0">
          <div className="flex flex-wrap items-end gap-5 -mt-12">
            {/* Store Logo */}
            <div className="relative z-10">
              <ImageUploader
                currentImage={profile.storeLogo}
                fallback={
                  <span className="text-2xl font-bold font-display text-primary">{initials}</span>
                }
                onUpload={handleProfileImageUpload}
                shape="square"
                size="lg"
                label="Update logo"
              />
            </div>

            <div className="flex-1 min-w-0 pt-14 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{profile.shopName || profile.name}</h2>
                {profile.verificationStatus && (
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGES[profile.verificationStatus]}`}>
                    {profile.verificationStatus === "verified" && <ShieldCheck className="h-3 w-3" />}
                    {profile.verificationStatus === "pending" && <AlertCircle className="h-3 w-3" />}
                    {profile.verificationStatus}
                  </span>
                )}
                {profile.isApproved && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">✓ Approved</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-foreground/70">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" /> {profile.name}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" />{profile.email}</span>
                {profile.mobileNumber && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" />{profile.mobileNumber}</span>}
              </div>
              {profile.storeRating !== undefined && profile.storeRating > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(profile.storeRating!) ? "fill-yellow-400 text-yellow-400" : "text-foreground/20"}`} />
                  ))}
                  <span className="text-xs text-foreground/60 ml-1">{profile.storeRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs + Content */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <motion.nav
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[1.5rem] p-3 shadow-soft h-fit"
        >
          {RETAILER_TABS.map((t) => (
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
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {tab === "overview" && <RetailerOverviewTab profile={profile} analytics={analytics} />}
              {tab === "business" && <BusinessInfoTab profile={profile} onSave={handleProfileUpdate} />}
              {tab === "branding" && <BrandingTab profile={profile} onLogoUpload={handleLogoUpload} onBannerUpload={handleBannerUpload} onSave={handleProfileUpdate} />}
              {tab === "security" && (
                <RetailerSectionCard title="Security Settings" icon={<Lock className="h-5 w-5 text-primary" />}>
                  <ChangePasswordForm
                    onSave={(cur, nxt) => apiRetailerProfile.changePassword({ currentPassword: cur, newPassword: nxt })}
                  />
                </RetailerSectionCard>
              )}
              {tab === "appearance" && (
                <RetailerSectionCard title="Appearance" icon={<Sun className="h-5 w-5 text-primary" />} description="Customize how LocalMart looks to you">
                  <div className="space-y-4">
                    <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Theme</label>
                    <ThemeToggle
                      value={profile.themePreference || "system"}
                      onChange={(t) => handleProfileUpdate({ themePreference: t })}
                    />
                  </div>
                </RetailerSectionCard>
              )}
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
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
            >
              <Trash2 className="h-4 w-4" /> Delete Store Account
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Retailer Overview ─────────────────────────────────────────────────────────
function RetailerOverviewTab({
  profile,
  analytics,
}: {
  profile: ApiFullProfile;
  analytics?: RetailerProfilePanelProps["analytics"];
}) {
  const stats = analytics ?? { totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, customerCount: 0 };

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Products", value: stats.totalProducts, icon: <Package className="h-4 w-4" />, color: "bg-primary/10 text-primary" },
          { label: "Orders", value: stats.totalOrders, icon: <BarChart3 className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600" },
          { label: "Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="h-4 w-4" />, color: "bg-green-500/10 text-green-600" },
          { label: "Pending", value: stats.pendingOrders, icon: <Clock className="h-4 w-4" />, color: "bg-yellow-500/10 text-yellow-600" },
          { label: "Customers", value: stats.customerCount, icon: <Users className="h-4 w-4" />, color: "bg-purple-500/10 text-purple-600" },
        ].map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl p-4 shadow-soft text-center"
          >
            <div className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl ${s.color}`}>{s.icon}</div>
            <div className="font-display text-xl font-bold">{s.value}</div>
            <div className="text-[11px] text-foreground/60">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Store Details */}
      <RetailerSectionCard title="Store Details" icon={<Store className="h-5 w-5 text-primary" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow2 label="Shop Name" value={profile.shopName || "Not set"} icon={<Store className="h-4 w-4" />} />
          <InfoRow2 label="GST Number" value={profile.gstNumber || "Not set"} icon={<FileText className="h-4 w-4" />} />
          <InfoRow2 label="Opening Hours" value={profile.openingHours || "9:00 AM – 9:00 PM"} icon={<Clock className="h-4 w-4" />} />
          <InfoRow2 label="Delivery Radius" value={profile.deliveryRadius ? `${profile.deliveryRadius} km` : "Not set"} icon={<Truck className="h-4 w-4" />} />
          <InfoRow2 label="Business Address" value={profile.businessAddress || "Not set"} icon={<MapPin className="h-4 w-4" />} />
          {profile.createdAt && (
            <InfoRow2 label="Member Since" value={new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })} icon={<Calendar className="h-4 w-4" />} />
          )}
        </div>
        {profile.storeDescription && (
          <div className="mt-4 rounded-xl bg-background/40 p-4">
            <div className="text-xs text-foreground/50 uppercase tracking-wide mb-1">Store Description</div>
            <p className="text-sm">{profile.storeDescription}</p>
          </div>
        )}
      </RetailerSectionCard>
    </div>
  );
}

// ── Business Info Tab ─────────────────────────────────────────────────────────
function BusinessInfoTab({ profile, onSave }: { profile: ApiFullProfile; onSave: (u: Partial<ApiFullProfile>) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    mobileNumber: profile.mobileNumber || "",
    shopName: profile.shopName || "",
    gstNumber: profile.gstNumber || "",
    businessAddress: profile.businessAddress || "",
    deliveryRadius: String(profile.deliveryRadius || 5),
    storeDescription: profile.storeDescription || "",
    openingHours: profile.openingHours || "9:00 AM – 9:00 PM",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...form, deliveryRadius: Number(form.deliveryRadius) });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, icon: React.ReactNode, type = "text", textarea = false, span = false) => (
    <div key={key} className={span ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-medium text-foreground/60 uppercase tracking-wide">{label}</label>
      {editing ? (
        textarea ? (
          <textarea
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary transition resize-none"
            placeholder={label}
          />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3 focus-within:border-primary transition">
            <span className="text-foreground/40">{icon}</span>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder={label}
            />
          </div>
        )
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-background/40 px-4 py-3">
          {!textarea && <span className="text-foreground/40">{icon}</span>}
          <span className="text-sm">{form[key] || <span className="text-foreground/40">Not set</span>}</span>
        </div>
      )}
    </div>
  );

  return (
    <RetailerSectionCard
      title="Business Information"
      icon={<FileText className="h-5 w-5 text-primary" />}
      description="Manage your store's business details"
      action={
        !editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition">
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-xl bg-foreground/10 px-3 py-1.5 text-xs font-medium hover:bg-foreground/20">
              <X className="h-3 w-3" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Owner Name", <Users className="h-4 w-4" />)}
        {field("mobileNumber", "Mobile Number", <Phone className="h-4 w-4" />, "tel")}
        {field("shopName", "Shop Name", <Store className="h-4 w-4" />)}
        {field("gstNumber", "GST Number", <FileText className="h-4 w-4" />)}
        {field("businessAddress", "Business Address", <MapPin className="h-4 w-4" />, "text", false, true)}
        {field("deliveryRadius", "Delivery Radius (km)", <Truck className="h-4 w-4" />, "number")}
        {field("openingHours", "Opening Hours", <Clock className="h-4 w-4" />)}
        {field("storeDescription", "Store Description", <FileText className="h-4 w-4" />, "text", true, true)}
      </div>
    </RetailerSectionCard>
  );
}

// ── Branding Tab ──────────────────────────────────────────────────────────────
function BrandingTab({
  profile,
  onLogoUpload,
  onBannerUpload,
  onSave,
}: {
  profile: ApiFullProfile;
  onLogoUpload: (d: string) => Promise<void>;
  onBannerUpload: (d: string) => Promise<void>;
  onSave: (u: Partial<ApiFullProfile>) => Promise<void>;
}) {
  const [accentColor, setAccentColor] = useState(profile.storeAccentColor || "#8A9A5B");

  const saveAccent = () => onSave({ storeAccentColor: accentColor });

  return (
    <div className="space-y-4">
      <RetailerSectionCard title="Store Logo" icon={<Store className="h-5 w-5 text-primary" />} description="Upload your store's logo (square recommended)">
        <div className="flex items-center gap-6">
          <ImageUploader
            currentImage={profile.storeLogo}
            fallback={<Store className="h-8 w-8 text-foreground/40" />}
            onUpload={onLogoUpload}
            shape="square"
            size="lg"
            label="Upload logo"
          />
          <div className="text-sm text-foreground/60 space-y-1">
            <p>• JPG, PNG, or WEBP format</p>
            <p>• Maximum size: 5MB</p>
            <p>• Recommended: 400×400px square</p>
          </div>
        </div>
      </RetailerSectionCard>

      <RetailerSectionCard title="Store Banner" icon={<Palette className="h-5 w-5 text-primary" />} description="Upload a banner image for your store header">
        <div className="space-y-4">
          {profile.storeBanner && (
            <img src={profile.storeBanner} alt="Banner" className="w-full h-32 rounded-xl object-cover" />
          )}
          <ImageUploader
            currentImage={undefined}
            fallback={<span className="text-sm text-foreground/40">No banner set</span>}
            onUpload={onBannerUpload}
            shape="square"
            size="sm"
            label="Upload banner"
          />
          <p className="text-xs text-foreground/50">Recommended: 1200×300px. Max 5MB.</p>
        </div>
      </RetailerSectionCard>

      <RetailerSectionCard title="Store Accent Color" icon={<Palette className="h-5 w-5 text-primary" />} description="Choose your store's primary brand color">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl border border-border" style={{ background: accentColor }} />
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="h-10 w-24 cursor-pointer rounded-xl border-0 bg-transparent p-0"
          />
          <span className="font-mono text-sm text-foreground/60">{accentColor}</span>
          <button
            onClick={saveAccent}
            className="ml-auto rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Save Color
          </button>
        </div>
        <p className="mt-2 text-xs text-foreground/50">This color will be used as the primary accent for your store page.</p>
      </RetailerSectionCard>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────────
function RetailerSectionCard({ title, icon, description, action, children }: {
  title: string; icon: React.ReactNode; description?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-[1.5rem] p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">{icon}</div>
          <div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            {description && <p className="text-xs text-foreground/50">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoRow2({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-background/40 px-4 py-3">
      <span className="mt-0.5 text-foreground/40">{icon}</span>
      <div>
        <div className="text-xs text-foreground/50 uppercase tracking-wide">{label}</div>
        <div className="mt-0.5 text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
