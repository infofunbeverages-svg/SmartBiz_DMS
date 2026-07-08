export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  owner: string;
  location: {
    latitude: number;
    longitude: number;
  };
  routeId: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
  isActive: boolean;
}