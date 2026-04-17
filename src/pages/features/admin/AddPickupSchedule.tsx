import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

export function AddPickupSchedule() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    area: '',
    date: '',
    time: '',
    items: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area || !formData.date || !formData.time || !formData.items) {
      toast.error('Please fill all required fields');
      return;
    }

    // console.log('New schedule:', formData);

    toast.success('Schedule created successfully!');
    navigate('/admin/pickup-schedules');
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-gray-900">
          Add New Schedule
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/pickup-schedules')}
        >
          <X className="h-6 w-6 text-gray-700" />
        </Button>
      </div>

      {/* Form Card */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                name="area"
                placeholder="e.g., Colombo 07"
                value={formData.area}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label htmlFor="items">Items</Label>
              <Input
                id="items"
                name="items"
                placeholder="e.g., Paper, Plastic, Iron"
                value={formData.items}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white px-10 py-6 text-lg"
              >
                Create Schedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}