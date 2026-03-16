import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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

interface Collector {
  id: number;
  full_name: string;
  area: string;
}

interface Category {
  id: number;
  name: string;
}

interface CategoryAssignment {
  id: number;
  collector_name: string;
  category_name: string;
  area: string;
  assigned_date: string;
  status: string;
}

interface PickupRequest {
  id: number;
  citizen_name: string;
  citizen_area: string;
  item_name: string;
  category_name?: string; 
  rough_weight: number;
  priority: string;
  estimated_earnings: number;
  status: string;
  assigned_collector?: string;
  created_at: string;
}

export function CollectorAssignmentPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'pickups'>('categories');
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryAssignments, setCategoryAssignments] = useState<CategoryAssignment[]>([]);
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
      const res = await fetch('http://localhost:4000/api/collectors');
      const data = await res.json();
      setCollectors(data);
    } catch (err) {
      toast.error('Failed to load collectors');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories/admin');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchCategoryAssignments = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/collector-category-assignments');
      const data = await res.json();
      setCategoryAssignments(data);
    } catch (err) {
      toast.error('Failed to load category assignments');
    }
  };

  const fetchPickupRequests = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/pickup-requests/admin');
      const data = await res.json();
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
      const eligibleIds = [...new Set(matchingAssignments.map(a => a.collector_name))]; 
      const eligible = collectors.filter(c => eligibleIds.some(name => name.includes(c.full_name)));
      setEligibleCollectors(eligible.length > 0 ? eligible : collectors);
    } else {
      setEligibleCollectors(collectors);
    }

    setFormData({
      collector_id: '',
      category_id: item?.category_id?.toString() || '',
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
        const res = await fetch('http://localhost:4000/api/collector-category-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collector_id: Number(formData.collector_id),
            category_id: Number(formData.category_id),
            area: formData.area.trim(),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to assign');
        }

        toast.success('Collector assigned to category');
        fetchCategoryAssignments();
      } catch (err: any) {
        toast.error(err.message);
      }
    } else if (modalType === 'pickup' && selectedItem) {
      try {
        const res = await fetch(`http://localhost:4000/api/pickup-requests/${selectedItem.id}/assign-collector`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collector_id: Number(formData.collector_id) }),
        });

        if (!res.ok) throw new Error('Failed to assign/reassign');

        toast.success(selectedItem.assigned_collector ? 'Collector reassigned' : 'Collector assigned');
        fetchPickupRequests();
      } catch (err: any) {
        toast.error(err.message);
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteCategoryAssignment = async (id: number) => {
    if (!confirm('Remove this category assignment?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/collector-category-assignments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Assignment removed');
      fetchCategoryAssignments();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">Collector Assignment</h1>
          <p className="text-lg text-gray-600">Assign collectors to categories and pickup requests</p>
        </div>

        {activeTab === 'categories' && (
          <Button 
            className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
            onClick={() => openModal('category')}
          >
            <Plus className="h-4 w-4" />
            New Category Assignment
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="categories">Assign to Categories</TabsTrigger>
          <TabsTrigger value="pickups">Assign / Reassign Pickups</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card className="border-none shadow-lg">
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
                      <TableRow key={a.id}>
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
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCategoryAssignment(a.id)}>
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
          <Card className="border-none shadow-lg">
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
                      <TableRow key={req.id}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'category' 
                ? 'Assign Collector to Category' 
                : (selectedItem?.assigned_collector ? 'Reassign Collector' : 'Assign Collector')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.full_name} ({c.area})
                      </SelectItem>
                    ))
                  ) : (
                    collectors.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.full_name} ({c.area})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {eligibleCollectors.length === 0 && modalType === 'pickup' && (
                <p className="text-xs text-orange-700 mt-1">
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
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
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
              <div className="p-4 bg-gray-50 rounded border space-y-2 text-sm">
                <p><strong>Citizen:</strong> {selectedItem.citizen_name}</p>
                <p><strong>Area:</strong> {selectedItem.citizen_area}</p>
                <p><strong>Item:</strong> {selectedItem.item_name}</p>
                <p><strong>Current Collector:</strong> {selectedItem.assigned_collector || 'None'}</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                {selectedItem?.assigned_collector ? 'Reassign' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}