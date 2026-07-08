import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Product } from '../../../types';

interface StockLevelsProps {
  products: Product[];
}

const StockLevels: React.FC<StockLevelsProps> = ({ products }) => {
  // Simulate stock levels for demo
  const lowStockProducts = products.slice(0, 5).map(product => ({
    ...product,
    stockLevel: Math.floor(Math.random() * 10),
    threshold: 15
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alert</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    product.stockLevel === 0 ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500">
                  {product.stockLevel} units left
                </p>
              </div>
              <div className="ml-4">
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stockLevel === 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {product.stockLevel === 0 ? 'Out of Stock' : 'Low Stock'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockLevels;