import React, { useState, useEffect } from 'react';
import { Store, Plus, X, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

const ShopsDashboard: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', owner_name: '', phone: '', address: '', area: '',
    shop_type: 'Retail', agency_id: '', credit_limit: 0,
  });

  useEffect(() => { fetchShops(); fetchAgencies(); }, []);

  const fetchShops = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
    if (data) setShops(data);
    setIsLoading(false);
  };

  const fetchAgencies = async () => {
    const { data } = await supabase.from('agencies').select('id, name');
    if (data) setAgencies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agency_id) { alert('Please select an agency'); return; }
    try {
      const { error } = await supabase.from('shops').insert([formData]);
      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ name: '', owner_name: '', phone: '', address: '', area: '', shop_type: 'Retail', agency_id: '', credit_limit: 0 });
      fetchShops();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const activeShops = shops.filter(s => s.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shops Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage retail outlets</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="primary" icon={<Plus />} onClick={() => setIsModalOpen(true)}>Add Shop</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6">
          <p className="text-sm text-gray-500">Total Shops</p>
          <h3 className="text-xl font-bold text-gray-900">{shops.length}</h3>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-gray-500">Active Shops</p>
          <h3 className="text-xl font-bold text-gray-900">{activeShops}</h3>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-gray-500">Agencies Linked</p>
          <h3 className="text-xl font-bold text-gray-900">{new Set(shops.map(s => s.agency_id)).size}</h3>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Shops</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : shops.length === 0 ? (
            <p className="text-gray-500">No shops yet. Click "Add Shop" to create one.</p>
          ) : (
            <div className="space-y-3">
              {shops.map(shop => (
                <div key={shop.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{shop.area || '-'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${shop.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {shop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">New Shop</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Agency *</label>
                <select required className="w-full p-2 border rounded" value={formData.agency_id} onChange={e => setFormData({ ...formData, agency_id: e.target.value })}>
                  <option value="">-- Select Agency --</option>
                  {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Shop Name *</label>
                <input required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Owner Name</label>
                <input className="w-full p-2 border rounded" value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Area</label>
                <input className="w-full p-2 border rounded" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Shop Type</label>
                <select className="w-full p-2 border rounded" value={formData.shop_type} onChange={e => setFormData({ ...formData, shop_type: e.target.value })}>
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>HORECA</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Credit Limit</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.credit_limit} onChange={e => setFormData({ ...formData, credit_limit: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Save Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopsDashboard;
