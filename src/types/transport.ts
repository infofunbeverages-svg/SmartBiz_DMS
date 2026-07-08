export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  model: string;
  capacity: number;
  status: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  documents: {
    type: string;
    url: string;
    expiryDate: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  route: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime?: string;
  status: TripStatus;
  deliveries: {
    orderId: string;
    status: string;
    deliveredAt?: string;
  }[];
  expenses: {
    type: string;
    amount: number;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export enum TripStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  cost: number;
  description: string;
  performedBy: string;
  nextMaintenanceDate?: string;
  attachments: {
    type: string;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
}