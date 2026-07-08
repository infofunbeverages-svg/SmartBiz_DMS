import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Search, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

const AgencyManagement = () => {
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    distributor_name: '',
    id_number: '',
    location: '',
    contact_number: '',
    admin_email: '',
    password: ''
  });

  useEffect(() => { fetchAgencies(); }, []);

  const fetchAgencies = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (data) setAgencies(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create Agency in Supabase
      const { data: agencyData, error: agencyError } = await supabase
        .from('companies')
        .insert([{
          name: formData.name,
          distributor_name: formData.distributor_name,
          id_number: formData.id_number,
          location: formData.location,
          contact_number: formData.contact_number,
          admin_email: formData.admin_email
        }]).select().single();

      if (agencyError) throw agencyError;

      alert("Agency Created Successfully in Database!");
      setIsModalOpen(false);
      fetchAgencies();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-sans">Agencies Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Add New Agency</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agencies.map((agency: any) => (
          <div key={agency.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between">
            <div>
              <p className="font-bold text-lg">{agency.name}</p>
              <p className="text-sm text-gray-500">Distributor: {agency.distributor_name}</p>
              <p className="text-sm text-gray-500">ID: {agency.id_number}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">New Agency Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Agency Name</label>
                <input className="w-full p-2 border rounded" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Distributor Name</label>
                <input className="w-full p-2 border rounded" required value={formData.distributor_name} onChange={e => setFormData({...formData, distributor_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">ID Number</label>
                <input className="w-full p-2 border rounded" required value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input className="w-full p-2 border rounded" type="email" required value={formData.admin_email} onChange={e => setFormData({...formData, admin_email: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyManagement;