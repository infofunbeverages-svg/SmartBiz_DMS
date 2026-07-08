import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { useOrderStore } from '../../../stores/orderStore';
import { useAuthStore } from '../../../lib/auth';
import { productService } from '../../../lib/supabaseServices';
import { Product } from '../../../types';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const [selectedAgency, setSelectedAgency] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<Array<{ 
    inventoryId: string; 
    quantity: number;
    price: number;
    discount: number;
    isFree: number;
  }>>([{ 
    inventoryId: '', 
    quantity: 1,
    price: 0,
    discount: 0,
    isFree: 0
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createOrder } = useOrderStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await productService.getAll();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { 
      inventoryId: '', 
      quantity: 1,
      price: 0,
      discount: 0,
      isFree: 0
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, inventoryId: string) => {
    const product = products.find(p => p.id === inventoryId);
    const newItems = [...orderItems];
    newItems[index].inventoryId = inventoryId;
    newItems[index].price = product?.price || 0;
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgency || !user) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate totals for each item
      const items = orderItems
        .filter(item => item.inventoryId && item.quantity > 0)
        .map(item => {
          const subtotal = item.price * item.quantity;
          const discountAmount = (subtotal * item.discount) / 100;
          const totalAmount = subtotal - discountAmount;
          
          return {
            inventoryId: item.inventoryId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            isFree: item.isFree,
            totalAmount,
          };
        });

      const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

      await createOrder({
        companyId: selectedAgency,
        draftDate: new Date().toISOString(),
        totalAmount,
        items,
        createdBy: user.id,
      });

      // Reset form
      setSelectedAgency('');
      setOrderItems([{ 
        inventoryId: '', 
        quantity: 1,
        price: 0,
        discount: 0,
        isFree: 0
      }]);
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Agency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agency
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an agency</option>
              <option value="1">Agency 1</option>
              <option value="2">Agency 2</option>
            </select>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              <Button
                type="button"
                variant="secondary"
                icon={<Plus className="h-4 w-4" />}
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Item {index + 1}</span>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <select
                      value={item.inventoryId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - Rs. {product.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <Input
                      type="number"
                      value={item.price}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index].quantity = parseInt(e.target.value);
                        setOrderItems(newItems);
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index].discount = parseInt(e.target.value);
                        setOrderItems(newItems);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Free Issue
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={item.isFree}
                      onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index].isFree = parseInt(e.target.value);
                        setOrderItems(newItems);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;