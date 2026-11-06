import React, { useState, useEffect } from 'react';
import { Building, Plus, X, Edit2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

const AgencyManagement = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', owner_name: '', phone: '', email: '',
    address: '', area: '', region: '', credit_limit: 0,
    order_type: 'BOOKING',
  });

  useEffect(() => { fetchAgencies(); }, []);

  const fetchAgencies = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    if (data) setAgencies(data);
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', owner_name: '', phone: '', email: '', address: '', area: '', region: '', credit_limit: 0, order_type: 'BOOKING' });
    setIsModalOpen(true);
  };

  const openEdit = (agency: any) => {
    setEditingId(agency.id);
    setFormData({
      name: agency.name ?? '', owner_name: agency.owner_name ?? '', phone: agency.phone ?? '',
      email: agency.email ?? '', address: agency.address ?? '', area: agency.area ?? '',
      region: agency.region ?? '', credit_limit: agency.credit_limit ?? 0,
      order_type: agency.order_type ?? 'BOOKING',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('agencies').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('agencies').insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchAgencies();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-sans">Agencies Management</h1>
        <Button onClick={openCreate} className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Add New Agency</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : agencies.length === 0 ? (
        <p className="text-gray-500">No agencies yet. Click "Add New Agency" to create one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {agencies.map((agency: any) => (
            <div key={agency.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-lg flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" /> {agency.name}
                </p>
                <p className="text-sm text-gray-500">Owner: {agency.owner_name || '-'}</p>
                <p className="text-sm text-gray-500">{agency.area || ''} {agency.region ? `(${agency.region})` : ''}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${agency.order_type === 'DIRECT_DELIVERY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {agency.order_type === 'DIRECT_DELIVERY' ? 'Direct Delivery (Lorry)' : 'Booking (SFA)'}
                </span>
              </div>
              <Button variant="secondary" onClick={() => openEdit(agency)}><Edit2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">{editingId ? 'Edit Agency' : 'New Agency'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Agency Name *</label>
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
                <label className="text-sm font-medium">Email</label>
                <input type="email" className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Area</label>
                  <input className="w-full p-2 border rounded" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Region</label>
                  <input className="w-full p-2 border rounded" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Credit Limit</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.credit_limit} onChange={e => setFormData({ ...formData, credit_limit: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Order Type *</label>
                <select className="w-full p-2 border rounded" value={formData.order_type} onChange={e => setFormData({ ...formData, order_type: e.target.value })}>
                  <option value="BOOKING">Booking (Rep books → delivery → actual sale)</option>
                  <option value="DIRECT_DELIVERY">Direct Delivery (Lorry loading sheet = live bill)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Can be changed anytime by editing this agency.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                  {editingId ? 'Update Agency' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyManagement;
