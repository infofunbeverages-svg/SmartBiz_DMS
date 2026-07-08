export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stock {
  id: string;
  inventoryId: string;
  quantity: number;
  location: string;
  minQuantity: number;
  maxQuantity: number;
  lastRestockDate: Date;
  updatedAt: Date;
}