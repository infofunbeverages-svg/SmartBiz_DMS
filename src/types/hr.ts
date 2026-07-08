export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  salary: number;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents: {
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export enum Department {
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  HR = 'HR',
  OPERATIONS = 'OPERATIONS',
  IT = 'IT',
  MANAGEMENT = 'MANAGEMENT',
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewPeriod: string;
  goals: {
    description: string;
    status: 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED';
    score: number;
  }[];
  competencies: {
    name: string;
    rating: number;
    comments?: string;
  }[];
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  reviewerId: string;
  status: 'DRAFT' | 'COMPLETED' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingName: string;
  provider: string;
  startDate: string;
  endDate: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  certificateUrl?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
}