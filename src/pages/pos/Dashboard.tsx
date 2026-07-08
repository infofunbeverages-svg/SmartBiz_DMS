import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CreditCard, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { productService } from '../../lib/supabaseServices';
import { Product } from '../../types/inventory';

interface CartItem { product: Product; qty: number; }

type PayMethod = 'CASH' | 'CARD' | 'DIGITAL';

const POSDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [search, setSearch]     = useState('');
  const [payment, setPayment]   = useState<PayMethod>('CASH');
  const [tendered, setTendered] = useState('');
  const [isOnline]              = useState(navigator.onLine);
  const [completing, setComp]   = useState(false);
  const [receipt, setReceipt]   = useState<{ items: CartItem[]; total: number; method: PayMethod; change: number } | null>(null);

  useEffect(() => {
    productService.getAll()
      .then(setProducts)
      .catch(() => {
        // Offline — try localStorage cache
        const cached = localStorage.getItem('pos_products_cache');
        if (cached) setProducts(JSON.parse(cached));
      });
  }, []);

  // Cache products for offline use
  useEffect(() => {
    if (products.length) localStorage.setItem('pos_products_cache', JSON.stringify(products));
  }, [products]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.product.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const total    = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const change   = Math.max(0, Number(tendered) - total);

  const handleComplete = async () => {
    if (!cart.length) return;
    setComp(true);
    await new Promise(r => setTimeout(r, 600));
    setReceipt({ items: [...cart], total, method: payment, change });
    setCart([]);
    setTendered('');
    setComp(false);
  };

  if (receipt) return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white border rounded-lg p-6 font-mono text-sm" id="pos-receipt">
        <div className="text-center mb-4">
          <p className="font-bold text-lg">RECEIPT</p>
          <p className="text-xs text-gray-400">{new Date().toLocaleString('si-LK')}</p>
        </div>
        <div className="border-t border-dashed pt-3 mb-3">
          {receipt.items.map((c, i) => (
            <div key={i} className="flex justify-between text-xs mb-1">
              <span>{c.product.name} x{c.qty}</span>
              <span>Rs. {(c.product.price * c.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed pt-3 space-y-1">
          <div className="flex justify-between font-bold"><span>TOTAL</span><span>Rs. {receipt.total.toLocaleString()}</span></div>
          <div className="flex justify-between text-xs text-gray-500"><span>Payment</span><span>{receipt.method}</span></div>
          {receipt.method === 'CASH' && receipt.change > 0 && (
            <div className="flex justify-between text-xs"><span>Change</span><span>Rs. {receipt.change.toLocaleString()}</span></div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">ස්තූතියි!</p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}><Printer size={14} className="mr-1" />Print</Button>
        <Button className="flex-1" onClick={() => setReceipt(null)}>New Sale</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full max-h-screen">
      {/* Product grid */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">POS Terminal</h1>
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {isOnline ? <><Wifi size={10} />Online</> : <><WifiOff size={10} />Offline</>}
          </span>
        </div>

        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Product search (name / SKU)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto flex-1 pb-4">
          {filtered.map(p => (
            <button key={p.id}
              className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-blue-400 hover:shadow-sm transition-all active:scale-95"
              onClick={() => addToCart(p)}>
              <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.sku}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">Rs. {p.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart + checkout */}
      <div className="lg:w-80 flex flex-col bg-white rounded-xl border border-gray-200 p-4 gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Cart ({cart.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-64 lg:max-h-none">
          {!cart.length && <p className="text-center text-gray-400 py-6 text-sm">Products add කරන්න</p>}
          {cart.map(c => (
            <div key={c.product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{c.product.name}</p>
                <p className="text-xs text-gray-500">Rs. {c.product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(c.product.id, -1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"><Minus size={12} /></button>
                <span className="text-xs font-medium w-5 text-center">{c.qty}</span>
                <button onClick={() => updateQty(c.product.id, 1)} className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200"><Plus size={12} /></button>
              </div>
              <button onClick={() => setCart(prev => prev.filter(ci => ci.product.id !== c.product.id))} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-xl font-bold text-gray-900">Rs. {total.toLocaleString()}</span>
          </div>

          {/* Payment method */}
          <div className="flex gap-1">
            {(['CASH', 'CARD', 'DIGITAL'] as PayMethod[]).map(m => (
              <button key={m}
                className={`flex-1 py-1.5 rounded text-xs font-medium border-2 transition-colors ${payment === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                onClick={() => setPayment(m)}>{m}</button>
            ))}
          </div>

          {payment === 'CASH' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tendered Amount</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={tendered} onChange={e => setTendered(e.target.value)} placeholder="0.00" />
              {tendered && Number(tendered) >= total && (
                <p className="text-xs text-green-600 mt-1">Change: Rs. {change.toLocaleString()}</p>
              )}
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleComplete}
            disabled={!cart.length || completing || (payment === 'CASH' && tendered !== '' && Number(tendered) < total)}>
            <CreditCard size={16} className="mr-2" />
            {completing ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;
