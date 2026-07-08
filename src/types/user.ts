export enum UserRole {
  SUPER_ADMIN        = 'SUPER_ADMIN',
  ADMIN              = 'ADMIN',
  SALES_ADMIN        = 'SALES_ADMIN',
  SALES_MANAGER      = 'SALES_MANAGER',
  AREA_SALES_MANAGER = 'AREA_SALES_MANAGER',
  REGIONAL_MANAGER   = 'REGIONAL_MANAGER',
  AGENCY_OWNER       = 'AGENCY_OWNER',
  AGENCY_CLERK       = 'AGENCY_CLERK',   // Phase 0: add karagena thiyenawa
  SALES_REP          = 'SALES_REP',
  CASH_COLLECTOR     = 'CASH_COLLECTOR', // Mode 1 lorry collector
  ACCOUNTANT         = 'ACCOUNTANT',
  MANAGER            = 'MANAGER',
  EMPLOYEE           = 'EMPLOYEE'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  agencyId?: string;          // scoped agency (for AGENCY_OWNER, CLERK, REP)
  managedAgencies?: string[]; // Area Sales Manager walata
  territoryId?: string;
  createdAt: string;
  updatedAt: string;
}
