import React, { useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

const initialCategoryAssignments = [
  {
    id: '1',
    collector: 'Kamal Silva',
    category: 'Iron/Steel',
    area: 'Colombo 7',
    assignedDate: '2025-01-15',
    status: 'active',
  },
  {
    id: '2',
    collector: 'Nimal Perera',
    category: 'Plastic Bottles',
    area: 'Kandy',
    assignedDate: '2025-01-20',
    status: 'active',
  },
  {
    id: '3',
    collector: 'Kamal Silva',
    category: 'Copper',
    area: 'Colombo 7',
    assignedDate: '2025-01-18',
    status: 'active',
  },
];

const initialPickupAssignments = [
  {
    id: 'p1',
    citizen: 'Saman Perera',
    area: 'Colombo 7',
    items: 'Iron (5kg), Paper (2kg)',
    scheduledDate: '2025-02-15',
    assignedTo: 'Kamal Silva',
    status: 'assigned',
  },
  {
    id: 'p2',
    citizen: 'Priya Fernando',
    area: 'Kandy',
    items: 'Plastic Bottles (3kg)',
    scheduledDate: '2025-02-16',
    assignedTo: null,
    status: 'pending',
  },
];


export default function CollectorAssignment() {
  const [activeTab, setActiveTab] = useState('categories');

  const [categoryAssignments, setCategoryAssignments] = useState(initialCategoryAssignments);
  const [pickupAssignments, setPickupAssignments] = useState(initialPickupAssignments);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  const [formData, setFormData] = useState({
    collector: '',
    category: '',
    area: '',
  });

  const resetForm = () => {
    setFormData({ collector: '', category: '', area: '' });
    setCurrentAssignment(null);
  };

  const openModal = (assignment?: any) => {
    if (assignment) {
      setCurrentAssignment(assignment);
      setFormData({
        collector: assignment.collector || assignment.assignedTo || '',
        category: assignment.category || '',
        area: assignment.area || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.collector || !formData.category || !formData.area) {
      toast.error('Please fill all required fields');
      return;
    }

    if (currentAssignment) {
      // Edit existing
      if (activeTab === 'categories') {
        setCategoryAssignments(prev =>
          prev.map(a => (a.id === currentAssignment.id ? { ...a, ...formData } : a))
        );
      } else {
        setPickupAssignments(prev =>
          prev.map(a => (a.id === currentAssignment.id ? { ...a, assignedTo: formData.collector } : a))
        );
      }
      toast.success('Assignment updated successfully!');
    } else {
      // Add new (example for categories tab)
      const newAssign = {
        id: Date.now().toString(),
        ...formData,
        assignedDate: new Date().toLocaleDateString('en-GB'),
        status: 'active',
      };
      if (activeTab === 'categories') {
        setCategoryAssignments([...categoryAssignments, newAssign]);
      } else {
        toast.info('Pickup assignment logic can be customized here');
      }
      toast.success('Collector assigned successfully!');
    }

    setIsModalOpen(false);
    resetForm();
  };

const handleToggleActive = (id: string) => {
 if (activeTab === 'categories') {
    let newStatus = ''

    setCategoryAssignments(prev =>
      prev.map(a => {
        if (a.id === id) {
          newStatus = a.status === 'active' ? 'inactive' : 'active'
          return { ...a, status: newStatus }
        }
        return a
      })
    )

    toast.success(`Assignment ${newStatus === 'active' ? 'activated' : 'deactivated'}!`)
  
  } 
};


  const handleDelete = (id: string) => {
    if (activeTab === 'categories') {
      setCategoryAssignments(prev => prev.filter(a => a.id !== id));
    } else {
      setPickupAssignments(prev => prev.filter(a => a.id !== id));
    }
    toast.success('Assignment deleted successfully');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      active: 'bg-green-100 text-green-800 hover:bg-green-100',
      inactive: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Collector Assignment
          </h1>
          <p className="text-lg text-gray-600">
            Manage which collectors handle specific item categories and pickups
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={() => openModal()}
        >
          <Plus className="h-4 w-4" />
          Assign Collector
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="categories">Assign to Categories</TabsTrigger>
          <TabsTrigger value="pickups">Assign to Pickups</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Assign Collectors to Categories
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage which collectors handle specific item categories in different areas
                </p>
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
                      <TableRow key={a.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{a.collector}</TableCell>
                        <TableCell>{a.category}</TableCell>
                        <TableCell>{a.area}</TableCell>
                        <TableCell>{a.assignedDate}</TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openModal(a)}>
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(a.id)}
                          >
                            {a.status === 'active' ? (
                              <ToggleLeft className="h-5 w-5 text-orange-600" />
                            ) : (
                              <ToggleRight className="h-5 w-5 text-green-600" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pickups">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Assign Pickups to Collectors
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Assign pending pickup requests to available collectors
                </p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Citizen</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickupAssignments.map((a) => (
                      <TableRow key={a.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{a.citizen}</TableCell>
                        <TableCell>{a.area}</TableCell>
                        <TableCell>{a.items}</TableCell>
                        <TableCell>{a.scheduledDate}</TableCell>
                        <TableCell>{a.assignedTo || 'Unassigned'}</TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(a)}
                          >
                            {a.assignedTo ? 'Reassign' : 'Assign'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 text-gray-600">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-teal-700 text-white border-teal-700 hover:bg-teal-800">
                    1
                  </Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                </div>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {currentAssignment ? 'Reassign Collector' : 'Assign Collector'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Collector */}
            <div className="space-y-2">
              <Label>Collector</Label>
              <Select
                value={formData.collector}
                onValueChange={(v) => setFormData(prev => ({ ...prev, collector: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kamal Silva">Kamal Silva</SelectItem>
                  <SelectItem value="Nimal Perera">Nimal Perera</SelectItem>
                  <SelectItem value="Ravi Fernando">Ravi Fernando</SelectItem>
                </SelectContent>
              </Select>
            </div>

           
            {currentAssignment && activeTab === 'pickups' && (
              <div className="p-3 bg-gray-50 rounded border space-y-1 text-sm">
                <p><strong>Citizen:</strong> {currentAssignment.citizen}</p>
                <p><strong>Area:</strong> {currentAssignment.area}</p>
                <p><strong>Items:</strong> {currentAssignment.items}</p>
                <p><strong>Scheduled:</strong> {currentAssignment.scheduledDate}</p>
              </div>
            )}

            {activeTab === 'categories' && (
              <>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Iron/Steel">Iron/Steel</SelectItem>
                      <SelectItem value="Plastic Bottles">Plastic Bottles</SelectItem>
                      <SelectItem value="Copper">Copper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Area</Label>
                  <Select
                    value={formData.area}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, area: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Colombo 7">Colombo 7</SelectItem>
                      <SelectItem value="Kandy">Kandy</SelectItem>
                      <SelectItem value="Galle">Galle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                {currentAssignment ? 'Reassign' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}