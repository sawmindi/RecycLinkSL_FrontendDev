import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Package, User2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import {
  getPickupSchedules,
  createPickupSchedule,
  updatePickupSchedule,
  deletePickupSchedule,
  type PickupSchedule,
} from '../../../services/AdminService';

export function PickupScheduleManagementPage() {
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<PickupSchedule | null>(null);

  const [formData, setFormData] = useState({
    area: '',
    schedule_date: '',
    schedule_time: '',
    items: '',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getPickupSchedules();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load schedules');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ area: '', schedule_date: '', schedule_time: '', items: '' });
    setCurrentSchedule(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (schedule: PickupSchedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      area: schedule.area,
      schedule_date: schedule.schedule_date.split('T')[0], 
      schedule_time: schedule.schedule_time,               
      items: schedule.items,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.area || !formData.schedule_date || !formData.schedule_time || !formData.items) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      area: formData.area,
      schedule_date: formData.schedule_date,
      schedule_time: formData.schedule_time,
      items: formData.items,
    };

    try {
      if (currentSchedule) {
        await updatePickupSchedule(currentSchedule._id, payload);
      } else {
        await createPickupSchedule(payload);
      }
      toast.success(currentSchedule ? 'Schedule updated!' : 'Schedule created!');
      resetForm();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchSchedules();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await deletePickupSchedule(id);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assigned':
        return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const ActionButtons = ({ sch }: { sch: PickupSchedule }) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(sch)}>
        <Edit className="h-4 w-4 text-gray-600" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the schedule for <strong>{sch.area}</strong> on {sch.schedule_date}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(sch._id)}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

    const isEmpty = !loading && schedules.length === 0;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-1">
            Pickup Schedule Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage pickup schedules for different areas
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2 shrink-0"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading schedules...</div>
      ) : isEmpty ? (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-lg font-medium">No schedules yet</p>
          <p className="mt-2 text-sm">Click "Add Schedule" to create one.</p>
        </div>
      ) : (
        <>
        <div className="flex flex-col gap-4 md:hidden">
            {schedules.map((sch) => (
              <Card key={sch._id} className="border shadow-sm">
                <CardContent className="p-4 space-y-3">

                  {/* Top row: area + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-teal-700 shrink-0" />
                      <span className="font-semibold text-gray-900 truncate">{sch.area}</span>
                    </div>
                    {getStatusBadge(sch.status)}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{new Date(sch.schedule_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{sch.schedule_time.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 min-w-0">
                      <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{sch.items}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 min-w-0">
                      <User2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      {sch.collector_name
                        ? <span className="font-medium text-blue-700 truncate">{sch.collector_name}</span>
                        : <span className="text-gray-400 italic">Unassigned</span>
                      }
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-1">
                    <ActionButtons sch={sch} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block border-none shadow-lg">
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
                        <TableHead>Area</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Collector</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((sch) => (
                        <TableRow key={sch._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{sch.area}</TableCell>
                          <TableCell>{new Date(sch.schedule_date).toLocaleDateString()}</TableCell>
                          <TableCell>{sch.schedule_time.slice(0, 5)}</TableCell>
                          <TableCell>{sch.items}</TableCell>
                          <TableCell>{sch.collector_name ?? 'Unassigned'}</TableCell>
                          <TableCell>
                          {sch.collector_name
                            ? <span className="font-medium text-blue-700">{sch.collector_name}</span>
                            : <span className="text-gray-400">Unassigned</span>
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(sch.status)}</TableCell>
                        <TableCell className="text-right">
                          <ActionButtons sch={sch} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {currentSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Area</Label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. Colombo 07"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.schedule_date}
                  onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Items (comma separated)</Label>
              <Input
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                placeholder="e.g. Paper, Plastic, Iron"
              />
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white">
                {currentSchedule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}