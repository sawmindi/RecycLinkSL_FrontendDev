import React, { useState, useEffect } from 'react';
import { MapPin, Package, Plus, Tag, Trash2, User2, Weight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import {
  getCollectors,
  getCategories,
  getCollectorCategoryAssignments,
  getPickupRequests,
  createCollectorCategoryAssignment,
  deleteCollectorCategoryAssignment,
  assignCollectorToPickupRequest,
  type Collector,
  type CollectorCategoryAssignment,
  type PickupRequest,
} from '../../../services/AdminService';

export function CollectorAssignmentPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'pickups'>('categories');
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [categoryAssignments, setCategoryAssignments] = useState<CollectorCategoryAssignment[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'pickup' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [eligibleCollectors, setEligibleCollectors] = useState<Collector[]>([]); 

  const [formData, setFormData] = useState({
    collector_id: '',
    category_id: '',
    area: '',
  });

  useEffect(() => {
    fetchCollectors();
    fetchCategories();
    fetchCategoryAssignments();
    fetchPickupRequests();
  }, []);

  const fetchCollectors = async () => {
    try {
      const data = await getCollectors();
      setCollectors(data);
    } catch (err) {
      toast.error('Failed to load collectors');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.map((c) => ({ _id: c._id, name: c.name })));
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchCategoryAssignments = async () => {
    try {
      const data = await getCollectorCategoryAssignments();
      setCategoryAssignments(data);
    } catch (err) {
      toast.error('Failed to load category assignments');
    }
  };

  const fetchPickupRequests = async () => {
    try {
      const data = await getPickupRequests();
      setPickupRequests(data);
    } catch (err) {
      toast.error('Failed to load pickup requests');
    }
  };

  const resetForm = () => {
    setFormData({ collector_id: '', category_id: '', area: '' });
    setSelectedItem(null);
    setEligibleCollectors([]);
  };

  const openModal = (type: 'category' | 'pickup', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);

    if (type === 'pickup' && item) {
      // Find eligible collectors based on the pickup's category
      const pickupCategoryName = item.category_name || item.item_name?.split(' ')[0]; 
      const matchingAssignments = categoryAssignments.filter(
        a => a.category_name.toLowerCase().includes(pickupCategoryName.toLowerCase())
      );
      const eligibleIds = Array.from(new Set(matchingAssignments.map((a) => a.collector_name))); 
      const eligible = collectors.filter((c) => eligibleIds.some((name) => name.includes(c.full_name)));
      setEligibleCollectors(eligible.length > 0 ? eligible : collectors);
    } else {
      setEligibleCollectors(collectors);
    }

    setFormData({
      collector_id: '',
      category_id: '',
      area: item?.citizen_area || item?.area || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.collector_id) {
      toast.error('Please select a collector');
      return;
    }

    if (modalType === 'category') {
      if (!formData.category_id || !formData.area) {
        toast.error('Category and area are required');
        return;
      }

      try {
        await createCollectorCategoryAssignment({
          collector_id: formData.collector_id,
          category_id: formData.category_id,
          area: formData.area.trim(),
        });
        toast.success('Collector assigned to category');
        fetchCategoryAssignments();
      } catch (err: unknown) {
        toast.error((err as Error).message);
      }
    } else if (modalType === 'pickup' && selectedItem) {
      try {
        await assignCollectorToPickupRequest(selectedItem._id, formData.collector_id);
        toast.success(selectedItem.assigned_collector ? 'Collector reassigned' : 'Collector assigned');
        fetchPickupRequests();
      } catch (err: unknown) {
        toast.error((err as Error).message);
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteCategoryAssignment = async (id: string) => {
    if (!confirm('Remove this category assignment?')) return;
    try {
      await deleteCollectorCategoryAssignment(id);
      toast.success('Assignment removed');
      fetchCategoryAssignments();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 mb-1">Collector Assignment</h1>
          <p className="text-sm md:text-base text-gray-600">Assign collectors to categories and pickup requests</p>
        </div>

        {activeTab === 'categories' && (
          <Button 
            className="bg-teal-700 hover:bg-teal-800 text-white gap-2 shrink-0"
            onClick={() => openModal('category')}
          >
            <Plus className="h-4 w-4" />
            New Category Assignment
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'categories' | 'pickups')} className="space-y-6">
        <TabsList className="bg-gray-100 w-full sm:w-auto">
          <TabsTrigger value="categories" className="flex-1 sm:flex-none">Assign to Categories</TabsTrigger>
          <TabsTrigger value="pickups" className="flex-1 sm:flex-none">Assign / Reassign Pickups</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          {/* Mobile cards */}
          <div className="flex flex-col gap-4 md:hidden">
            {categoryAssignments.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No category assignments yet</p>
            ) : categoryAssignments.map((a) => (
              <Card key={a._id} className="border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <User2 className="h-4 w-4 text-teal-700 shrink-0" />
                      <span className="font-semibold text-gray-900 truncate">{a.collector_name}</span>
                    </div>
                    <Badge className={a.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {a.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{a.category_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{a.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{a.assigned_date}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategoryAssignment(a._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold">Assign Collector to Categories</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Collector</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryAssignments.map((a) => (
                      <TableRow key={a._id}>
                        <TableCell className="font-medium">{a.collector_name}</TableCell>
                        <TableCell>{a.category_name}</TableCell>
                        <TableCell>{a.area}</TableCell>
                        <TableCell>{a.assigned_date}</TableCell>
                        <TableCell>
                          <Badge className={a.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCategoryAssignment(a._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categoryAssignments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No category assignments yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pickups Tab */}
        <TabsContent value="pickups">
          {/* Mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {pickupRequests.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No pickup requests found</p>
            ) : pickupRequests.map((req) => (
              <Card key={req._id} className="border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <User2 className="h-4 w-4 text-teal-700 shrink-0" />
                      <span className="font-semibold text-gray-900 truncate">{req.citizen_name}</span>
                    </div>
                    <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{req.citizen_area}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{req.item_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Weight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{req.rough_weight?.toFixed(2) ?? '—'} kg</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-xs">LKR</span>
                      <span>{req.estimated_earnings?.toFixed(2) ?? '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Priority</span>
                      <p className="capitalize font-medium text-gray-800">{req.priority}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Collector</span>
                      <p className="truncate">
                        {req.assigned_collector
                          ? <span className="font-medium text-blue-700">{req.assigned_collector}</span>
                          : <span className="text-gray-400 italic">Unassigned</span>
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal('pickup', req)}
                    >
                      {req.assigned_collector ? 'Reassign' : 'Assign'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Desktop */}
          <Card className="hidden md:block border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold">Pickup Requests (Pending & Assigned)</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Citizen</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Weight (kg)</TableHead>
                      <TableHead>Est. Earnings</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned Collector</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickupRequests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell className="font-medium">{req.citizen_name}</TableCell>
                        <TableCell>{req.citizen_area}</TableCell>
                        <TableCell>{req.item_name}</TableCell>
                        <TableCell>{req.rough_weight?.toFixed(2) || '—'}</TableCell>
                        <TableCell>{req.estimated_earnings?.toFixed(2) || '—'}</TableCell>
                        <TableCell className="capitalize">{req.priority}</TableCell>
                        <TableCell>
                          {req.assigned_collector ? (
                            <span className="font-medium text-blue-700">{req.assigned_collector}</span>
                          ) : (
                            <span className="text-gray-500">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('pickup', req)}
                          >
                            {req.assigned_collector ? 'Reassign' : 'Assign'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pickupRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No pickup requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal for both category & pickup assign/reassign */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'category' 
                ? 'Assign Collector to Category' 
                : (selectedItem?.assigned_collector ? 'Reassign Collector' : 'Assign Collector')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Collector <span className="text-red-600">*</span></Label>
              <Select
                value={formData.collector_id}
                onValueChange={(v) => setFormData(prev => ({ ...prev, collector_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collector" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleCollectors.length > 0 ? (
                    eligibleCollectors.map(c => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.full_name} ({c.area})
                      </SelectItem>
                    ))
                  ) : (
                    collectors.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.full_name} ({c.area})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {eligibleCollectors.length === 0 && modalType === 'pickup' && (
                <p className="text-xs text-orange-700">
                  Note: No specific collector found for this category. Showing all collectors.
                </p>
              )}
            </div>

            {modalType === 'category' && (
              <>
                <div className="space-y-2">
                  <Label>Category <span className="text-red-600">*</span></Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Area <span className="text-red-600">*</span></Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g. Colombo 07"
                  />
                </div>
              </>
            )}

            {modalType === 'pickup' && selectedItem && (
              <div className="p-3 bg-gray-50 rounded-lg border space-y-1.5 text-sm">
                <p><strong>Citizen:</strong> {selectedItem.citizen_name}</p>
                <p><strong>Area:</strong> {selectedItem.citizen_area}</p>
                <p><strong>Item:</strong> {selectedItem.item_name}</p>
                <p><strong>Current Collector:</strong> {selectedItem.assigned_collector || 'None'}</p>
              </div>
            )}

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
                >
                Cancel
              </Button>
              <Button 
                type="submit"
                 className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white"
                 >
                {selectedItem?.assigned_collector ? 'Reassign' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}