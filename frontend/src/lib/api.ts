const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("localmart-token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type ApiUser = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "retailer" | "admin";
  token: string;
  isApproved?: boolean;
  shopName?: string;
  gstNumber?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const apiAuth = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => request<ApiUser>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<ApiUser>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  profile: () => request<Omit<ApiUser, "token">>("/users/profile"),
};

// ─── Products ────────────────────────────────────────────────────────────────

export type ApiProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  retailer?: string;
  image?: string;
  deliveryTime: string;
};

export const apiProducts = {
  getAll: (params?: { category?: string; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<ApiProduct[]>(`/products${q ? `?${q}` : ""}`);
  },
  getById: (id: string) => request<ApiProduct>(`/products/${id}`),
  create: (body: Partial<ApiProduct>) =>
    request<ApiProduct>("/products", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<ApiProduct>) =>
    request<ApiProduct>(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export type ApiCartItem = { product: ApiProduct; quantity: number; _id: string };
export type ApiCart = { _id: string; user: string; items: ApiCartItem[] };

export const apiCart = {
  get: () => request<ApiCart>("/cart"),
  add: (productId: string, quantity = 1) =>
    request<ApiCart>("/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  update: (productId: string, quantity: number) =>
    request<ApiCart>(`/cart/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
  remove: (productId: string) =>
    request<ApiCart>(`/cart/${productId}`, { method: "DELETE" }),
  clear: () => request<{ message: string }>("/cart", { method: "DELETE" }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export type ApiOrder = {
  _id: string;
  user: string;
  items: { product: string; name: string; price: number; quantity: number; image?: string }[];
  totalPrice: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  deliveryAddress?: string;
  createdAt: string;
};

export const apiOrders = {
  place: (deliveryAddress?: string) =>
    request<ApiOrder>("/orders", { method: "POST", body: JSON.stringify({ deliveryAddress }) }),
  myOrders: () => request<ApiOrder[]>("/orders"),
  allOrders: () => request<ApiOrder[]>("/orders/all"),
  updateStatus: (id: string, status: ApiOrder["status"]) =>
    request<ApiOrder>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export type ApiAdminStats = {
  totalUsers: number;
  totalRetailers: number;
  approvedRetailers: number;
  pendingRetailers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
};

export type ApiAdminDashboard = {
  stats: ApiAdminStats;
  recentRegistrations: Omit<ApiUser, "token">[];
  recentRetailerRequests: Omit<ApiUser, "token">[];
  recentOrders: (Omit<ApiOrder, "user"> & { user: { name: string; email: string } })[];
};

export const apiAdmin = {
  getDashboard: () => request<ApiAdminDashboard>("/admin/dashboard"),
  getUsers: () => request<Omit<ApiUser, "token">[]>("/admin/users"),
  getRetailers: () => request<Omit<ApiUser, "token">[]>("/admin/retailers"),
  updateUser: (id: string, body: Partial<ApiUser>) =>
    request<Omit<ApiUser, "token">>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteUser: (id: string) => request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),
  approveRetailer: (id: string) =>
    request<{ message: string; retailer: Omit<ApiUser, "token"> }>(`/admin/retailers/${id}/approve`, { method: "PUT" }),
  rejectRetailer: (id: string) =>
    request<{ message: string; retailer: Omit<ApiUser, "token"> }>(`/admin/retailers/${id}/reject`, { method: "PUT" }),
  deleteRetailer: (id: string) =>
    request<{ message: string }>(`/admin/retailers/${id}`, { method: "DELETE" }),
};

// ─── Full Profile Types ───────────────────────────────────────────────────────

export type ApiFullProfile = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "retailer" | "admin";
  profileImage?: string;
  mobileNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  themePreference?: "light" | "dark" | "system";
  lastLogin?: string;
  shopName?: string;
  gstNumber?: string;
  businessAddress?: string;
  deliveryRadius?: number;
  storeDescription?: string;
  openingHours?: string;
  storeLogo?: string;
  storeBanner?: string;
  storeAccentColor?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  storeRating?: number;
  isApproved?: boolean;
  createdAt?: string;
};

// ─── User Profile API ─────────────────────────────────────────────────────────

export const apiUserProfile = {
  get: () => request<ApiFullProfile>("/users/profile"),
  update: (body: Partial<ApiFullProfile>) =>
    request<ApiFullProfile>("/users/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>("/users/change-password", { method: "PUT", body: JSON.stringify(body) }),
  uploadImage: (imageData: string) =>
    request<{ profileImage: string }>("/users/upload-image", { method: "PUT", body: JSON.stringify({ imageData }) }),
  deleteAccount: () => request<{ message: string }>("/users/account", { method: "DELETE" }),
};

// ─── Retailer Profile API ─────────────────────────────────────────────────────

export const apiRetailerProfile = {
  get: () => request<ApiFullProfile>("/retailers/profile"),
  update: (body: Partial<ApiFullProfile>) =>
    request<ApiFullProfile>("/retailers/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>("/retailers/change-password", { method: "PUT", body: JSON.stringify(body) }),
  uploadLogo: (imageData: string) =>
    request<{ storeLogo: string }>("/retailers/upload-logo", { method: "PUT", body: JSON.stringify({ imageData }) }),
  uploadBanner: (imageData: string) =>
    request<{ storeBanner: string }>("/retailers/upload-banner", { method: "PUT", body: JSON.stringify({ imageData }) }),
  deleteAccount: () => request<{ message: string }>("/retailers/account", { method: "DELETE" }),
};
