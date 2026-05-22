import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  LayoutDashboard,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  Search,
  Trash2,
  Edit,
  ShieldAlert,
  Activity,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Building2,
  Eye,
  RefreshCw,
  TrendingUp,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

import { useAuth, auth } from "@/store/auth-store";
import { apiAdmin, type ApiUser, type ApiOrder } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — LocalMart" }] }),
  component: AdminPageLayout,
});

type TabType = "dashboard" | "users" | "retailers" | "requests" | "analytics" | "settings";

function AdminPageLayout() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected Admin Route Check
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
    } else if (user.role !== "admin") {
      toast.error("Access denied: Administrative privileges required.");
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-[#F5EFE6] text-[#2D2D2D] font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E0CCBA] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#E0CCBA]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#8A9A5B] text-white text-xl font-bold shadow-soft">
              LM
            </span>
            <div>
              <h1 className="font-display font-bold text-lg text-[#2D2D2D] leading-none">LocalMart</h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8A9A5B]">Admin Console</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-foreground/60 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <SidebarLink active={activeTab === "dashboard"} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }} />
          <SidebarLink active={activeTab === "users"} icon={<Users className="h-4 w-4" />} label="Users Directory" onClick={() => { setActiveTab("users"); setSidebarOpen(false); }} />
          <SidebarLink active={activeTab === "retailers"} icon={<Store className="h-4 w-4" />} label="Retailers Database" onClick={() => { setActiveTab("retailers"); setSidebarOpen(false); }} />
          <SidebarLink active={activeTab === "requests"} icon={<Activity className="h-4 w-4" />} label="Pending Approvals" onClick={() => { setActiveTab("requests"); setSidebarOpen(false); }} />
          <SidebarLink active={activeTab === "analytics"} icon={<TrendingUp className="h-4 w-4" />} label="Platform Analytics" onClick={() => { setActiveTab("analytics"); setSidebarOpen(false); }} />
          <SidebarLink active={activeTab === "settings"} icon={<Settings className="h-4 w-4" />} label="Console Settings" onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }} />
        </nav>

        <div className="border-t border-[#E0CCBA] p-4 bg-[#F9F6F0]">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#8A9A5B]/15 text-[#8A9A5B] font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2D2D2D] truncate">{user.name}</p>
              <p className="text-[10px] text-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              auth.logout();
              navigate({ to: "/" });
              toast.info("Logged out of administrative portal.");
            }}
            className="flex w-full items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/15"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E0CCBA] bg-white/85 backdrop-blur-md px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#E0CCBA] hover:bg-[#F5EFE6]/50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display text-xl font-bold capitalize text-[#2D2D2D]">{activeTab} Panel</h2>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-[#8A9A5B]/15 text-[#8A9A5B] hover:bg-[#8A9A5B]/20 border-none font-medium px-2.5 py-1">
              🟢 System Online
            </Badge>
            <div className="h-8 w-px bg-[#E0CCBA]" />
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#2D2D2D]">LocalMart Administrator</span>
              <span className="text-[9px] text-[#8A9A5B] font-semibold uppercase tracking-wider">Full Privileges</span>
            </div>
          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "dashboard" && <OverviewDashboard />}
              {activeTab === "users" && <UsersDirectory />}
              {activeTab === "retailers" && <RetailersDatabase />}
              {activeTab === "requests" && <ApprovalsWorkflow />}
              {activeTab === "analytics" && <PlatformAnalyticsView />}
              {activeTab === "settings" && <ConsoleSettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR LINK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SidebarLink({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-[#8A9A5B] text-white shadow-soft"
          : "text-foreground/70 hover:bg-[#F5EFE6] hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: OVERVIEW DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function OverviewDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: apiAdmin.getDashboard,
  });

  const approveMutation = useMutation({
    mutationFn: apiAdmin.approveRetailer,
    onSuccess: () => {
      toast.success("Retailer account approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to approve retailer."),
  });

  const rejectMutation = useMutation({
    mutationFn: apiAdmin.rejectRetailer,
    onSuccess: () => {
      toast.success("Retailer request rejected/set to pending.");
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to reject retailer."),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-[#E0CCBA]/35" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl bg-[#E0CCBA]/35" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl bg-[#E0CCBA]/35" />
          <Skeleton className="h-64 rounded-3xl bg-[#E0CCBA]/35" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass rounded-[2rem] p-12 text-center shadow-soft flex flex-col items-center max-w-lg mx-auto mt-10">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-display text-xl font-bold text-[#2D2D2D]">Dashboard Failed to Load</h3>
        <p className="text-sm text-foreground/60 mt-2 mb-6">
          Could not communicate with LocalMart database API. Make sure your Express server and MongoDB are fully active.
        </p>
        <Button onClick={() => refetch()} className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 px-6">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
        </Button>
      </div>
    );
  }

  const { stats, recentRegistrations, recentRetailerRequests, recentOrders } = data;

  const kpis = [
    { label: "Total Platform Users", value: stats.totalUsers, icon: <Users className="h-5 w-5" />, sub: "Customer Accounts" },
    { label: "Total Shop Owners", value: stats.totalRetailers, icon: <Store className="h-5 w-5" />, sub: `${stats.approvedRetailers} Approved · ${stats.pendingRetailers} Pending` },
    { label: "Database Products", value: stats.totalProducts, icon: <ShoppingCart className="h-5 w-5" />, sub: "Active Inventory" },
    { label: "Estimated Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5" />, sub: `${stats.totalOrders} Placed Orders` },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-3xl bg-white border border-[#E0CCBA]/40 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#8A9A5B]/15 text-[#8A9A5B]">
                {kpi.icon}
              </div>
              <span className="text-[10px] font-bold text-[#8A9A5B] bg-[#8A9A5B]/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="mt-4 font-display text-3xl font-bold text-[#2D2D2D]">
              {kpi.value}
            </div>
            <div className="text-xs font-semibold text-[#2D2D2D]/60 mt-1">{kpi.label}</div>
            <div className="text-[10px] text-foreground/45 mt-0.5">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart Preview */}
      <div className="glass rounded-3xl bg-white border border-[#E0CCBA]/40 p-6 shadow-soft">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-[#2D2D2D]">Revenue and Platform Activity</h3>
            <p className="text-xs text-foreground/60">Hyperlocal sales aggregates and user signups.</p>
          </div>
          <Badge className="bg-[#8A9A5B]/15 text-[#8A9A5B] hover:bg-[#8A9A5B]/20 border-none font-medium px-2 py-1">
            Realtime DB Logs
          </Badge>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { period: "Jan", revenue: stats.totalRevenue * 0.15, orders: stats.totalOrders * 0.12 },
                { period: "Feb", revenue: stats.totalRevenue * 0.35, orders: stats.totalOrders * 0.28 },
                { period: "Mar", revenue: stats.totalRevenue * 0.6, orders: stats.totalOrders * 0.5 },
                { period: "Apr", revenue: stats.totalRevenue * 0.85, orders: stats.totalOrders * 0.78 },
                { period: "May (Current)", revenue: stats.totalRevenue, orders: stats.totalOrders },
              ]}
            >
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8A9A5B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8A9A5B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0CCBA/20" />
              <XAxis dataKey="period" stroke="#2D2D2D" fontSize={10} />
              <YAxis stroke="#2D2D2D" fontSize={10} />
              <ChartTooltip contentStyle={{ background: "#F5EFE6", border: "1px solid #E0CCBA", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#8A9A5B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Pending Retailers & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Retailer Requests */}
        <div className="glass rounded-3xl bg-white border border-[#E0CCBA]/40 p-6 shadow-soft flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-md font-bold text-[#2D2D2D] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#8A9A5B]" /> Retailer Verification Requests
            </h3>
            <Badge className="bg-amber-500/15 text-amber-600 border-none font-semibold px-2 py-0.5 text-xs">
              {recentRetailerRequests.length} Pending
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            {recentRetailerRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-[#8A9A5B] opacity-55 mb-2" />
                <p className="text-sm font-medium text-foreground/50">All retailer accounts verified!</p>
              </div>
            ) : (
              recentRetailerRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between border border-[#E0CCBA]/30 rounded-2xl p-4 bg-[#F9F6F0]/50 hover:bg-[#F9F6F0] transition">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D2D2D]">{req.shopName || "Unknown Shop"}</h4>
                    <p className="text-xs text-foreground/60">Owner: {req.name} · {req.email}</p>
                    <p className="text-[10px] text-[#8A9A5B] mt-0.5 font-medium">GST: {req.gstNumber || "Not Provided"}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(req._id)}
                      disabled={approveMutation.isPending}
                      className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 h-8 px-3.5 text-xs font-semibold"
                    >
                      Approve
                    </Button>
                    <button
                      onClick={() => rejectMutation.mutate(req._id)}
                      disabled={rejectMutation.isPending}
                      className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/15 transition"
                    >
                      <XCircle className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Platform Orders */}
        <div className="glass rounded-3xl bg-white border border-[#E0CCBA]/40 p-6 shadow-soft flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-md font-bold text-[#2D2D2D] flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#8A9A5B]" /> Recent Platform Orders
            </h3>
            <Badge className="bg-[#8A9A5B]/15 text-[#8A9A5B] border-none font-semibold px-2 py-0.5 text-xs">
              Live Feed
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <PackageCheck className="h-8 w-8 text-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground/50">No orders placed on the platform yet.</p>
              </div>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord._id} className="flex items-center justify-between border border-[#E0CCBA]/30 rounded-2xl p-4 bg-[#F9F6F0]/50 hover:bg-[#F9F6F0] transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2D2D2D]">₹{ord.totalPrice.toLocaleString()}</span>
                      <span className="text-[10px] text-foreground/45">ID: ...{ord._id.slice(-6)}</span>
                    </div>
                    <p className="text-xs text-foreground/60">Placed by: {ord.user?.name || "Customer"}</p>
                    <p className="text-[10px] text-foreground/40 mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge
                    className={`border-none rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ord.status === "delivered"
                        ? "bg-[#8A9A5B]/15 text-[#8A9A5B]"
                        : ord.status === "cancelled"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {ord.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: USER DIRECTORY
// ─────────────────────────────────────────────────────────────────────────────
function UsersDirectory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<Omit<ApiUser, "token"> | null>(null);
  const [userToEdit, setUserToEdit] = useState<Omit<ApiUser, "token"> | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"customer" | "admin">("customer");

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: apiAdmin.getUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: apiAdmin.deleteUser,
    onSuccess: () => {
      toast.success("User account successfully removed.");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setUserToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove user account."),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ApiUser> }) => apiAdmin.updateUser(id, body),
    onSuccess: () => {
      toast.success("User account information updated.");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setUserToEdit(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update user."),
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" ? true : u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleStartEdit = (u: Omit<ApiUser, "token">) => {
    setUserToEdit(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role as "customer" | "admin");
  };

  const handleSaveEdit = () => {
    if (!userToEdit) return;
    if (!editName.trim()) return toast.error("Name is required");
    if (!editEmail.trim()) return toast.error("Email is required");

    editMutation.mutate({
      id: userToEdit._id,
      body: { name: editName, email: editEmail, role: editRole },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl bg-[#E0CCBA]/35" />
        <div className="glass rounded-3xl bg-white border border-[#E0CCBA]/40 p-4 shadow-soft">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl my-2 bg-[#E0CCBA]/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-[50%] h-4.5 w-4.5 translate-y-[-50%] text-foreground/45" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email..."
            className="pl-11 rounded-full border-[#E0CCBA] bg-white text-sm outline-none focus-visible:ring-[#8A9A5B] h-11"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#2D2D2D]/60 shrink-0">Filter Role:</span>
          <div className="flex bg-white border border-[#E0CCBA] rounded-full p-1 gap-1">
            <button
              onClick={() => setRoleFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                roleFilter === "all" ? "bg-[#8A9A5B] text-white shadow-sm" : "text-[#2D2D2D]/60 hover:text-foreground"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setRoleFilter("customer")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                roleFilter === "customer" ? "bg-[#8A9A5B] text-white shadow-sm" : "text-[#2D2D2D]/60 hover:text-foreground"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                roleFilter === "admin" ? "bg-[#8A9A5B] text-white shadow-sm" : "text-[#2D2D2D]/60 hover:text-foreground"
              }`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table Grid */}
      <div className="glass rounded-[2rem] bg-white border border-[#E0CCBA]/40 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0CCBA]/40 bg-[#F9F6F0]/60 text-[11px] font-bold uppercase tracking-wider text-[#2D2D2D]/60">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-center">Action Console</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0CCBA]/25 text-sm text-[#2D2D2D]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-foreground/45 font-medium">
                    No users match your current directory query parameters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F5EFE6]/35 transition">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#8A9A5B]/15 text-[#8A9A5B] font-bold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2D2D2D] leading-none">{u.name}</p>
                          <span className="text-xs text-foreground/60">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <Badge
                        className={`border-none rounded-full font-bold px-2.5 py-0.5 text-[10px] ${
                          u.role === "admin" ? "bg-red-500/15 text-red-600" : "bg-[#8A9A5B]/15 text-[#8A9A5B]"
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-foreground/60 font-medium">
                      {new Date(u.createdAt as string).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="grid h-8 w-8 place-items-center rounded-full text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition"
                          title="View Profile Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="grid h-8 w-8 place-items-center rounded-full text-[#8A9A5B] hover:bg-[#8A9A5B]/10 transition"
                          title="Edit Account Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u._id)}
                          className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10 transition"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md bg-white border border-[#E0CCBA] rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2D2D2D]">User Profile Details</DialogTitle>
            <DialogDescription className="text-xs text-foreground/60">LocalMart full account review log.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 border-b border-[#E0CCBA]/35 pb-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#8A9A5B]/15 text-[#8A9A5B] text-2xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-[#2D2D2D] text-base">{selectedUser.name}</h4>
                  <p className="text-sm text-foreground/60">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-foreground/45">Account ID</p>
                  <p className="text-[#2D2D2D] mt-0.5 break-all">{selectedUser._id}</p>
                </div>
                <div>
                  <p className="text-foreground/45">Security Role</p>
                  <Badge className="border-none bg-[#8A9A5B]/15 text-[#8A9A5B] font-bold rounded-full mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-foreground/45">Creation Date</p>
                  <p className="text-[#2D2D2D] mt-0.5">
                    {new Date(selectedUser.createdAt as string).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-foreground/45">System Actions</p>
                  <p className="text-emerald-600 mt-0.5">🟢 Verified Account</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedUser(null)} className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 w-full font-semibold">
              Dismiss Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent className="max-w-md bg-white border border-[#E0CCBA] rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2D2D2D]">Modify User Credentials</DialogTitle>
            <DialogDescription className="text-xs text-foreground/60">Edit security roles or metadata variables.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Full Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Email Address</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Authorization Level</label>
              <Select value={editRole} onValueChange={(v: "customer" | "admin") => setEditRole(v)}>
                <SelectTrigger className="rounded-xl border-[#E0CCBA] focus:ring-[#8A9A5B]">
                  <SelectValue placeholder="Select authorization level" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E0CCBA]">
                  <SelectItem value="customer">Customer Role</SelectItem>
                  <SelectItem value="admin">System Admin Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUserToEdit(null)} className="rounded-full border-[#E0CCBA] hover:bg-[#F5EFE6]/50">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editMutation.isPending} className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 font-semibold">
              Commit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-sm bg-white border border-[#E0CCBA] rounded-3xl p-6 shadow-xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <ShieldAlert className="h-10 w-10 text-destructive mb-2" />
            <DialogTitle className="font-display text-lg font-bold text-[#2D2D2D]">Remove Account?</DialogTitle>
            <DialogDescription className="text-xs text-foreground/60 mt-1">
              Warning! Deleting this customer account is irreversible. All order logs, baskets, and profiles associated will be purged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:flex-row items-center gap-2 justify-center w-full mt-4">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="rounded-full border-[#E0CCBA] w-full hover:bg-[#F5EFE6]/50 text-xs font-semibold">
              Cancel Action
            </Button>
            <Button
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete)}
              disabled={deleteMutation.isPending}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90 w-full text-xs font-semibold"
            >
              Purge Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: RETAILERS DATABASE
// ─────────────────────────────────────────────────────────────────────────────
function RetailersDatabase() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [selectedRetailer, setSelectedRetailer] = useState<Omit<ApiUser, "token"> | null>(null);
  const [retailerToEdit, setRetailerToEdit] = useState<Omit<ApiUser, "token"> | null>(null);
  const [retailerToDelete, setRetailerToDelete] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editShop, setEditShop] = useState("");
  const [editGst, setEditGst] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const { data: retailers = [], isLoading, error } = useQuery({
    queryKey: ["adminRetailers"],
    queryFn: apiAdmin.getRetailers,
  });

  const deleteMutation = useMutation({
    mutationFn: apiAdmin.deleteRetailer,
    onSuccess: () => {
      toast.success("Retailer and their catalog successfully removed.");
      queryClient.invalidateQueries({ queryKey: ["adminRetailers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setRetailerToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove retailer."),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ApiUser> }) => apiAdmin.updateUser(id, body),
    onSuccess: () => {
      toast.success("Retailer credentials updated.");
      queryClient.invalidateQueries({ queryKey: ["adminRetailers"] });
      setRetailerToEdit(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update retailer."),
  });

  const toggleApprovalMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      approved ? apiAdmin.approveRetailer(id) : apiAdmin.rejectRetailer(id),
    onSuccess: (_, variables) => {
      toast.success(variables.approved ? "Retailer activated/approved." : "Retailer set to pending status.");
      queryClient.invalidateQueries({ queryKey: ["adminRetailers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (err: any) => toast.error(err.message || "Approval modification failed."),
  });

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) => {
      const matchSearch =
        (r.shopName || "").toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "approved"
            ? r.isApproved === true
            : r.isApproved === false;
      return matchSearch && matchStatus;
    });
  }, [retailers, search, statusFilter]);

  const handleStartEdit = (r: Omit<ApiUser, "token">) => {
    setRetailerToEdit(r);
    setEditName(r.name);
    setEditEmail(r.email);
    setEditShop(r.shopName || "");
    setEditGst(r.gstNumber || "");
    setEditAddress(r.address || "");
  };

  const handleSaveEdit = () => {
    if (!retailerToEdit) return;
    if (!editName.trim()) return toast.error("Owner name is required");
    if (!editEmail.trim()) return toast.error("Email is required");
    if (!editShop.trim()) return toast.error("Shop name is required");

    editMutation.mutate({
      id: retailerToEdit._id,
      body: { name: editName, email: editEmail, shopName: editShop, gstNumber: editGst, address: editAddress },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl bg-[#E0CCBA]/35" />
        <div className="glass rounded-3xl bg-white border border-[#E0CCBA]/40 p-4 shadow-soft">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl my-2 bg-[#E0CCBA]/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-[50%] h-4.5 w-4.5 translate-y-[-50%] text-foreground/45" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by shop name, owner..."
            className="pl-11 rounded-full border-[#E0CCBA] bg-white text-sm outline-none focus-visible:ring-[#8A9A5B] h-11"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#2D2D2D]/60 shrink-0">Status:</span>
          <div className="flex bg-white border border-[#E0CCBA] rounded-full p-1 gap-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                statusFilter === "all" ? "bg-[#8A9A5B] text-white shadow-sm" : "text-[#2D2D2D]/60 hover:text-foreground"
              }`}
            >
              All Shops
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                statusFilter === "approved" ? "bg-[#8A9A5B] text-white shadow-sm" : "text-[#2D2D2D]/60 hover:text-foreground"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                statusFilter === "pending" ? "bg-[#8A9A5B] text-white shadow-sm" : "text-[#2D2D2D]/60 hover:text-foreground"
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass rounded-[2rem] bg-white border border-[#E0CCBA]/40 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0CCBA]/40 bg-[#F9F6F0]/60 text-[11px] font-bold uppercase tracking-wider text-[#2D2D2D]/60">
                <th className="px-6 py-4">Shop Details</th>
                <th className="px-6 py-4">Owner / Contact</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-center">Action Console</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0CCBA]/25 text-sm text-[#2D2D2D]">
              {filteredRetailers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-foreground/45 font-medium">
                    No retailer records match your filters.
                  </td>
                </tr>
              ) : (
                filteredRetailers.map((r) => (
                  <tr key={r._id} className="hover:bg-[#F5EFE6]/35 transition">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#E0CCBA]/30 text-lg">
                          🏪
                        </span>
                        <div>
                          <p className="font-bold text-[#2D2D2D] leading-none">{r.shopName || "Unnamed Store"}</p>
                          <span className="text-[10px] font-semibold text-[#8A9A5B] uppercase">GST: {r.gstNumber || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="font-semibold text-xs leading-none">{r.name}</p>
                        <span className="text-[11px] text-foreground/50">{r.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <button
                        onClick={() => toggleApprovalMutation.mutate({ id: r._id, approved: !r.isApproved })}
                        disabled={toggleApprovalMutation.isPending}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          r.isApproved
                            ? "bg-[#8A9A5B]/15 text-[#8A9A5B] hover:bg-amber-100 hover:text-amber-700 hover:content-['toggle']"
                            : "bg-amber-500/15 text-amber-600 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {r.isApproved ? "Approved" : "Pending"}
                      </button>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedRetailer(r)}
                          className="grid h-8 w-8 place-items-center rounded-full text-foreground/60 hover:bg-foreground/5 transition"
                          title="View Store Info"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="grid h-8 w-8 place-items-center rounded-full text-[#8A9A5B] hover:bg-[#8A9A5B]/10 transition"
                          title="Edit Store Metadata"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setRetailerToDelete(r._id)}
                          className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10 transition"
                          title="De-register Store"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Shop Info Dialog */}
      <Dialog open={!!selectedRetailer} onOpenChange={(open) => !open && setSelectedRetailer(null)}>
        <DialogContent className="max-w-md bg-white border border-[#E0CCBA] rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2D2D2D]">Retailer Shop Details</DialogTitle>
            <DialogDescription className="text-xs text-foreground/60">LocalMart full shop credentials report.</DialogDescription>
          </DialogHeader>
          {selectedRetailer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 border-b border-[#E0CCBA]/35 pb-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E0CCBA]/40 text-3xl shadow-soft">
                  🏪
                </div>
                <div>
                  <h4 className="font-bold text-[#2D2D2D] text-base">{selectedRetailer.shopName || "Unnamed Store"}</h4>
                  <p className="text-xs text-foreground/60">Owner: {selectedRetailer.name} · {selectedRetailer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-foreground/45">Store ID</p>
                  <p className="text-[#2D2D2D] mt-0.5 break-all">{selectedRetailer._id}</p>
                </div>
                <div>
                  <p className="text-foreground/45">Verification Status</p>
                  <Badge
                    className={`border-none font-bold rounded-full mt-1 ${
                      selectedRetailer.isApproved ? "bg-[#8A9A5B]/15 text-[#8A9A5B]" : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {selectedRetailer.isApproved ? "Approved Account" : "Pending Approval"}
                  </Badge>
                </div>
                <div>
                  <p className="text-foreground/45">GST registration ID</p>
                  <p className="text-emerald-700 mt-0.5">{selectedRetailer.gstNumber || "Not registered"}</p>
                </div>
                <div>
                  <p className="text-foreground/45">Store Address</p>
                  <p className="text-[#2D2D2D] mt-0.5 leading-relaxed truncate hover:text-clip hover:overflow-visible">
                    {selectedRetailer.address || "No Address Provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedRetailer(null)} className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 w-full font-semibold">
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Retailer Dialog */}
      <Dialog open={!!retailerToEdit} onOpenChange={(open) => !open && setRetailerToEdit(null)}>
        <DialogContent className="max-w-md bg-white border border-[#E0CCBA] rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2D2D2D]">Modify Retailer Account</DialogTitle>
            <DialogDescription className="text-xs text-foreground/60">Configure commercial metadata.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Shop Name</label>
              <Input value={editShop} onChange={(e) => setEditShop(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Owner Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Store Email</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Commercial GSTIN</label>
              <Input value={editGst} onChange={(e) => setEditGst(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" placeholder="e.g. 29GGGGG1314R9Z6" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D]/75">Store Address Location</label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="rounded-xl border-[#E0CCBA] focus-visible:ring-[#8A9A5B]" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRetailerToEdit(null)} className="rounded-full border-[#E0CCBA] hover:bg-[#F5EFE6]/50">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editMutation.isPending} className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 font-semibold">
              Save Store Info
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Store Modal */}
      <Dialog open={!!retailerToDelete} onOpenChange={(open) => !open && setRetailerToDelete(null)}>
        <DialogContent className="max-w-sm bg-white border border-[#E0CCBA] rounded-3xl p-6 shadow-xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <ShieldAlert className="h-10 w-10 text-destructive mb-2" />
            <DialogTitle className="font-display text-lg font-bold text-[#2D2D2D]">Remove Retailer?</DialogTitle>
            <DialogDescription className="text-xs text-foreground/60 mt-1">
              Warning! Purging this retailer account will permanently remove the store metadata and ALL of their products from the LocalMart catalog database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:flex-row items-center gap-2 justify-center w-full mt-4">
            <Button variant="outline" onClick={() => setRetailerToDelete(null)} className="rounded-full border-[#E0CCBA] w-full hover:bg-[#F5EFE6]/50 text-xs font-semibold">
              Cancel Action
            </Button>
            <Button
              onClick={() => retailerToDelete && deleteMutation.mutate(retailerToDelete)}
              disabled={deleteMutation.isPending}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90 w-full text-xs font-semibold"
            >
              Purge Catalog & Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4: ACCOUNT APPROVAL WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
function ApprovalsWorkflow() {
  const queryClient = useQueryClient();
  const { data: retailers = [], isLoading } = useQuery({
    queryKey: ["adminRetailers"],
    queryFn: apiAdmin.getRetailers,
  });

  const pendingRequests = useMemo(() => {
    return retailers.filter((r) => r.isApproved === false);
  }, [retailers]);

  const approveMutation = useMutation({
    mutationFn: apiAdmin.approveRetailer,
    onSuccess: () => {
      toast.success("Retailer has been approved and activated!");
      queryClient.invalidateQueries({ queryKey: ["adminRetailers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to approve retailer."),
  });

  const rejectMutation = useMutation({
    mutationFn: apiAdmin.rejectRetailer,
    onSuccess: () => {
      toast.success("Retailer request rejected/suspended.");
      queryClient.invalidateQueries({ queryKey: ["adminRetailers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to reject retailer."),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-3xl bg-[#E0CCBA]/35" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#E0CCBA]/40 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#2D2D2D]">Verification Approvals</h3>
          <p className="text-xs text-foreground/60">Review shop GST registrations and activate retailer consoles.</p>
        </div>
        <Badge className="bg-[#8A9A5B]/15 text-[#8A9A5B] border-none font-bold px-3 py-1 text-xs">
          {pendingRequests.length} Requests Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {pendingRequests.length === 0 ? (
          <div className="glass rounded-[2rem] bg-white border border-[#E0CCBA]/40 p-12 text-center shadow-soft">
            <CheckCircle2 className="h-12 w-12 text-[#8A9A5B] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#2D2D2D]">Review Queue Clear!</h4>
            <p className="text-xs text-foreground/50 mt-1">There are no pending retailer approval registrations.</p>
          </div>
        ) : (
          pendingRequests.map((req) => (
            <motion.div
              layout
              key={req._id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-[1.5rem] bg-white border border-[#E0CCBA]/40 p-6 shadow-soft"
            >
              <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xl">🏪</span>
                    <h4 className="font-display font-bold text-[#2D2D2D] text-base">{req.shopName || "Pending Shop Name"}</h4>
                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[10px]">
                      Pending Verification
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold pt-1 border-t border-[#E0CCBA]/25">
                    <div>
                      <p className="text-foreground/45">Store Owner Name</p>
                      <p className="text-[#2D2D2D] mt-0.5">{req.name}</p>
                    </div>
                    <div>
                      <p className="text-foreground/45">Email Address</p>
                      <p className="text-[#2D2D2D] mt-0.5">{req.email}</p>
                    </div>
                    <div>
                      <p className="text-foreground/45">Commercial GSTIN Code</p>
                      <p className="text-emerald-700 mt-0.5">{req.gstNumber || "GSTIN code not provided!"}</p>
                    </div>
                    <div>
                      <p className="text-foreground/45">Shop Address Coordinates</p>
                      <p className="text-[#2D2D2D] mt-0.5">{req.address || "Address not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-[#E0CCBA]/35 pt-4 md:pt-0 md:pl-6 shrink-0">
                  <Button
                    onClick={() => approveMutation.mutate(req._id)}
                    disabled={approveMutation.isPending}
                    className="rounded-full bg-[#8A9A5B] text-white hover:bg-[#8A9A5B]/90 px-6 w-full font-semibold h-10 text-xs gap-1.5"
                  >
                    <UserCheck className="h-4 w-4" /> Approve & Activate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => rejectMutation.mutate(req._id)}
                    disabled={rejectMutation.isPending}
                    className="rounded-full border-[#E0CCBA] text-destructive hover:bg-destructive/10 hover:border-destructive/35 px-6 w-full font-semibold h-10 text-xs"
                  >
                    Suspend Request
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5: PLATFORM ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
function PlatformAnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-[2rem] bg-white border border-[#E0CCBA]/40 p-6 shadow-soft">
        <h3 className="font-display text-lg font-bold text-[#2D2D2D]">Detailed Hyperlocal Analytics</h3>
        <p className="text-xs text-foreground/60 mb-6">Detailed analytical tracking across regions.</p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { region: "Koramangala", customers: 120, retailers: 18, orders: 480 },
                { region: "HSR Layout", customers: 85, retailers: 12, orders: 310 },
                { region: "Indiranagar", customers: 140, retailers: 24, orders: 590 },
                { region: "Jayanagar", customers: 95, retailers: 15, orders: 360 },
                { region: "BTM Layout", customers: 70, retailers: 10, orders: 240 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0CCBA/20" />
              <XAxis dataKey="region" stroke="#2D2D2D" fontSize={10} />
              <YAxis stroke="#2D2D2D" fontSize={10} />
              <ChartTooltip contentStyle={{ background: "#F5EFE6", border: "1px solid #E0CCBA", borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="customers" name="Customers" fill="#8A9A5B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retailers" name="Shops" fill="#D6BBA9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" name="Orders Placed" fill="#E0CCBA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6: CONSOLE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function ConsoleSettingsView() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="glass rounded-[2rem] bg-white border border-[#E0CCBA]/40 p-6 shadow-soft space-y-4">
        <h3 className="font-display text-lg font-bold text-[#2D2D2D]">Portal Security Settings</h3>
        <p className="text-xs text-foreground/60 border-b border-[#E0CCBA]/35 pb-4">
          Control platform parameters and JWT expiration variables.
        </p>

        <div className="space-y-3 text-xs font-semibold text-[#2D2D2D]/85">
          <div className="flex items-center justify-between p-3 bg-[#F9F6F0] rounded-xl">
            <div>
              <p>JWT Authorization Expiry</p>
              <span className="text-[10px] text-foreground/45 font-medium">Session expiration time block.</span>
            </div>
            <Badge className="bg-[#8A9A5B] text-white">30 Days</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F9F6F0] rounded-xl">
            <div>
              <p>Hyperlocal Delivery Default Radius</p>
              <span className="text-[10px] text-foreground/45 font-medium">Farthest distance matching limit in km.</span>
            </div>
            <Badge className="bg-[#8A9A5B] text-white">10 Kilometers</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F9F6F0] rounded-xl">
            <div>
              <p>Automatic Retailer Verification</p>
              <span className="text-[10px] text-foreground/45 font-medium">Bypass manual approvals (not recommended).</span>
            </div>
            <Badge className="bg-destructive/15 text-destructive border-none">Deactivated</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
