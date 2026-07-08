import { create } from 'zustand';
import { Agency, AgencyUser } from '../types/agency';
import { supabase } from '../lib/supabase';

interface AgencyState {
  agencies:      Agency[];
  currentAgency: Agency | null;
  agencyUsers:   AgencyUser[];
  isLoading:     boolean;
  error:         string | null;

  fetchAgencies:     () => Promise<void>;
  fetchAgencyUsers:  (agencyId: string) => Promise<void>;
  setCurrentAgency:  (agency: Agency) => void;
  createAgency:      (agency: Partial<Agency>) => Promise<void>;
  updateAgency:      (id: string, data: Partial<Agency>) => Promise<void>;
  deleteAgency:      (id: string) => Promise<void>;
  createAgencyUser:  (user: Partial<AgencyUser>) => Promise<void>;
  updateAgencyUser:  (id: string, data: Partial<AgencyUser>) => Promise<void>;
  deleteAgencyUser:  (id: string) => Promise<void>;
}

export const useAgencyStore = create<AgencyState>((set, get) => ({
  agencies:      [],
  currentAgency: null,
  agencyUsers:   [],
  isLoading:     false,
  error:         null,

  fetchAgencies: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('agencies').select('*').order('name', { ascending: true });
      if (error) throw error;
      set({ agencies: (data ?? []).map(mapAgency), isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchAgencyUsers: async (agencyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('agency_users').select('*, profiles(full_name, email)').eq('agency_id', agencyId);
      if (error) throw error;
      set({ agencyUsers: (data ?? []).map(mapAgencyUser), isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  setCurrentAgency: (agency) => set({ currentAgency: agency }),

  createAgency: async (agency) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('agencies')
        .insert({
          name:         agency.name,
          code:         agency.code,
          address:      agency.address ?? null,
          phone:        agency.phone ?? null,
          email:        agency.email ?? null,
          owner_id:     agency.ownerId ?? null,
          region:       agency.territory?.region ?? null,
          districts:    agency.territory?.districts ?? [],
          credit_limit: agency.creditLimit ?? 0,
          sales_target: agency.salesTarget ?? 0,
          status:       agency.status ?? 'ACTIVE',
        })
        .select().single();
      if (error) throw error;
      set(state => ({ agencies: [...state.agencies, mapAgency(data)], isLoading: false }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  updateAgency: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.name)        patch.name         = data.name;
      if (data.address)     patch.address      = data.address;
      if (data.phone)       patch.phone        = data.phone;
      if (data.email)       patch.email        = data.email;
      if (data.status)      patch.status       = data.status;
      if (data.salesTarget) patch.sales_target = data.salesTarget;
      if (data.creditLimit) patch.credit_limit = data.creditLimit;
      if (data.territory) {
        patch.region    = data.territory.region;
        patch.districts = data.territory.districts;
      }

      const { data: updated, error } = await supabase.from('agencies').update(patch).eq('id', id).select().single();
      if (error) throw error;

      set(state => ({
        agencies:      state.agencies.map(a => a.id === id ? mapAgency(updated) : a),
        currentAgency: state.currentAgency?.id === id ? mapAgency(updated) : state.currentAgency,
        isLoading:     false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteAgency: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('agencies').delete().eq('id', id);
      if (error) throw error;
      set(state => ({ agencies: state.agencies.filter(a => a.id !== id), isLoading: false }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createAgencyUser: async (user) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('agency_users')
        .insert({ agency_id: user.agencyId, user_id: user.userId, role: user.role, districts: user.territory?.districts ?? [], routes: user.territory?.routes ?? [], status: user.status ?? 'ACTIVE' })
        .select('*, profiles(full_name, email)').single();
      if (error) throw error;
      set(state => ({ agencyUsers: [...state.agencyUsers, mapAgencyUser(data)], isLoading: false }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  updateAgencyUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.role)   patch.role   = data.role;
      if (data.status) patch.status = data.status;
      if (data.territory) {
        patch.districts = data.territory.districts;
        patch.routes    = data.territory.routes;
      }
      const { data: updated, error } = await supabase.from('agency_users').update(patch).eq('id', id).select('*, profiles(full_name, email)').single();
      if (error) throw error;
      set(state => ({ agencyUsers: state.agencyUsers.map(u => u.id === id ? mapAgencyUser(updated) : u), isLoading: false }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteAgencyUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('agency_users').delete().eq('id', id);
      if (error) throw error;
      set(state => ({ agencyUsers: state.agencyUsers.filter(u => u.id !== id), isLoading: false }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));

// ── Mappers ──────────────────────────────────────────────

function mapAgency(a: Record<string, unknown>): Agency {
  return {
    id:          a.id as string,
    name:        a.name as string,
    code:        a.code as string,
    address:     (a.address as string) ?? '',
    phone:       (a.phone as string) ?? '',
    email:       (a.email as string) ?? '',
    ownerId:     (a.owner_id as string) ?? '',
    territory: {
      region:    (a.region as string) ?? '',
      districts: (a.districts as string[]) ?? [],
    },
    creditLimit: (a.credit_limit as number) ?? 0,
    status:      (a.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
    salesTarget: (a.sales_target as number) ?? 0,
    createdAt:   a.created_at as string,
    updatedAt:   a.updated_at as string,
  };
}

function mapAgencyUser(u: Record<string, unknown>): AgencyUser {
  const profile = u.profiles as Record<string, unknown> | null;
  return {
    id:       u.id as string,
    agencyId: u.agency_id as string,
    userId:   u.user_id as string,
    name:     (profile?.full_name as string) ?? '',
    email:    (profile?.email as string) ?? '',
    role:     u.role as AgencyUser['role'],
    territory: {
      districts: (u.districts as string[]) ?? [],
      routes:    (u.routes as string[]) ?? [],
    },
    status:    (u.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
    createdAt: u.created_at as string,
    updatedAt: u.updated_at as string,
  };
}
