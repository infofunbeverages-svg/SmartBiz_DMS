import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAgencyStore } from '../../../stores/agencyStore';
import Select from 'react-select';

interface CreateAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAgencyModal: React.FC<CreateAgencyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    territory: {
      region: '',
      districts: [] as string[]
    },
    salesTarget: 0
  });

  const { createAgency } = useAgencyStore();

  const districtOptions = [
    { value: 'colombo', label: 'Colombo' },
    { value: 'gampaha', label: 'Gampaha' },
    { value: 'kalutara', label: 'Kalutara' },
    { value: 'kandy', label: 'Kandy' },
    { value: 'galle', label: 'Galle' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAgency(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Agency</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Agency Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <Input
              label="Agency Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="col-span-2">
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <Input
              label="Region"
              value={formData.territory.region}
              onChange={(e) => setFormData({
                ...formData,
                territory: { ...formData.territory, region: e.target.value }
              })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Districts
              </label>
              <Select
                isMulti
                options={districtOptions}
                onChange={(selected) => setFormData({
                  ...formData,
                  territory: {
                    ...formData.territory,
                    districts: selected.map(option => option.value)
                  }
                })}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            <Input
              label="Sales Target"
              type="number"
              value={formData.salesTarget}
              onChange={(e) => setFormData({ ...formData, salesTarget: Number(e.target.value) })}
              required
            />
          </div>

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
              icon={<Plus className="h-4 w-4" />}
            >
              Create Agency
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgencyModal;