import React, { useState } from 'react';
import { Plus, Edit, X, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';


const schedules = [
  {
    id: '1',
    area: 'Colombo 07',
    date: '05/02/2026',
    time: '09:00',
    items: 'Paper, Plastic',
    collector: 'Kasun Silva',
    status: 'Assigned',
  },
  {
    id: '2',
    area: 'Kandy Central',
    date: '06/02/2026',
    time: '10:30',
    items: 'Iron, Glass',
    collector: 'Unassigned',
    status: 'Pending',
  },
  {
    id: '3',
    area: 'Galle Fort',
    date: '07/02/2026',
    time: '14:00',
    items: 'Coconut shells',
    collector: 'Nimal Perera',
    status: 'Assigned',
  },
  {
    id: '4',
    area: 'Negombo',
    date: '08/02/2026',
    time: '11:00',
    items: 'Cardboard',
    collector: 'Ravi Fernando',
    status: 'Completed',
  },
];

export function PickupScheduleManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    area: '',
    date: '',
    time: '',
    items: '',
  });
  const [localSchedules, setLocalSchedules] = useState(schedules);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ area: '', date: '', time: '', items: '' });
    setCurrentSchedule(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (schedule: any) => {
    setCurrentSchedule(schedule);
    setFormData({
      area: schedule.area,
      date: schedule.date,
      time: schedule.time,
      items: schedule.items,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.area || !formData.date || !formData.time || !formData.items) {
      toast.error('Please fill all required fields');
      return;
    }

    if (currentSchedule) {
      // Edit mode
      const updatedSchedules = localSchedules.map((s) =>
        s.id === currentSchedule.id ? { ...s, ...formData } : s
      );
      setLocalSchedules(updatedSchedules);
      toast.success('Schedule updated successfully!');
      setIsEditModalOpen(false);
    } else {
      // Add mode
      const newSchedule = {
        id: Date.now().toString(),
        ...formData,
        collector: 'Unassigned', 
        status: 'Pending',
      };
      setLocalSchedules([...localSchedules, newSchedule]);
      toast.success('New schedule created successfully!');
      setIsAddModalOpen(false);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = localSchedules.filter((s) => s.id !== id);
    setLocalSchedules(updated);
    toast.success('Schedule deleted successfully!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assigned':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Assigned</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Pickup Schedule Management
          </h1>
          <p className="text-lg text-gray-600">
            Your pickup schedules for different areas
          </p>
        </div>

        <Button 
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-700" />
              All Schedules
            </h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-700">Area</TableHead>
                  <TableHead className="font-medium text-gray-700">Date</TableHead>
                  <TableHead className="font-medium text-gray-700">Time</TableHead>
                  <TableHead className="font-medium text-gray-700">Items</TableHead>
                  <TableHead className="font-medium text-gray-700">Collector</TableHead>
                  <TableHead className="font-medium text-gray-700">Status</TableHead>
                  <TableHead className="font-medium text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {localSchedules.map((schedule) => (
                  <TableRow key={schedule.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{schedule.area}</TableCell>
                    <TableCell>{schedule.date}</TableCell>
                    <TableCell>{schedule.time}</TableCell>
                    <TableCell>{schedule.items}</TableCell>
                    <TableCell>{schedule.collector}</TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEditModal(schedule)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the schedule for <strong>{schedule.area}</strong>.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(schedule.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200 text-gray-600">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-teal-700 text-white border-teal-700 hover:bg-teal-800">
                1
              </Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Schedule Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {currentSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
            </Button>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Area */}
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  placeholder="e.g., Colombo 07"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>

              {/* Items */}
              <div className="space-y-2">
                <Label htmlFor="items">Items</Label>
                <Input
                  id="items"
                  placeholder="e.g., Paper, Plastic, Iron"
                  value={formData.items}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>

              {/* Submit */}
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                >
                  {currentSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {localSchedules.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">No schedules created yet</p>
          <p className="mt-3">Click "Add Schedule" to create your first pickup schedule.</p>
        </div>
      )}
    </div>
  );
}