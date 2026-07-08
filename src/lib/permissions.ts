import { UserRole } from '../types/user';
import { User } from '../types/user';

/**
 * Role-based permission helpers
 * ──────────────────────────────
 * DMS eke visibility hierarchy:
 *   Agency Clerk → Agency Owner → Area Sales Manager → Sales Manager → Super Admin
 *
 * Edit permission: Super Admin witharak — baaki okkoma view-only.
 * Exception: Bill edit approval → Agency Owner ata.
 */

// ── View permissions ──────────────────────────────────────

/** Agency-wise data (bookings, deliveries, sales) balanna puluwan roles */
export const AGENCY_VIEW_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.SALES_ADMIN,
  UserRole.SALES_MANAGER,
  UserRole.AREA_SALES_MANAGER,
  UserRole.REGIONAL_MANAGER,
  UserRole.AGENCY_OWNER,
  UserRole.AGENCY_CLERK,
  UserRole.CASH_COLLECTOR,
  UserRole.SALES_REP,
];

/** GPS tracking / rep route history balanna puluwan roles */
export const GPS_VIEW_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.SALES_MANAGER,
  UserRole.AREA_SALES_MANAGER,
  UserRole.REGIONAL_MANAGER,
  UserRole.AGENCY_OWNER,
];

/** Bill edit approval request approve/reject karanna puluwan roles */
export const BILL_APPROVAL_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.AGENCY_OWNER,
];

/** Lorry Loading Sheet generate + print karanna puluwan roles */
export const LOADING_SHEET_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.AGENCY_OWNER,
  UserRole.AGENCY_CLERK,
];

// ── Edit permissions ──────────────────────────────────────

/** Data edit karanna puluwan roles — Super Admin witharak */
export const EDIT_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
];

// ── Helper functions ──────────────────────────────────────

/** User kenekulata oya permission eka thiyenawada */
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/** Super Admin / Admin da kiyala check */
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
}

/** Data edit karanna puluwanda */
export function canEdit(user: User | null): boolean {
  return hasRole(user, EDIT_ROLES);
}

/** Agency data balanna puluwanda (own scope) */
export function canViewAgencyData(user: User | null): boolean {
  return hasRole(user, AGENCY_VIEW_ROLES);
}

/** Bill approval karanna puluwanda */
export function canApproveBillEdit(user: User | null): boolean {
  return hasRole(user, BILL_APPROVAL_ROLES);
}

/** Loading sheet generate/print karanna puluwanda */
export function canManageLoadingSheet(user: User | null): boolean {
  return hasRole(user, LOADING_SHEET_ROLES);
}

/** GPS map balanna puluwanda */
export function canViewGPS(user: User | null): boolean {
  return hasRole(user, GPS_VIEW_ROLES);
}

/**
 * User eke scope eka resolve karanawa:
 * - SUPER_ADMIN/ADMIN → okkoma agencies
 * - SALES_MANAGER/AREA_MANAGER → managedAgencies
 * - AGENCY_OWNER/CLERK/REP → own agencyId witharak
 */
export function resolveUserScope(user: User | null): {
  isGlobal: boolean;
  agencyIds: string[];
} {
  if (!user) return { isGlobal: false, agencyIds: [] };

  if (isSuperAdmin(user)) {
    return { isGlobal: true, agencyIds: [] };
  }

  if (
    user.role === UserRole.SALES_MANAGER ||
    user.role === UserRole.AREA_SALES_MANAGER ||
    user.role === UserRole.REGIONAL_MANAGER ||
    user.role === UserRole.SALES_ADMIN
  ) {
    return {
      isGlobal: false,
      agencyIds: user.managedAgencies ?? [],
    };
  }

  // AGENCY_OWNER, CLERK, REP, CASH_COLLECTOR → own agency
  if (user.agencyId) {
    return { isGlobal: false, agencyIds: [user.agencyId] };
  }

  return { isGlobal: false, agencyIds: [] };
}

/** Role ekata display label eka */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]:        'Super Admin',
    [UserRole.ADMIN]:              'Admin',
    [UserRole.SALES_ADMIN]:        'Sales Admin',
    [UserRole.SALES_MANAGER]:      'Sales Manager',
    [UserRole.AREA_SALES_MANAGER]: 'Area Sales Manager',
    [UserRole.REGIONAL_MANAGER]:   'Regional Manager',
    [UserRole.AGENCY_OWNER]:       'Agency Owner',
    [UserRole.AGENCY_CLERK]:       'Agency Clerk',
    [UserRole.SALES_REP]:          'Sales Representative',
    [UserRole.CASH_COLLECTOR]:     'Cash Collector',
    [UserRole.ACCOUNTANT]:         'Accountant',
    [UserRole.MANAGER]:            'Manager',
    [UserRole.EMPLOYEE]:           'Employee',
  };
  return labels[role] ?? role;
}

/** View-only role da kiyala check — UI eke Edit/Delete buttons hide karanna */
export function isViewOnly(user: User | null): boolean {
  return !canEdit(user);
}
