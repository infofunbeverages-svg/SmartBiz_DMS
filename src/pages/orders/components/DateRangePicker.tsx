import React from 'react';
import { Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="date"
        value={startDate ? startDate.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange({ 
          start: e.target.value ? new Date(e.target.value) : null, 
          end: endDate 
        })}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={endDate ? endDate.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange({ 
          start: startDate, 
          end: e.target.value ? new Date(e.target.value) : null 
        })}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button
        variant="secondary"
        icon={<Calendar className="h-4 w-4" />}
        onClick={() => onChange({ start: null, end: null })}
      >
        Clear
      </Button>
    </div>
  );
};

export default DateRangePicker;