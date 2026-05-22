import { useSyncExternalStore } from "react";
import { apiAuth, type ApiUser } from "@/lib/api";

export type Role = "customer" | "retailer" | "admin";
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
  isApproved?: boolean;
  shopName?: string;
  gstNumber?: string;
  address?: string;
};

type AuthState = { user: AuthUser | null; loading: boolean; error: string | null };

const TOKEN_KEY = "localmart-token";
const USER_KEY = "localmart-user";

const loadUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initial: AuthState = { user: loadUser(), loading: false, error: null };
let state: AuthState = { ...initial };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Partial<AuthState>) => {
  state = { ...state, ...next };
  emit();
};

const saveUser = (user: AuthUser | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const toAuthUser = (u: ApiUser): AuthUser => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role as Role,
  token: u.token,
  isApproved: u.isApproved,
  shopName: u.shopName,
  gstNumber: u.gstNumber,
  address: u.address,
});

export const auth = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  signup: async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    shopName?: string;
  }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiAuth.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const user = toAuthUser(res);
      saveUser(user);
      set({ user, loading: false });
      return user;
    } catch (e: any) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  login: async (email: string, password: string, _role?: Role) => {
    set({ loading: true, error: null });
    try {
      const res = await apiAuth.login({ email, password });
      const user = toAuthUser(res);
      saveUser(user);
      set({ user, loading: false });
      return user;
    } catch (e: any) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  logout: () => {
    saveUser(null);
    set({ user: null, error: null });
  },
};

export function useAuth<T>(selector: (s: AuthState) => T): T {
  return useSyncExternalStore(
    auth.subscribe,
    () => selector(state),
    () => selector(initial)
  );
}
