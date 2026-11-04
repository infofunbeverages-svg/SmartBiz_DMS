import { create } from 'zustand';
import { User } from '../types';
import { UserRole } from '../types/user';
import { supabase } from './supabase';

// ── Helpers ───────────────────────────────────────────────

const normalizeRole = (role: string | null | undefined): UserRole => {
  if (!role) return UserRole.SALES_REP;
  const r = role.toUpperCase().trim();
  // Bug fix: database eke 'REP' kiyala thiyena rows 'SALES_REP' widihata treat karanawa
  if (r === 'REP') return UserRole.SALES_REP;
  if (Object.values(UserRole).includes(r as UserRole)) return r as UserRole;
  console.warn(`Invalid role "${role}" — defaulting to SALES_REP`);
  return UserRole.SALES_REP;
};

/** Profile DB row → User object (DRY — login ekai checkSession ekai deka use karanawa) */
const mapProfileToUser = (
  profile: Record<string, unknown>,
  authUser: { id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> }
): User => ({
  id:               profile.id as string,
  username:         (authUser.email ?? '').split('@')[0] || 'user',
  name:             (profile.full_name as string) || authUser.email || 'User',
  email:            authUser.email ?? '',
  role:             normalizeRole(profile.role as string),
  companyId:        (profile.company_id as string) || undefined,
  agencyId:         (profile.agency_id as string) || undefined,
  managedAgencies:  (profile.managed_agencies as string[]) || undefined,
  territoryId:      (profile.territory_id as string) || undefined,
  createdAt:        authUser.created_at,
  updatedAt:        new Date().toISOString(),
});

// ── Store ─────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (roles: UserRole[]) => boolean;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        // Profile naha — create karanawa (Bug fix: role 'REP' → 'SALES_REP')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id:        session.user.id,
            full_name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'User',
            role:      'SALES_REP', // Bug fix: kalin 'REP' kiyala thiuna
            company_id: null,
          })
          .select()
          .single();

        if (createError || !newProfile) {
          // Fallback — still allow login
          const fallback: User = {
            id:        session.user.id,
            username:  (session.user.email ?? '').split('@')[0],
            name:      session.user.email ?? 'User',
            email:     session.user.email ?? '',
            role:      UserRole.SALES_REP,
            createdAt: session.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          set({ user: fallback, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: mapProfileToUser(newProfile, session.user), isAuthenticated: true, isLoading: false });
        }
      } else {
        set({ user: mapProfileToUser(profile, session.user), isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      console.error('checkSession error:', err);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        let msg = 'Invalid email or password';
        if (error.status === 400) {
          if (error.message?.includes('Invalid login credentials'))
            msg = 'Invalid email or password. Please check your credentials.';
          else if (error.message?.includes('Email not confirmed'))
            msg = 'Please confirm your email before logging in.';
          else if (error.message?.includes('Email rate limit exceeded'))
            msg = 'Too many login attempts. Please try again later.';
          else
            msg = `Login failed: ${error.message}`;
        } else if (error.status === 429) {
          msg = 'Too many requests. Please try again later.';
        } else if (error.status === 500) {
          msg = 'Server error. Please try again later.';
        }
        set({ error: msg, isLoading: false });
        return;
      }

      if (!data.user) {
        set({ error: 'Login failed — no user returned.', isLoading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        // Bug fix: role 'REP' → 'SALES_REP'
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id:        data.user.id,
            full_name: data.user.user_metadata?.name ?? data.user.email?.split('@')[0] ?? 'User',
            role:      'SALES_REP',
            company_id: null,
          })
          .select()
          .single();

        if (createError || !newProfile) {
          const fallback: User = {
            id:        data.user.id,
            username:  (data.user.email ?? '').split('@')[0],
            name:      data.user.email ?? 'User',
            email:     data.user.email ?? '',
            role:      UserRole.SALES_REP,
            createdAt: data.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          set({ user: fallback, isAuthenticated: true, isLoading: false, error: null });
        } else {
          set({ user: mapProfileToUser(newProfile, data.user), isAuthenticated: true, isLoading: false, error: null });
        }
      } else {
        set({ user: mapProfileToUser(profile, data.user), isAuthenticated: true, isLoading: false, error: null });
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'An unexpected error occurred';
      console.error('login error:', err);
      set({ error: msg, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('logout error:', err);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  hasPermission: (roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
