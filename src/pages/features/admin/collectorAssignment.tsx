import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface Collector {
  id: number;
  full_name: string;
  area: string;
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
  rough_weight: number;
  status: string;
  created_at: string;
  assigned_collector?: string;
}

export default function CollectorAssignment() {
  const [activeTab, setActiveTab] = useState('categories');
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [categoryAssignments, setCategoryAssignments] = useState<CategoryAssignment[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  const [formData, setFormData] = useState({
    collector_id: '',
    category_id: '',
    area: '',
  });

  useEffect(() => {
    fetchCollectors();
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

  const fetchCategoryAssignments = async () => {
    // TODO: create backend endpoint /api/collector-assignments if not exists
    // For now, mock or leave empty until you add it
    setCategoryAssignments([]); // replace with real fetch later
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
    setCurrentAssignment(null);
  };

  const openModal = (assignment?: any) => {
    if (assignment) {
      setCurrentAssignment(assignment);
      setFormData({
        collector_id: '',
        category_id: '',
        area: assignment.citizen_area || assignment.area || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.collector_id || !formData.area) {
      toast.error('Collector and area required');
      return;
    }

    // For pickup assignment example
    if (activeTab === 'pickups' && currentAssignment) {
      try {
        // TODO: create backend PUT /api/pickup-requests/:id/assign
        // For now, just update local state
        setPickupRequests(prev =>
          prev.map(p =>
            p.id === currentAssignment.id
              ? { ...p, assigned_collector: collectors.find(c => c.id === Number(formData.collector_id))?.full_name || 'Unknown' }
              : p
          )
        );
        toast.success('Collector assigned to pickup!');
      } catch (err) {
        toast.error('Assignment failed');
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  // const handleToggleActive = (id: string) => {
//  if (activeTab === 'categories') {
//     let newStatus = ''

//     setCategoryAssignments(prev =>
//       prev.map(a => {
//         if (a.id === id) {
//           newStatus = a.status === 'active' ? 'inactive' : 'active'
//           return { ...a, status: newStatus }
//         }
//         return a
//       })
//     )

//     toast.success(`Assignment ${newStatus === 'active' ? 'activated' : 'deactivated'}!`)
  
//   } 
// };


  // const handleDelete = (id: string) => {
  //   if (activeTab === 'categories') {
  //     setCategoryAssignments(prev => prev.filter(a => a.id !== id));
  //   } else {
  //     setPickupAssignments(prev => prev.filter(a => a.id !== id));
  //   }
  //   toast.success('Assignment deleted successfully');
  // };

  // const getStatusBadge = (status: string) => {
  //   const colors = {
  //     assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  //     pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  //     active: 'bg-green-100 text-green-800 hover:bg-green-100',
  //     inactive: 'bg-red-100 text-red-800 hover:bg-red-100',
  //   };
  //   return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  // };
  
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Collector Assignment
          </h1>
          <p className="text-lg text-gray-600">
            Assign collectors to categories and pending pickups
          </p>
        </div>
        <Button className="bg-teal-700 hover:bg-teal-800 text-white gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          New Assignment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="categories">Assign to Categories</TabsTrigger>
          <TabsTrigger value="pickups">Assign to Pickups</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          {/* Your existing categories assignment table - add real fetch later */}
          <p className="text-center py-10 text-gray-500">Category assignments coming soon</p>
        </TabsContent>

        <TabsContent value="pickups">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Assign Pending Pickups to Collectors
                </h3>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Citizen</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Weight (kg)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Collector</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickupRequests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-gray-50">
                        <TableCell>{req.citizen_name}</TableCell>
                        <TableCell>{req.citizen_area}</TableCell>
                        <TableCell>{req.item_name}</TableCell>
                        <TableCell>{req.rough_weight}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{req.assigned_collector || 'Unassigned'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(req)}
                          >
                            {req.assigned_collector ? 'Reassign' : 'Assign'}
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
      </Tabs>

      {/* Assign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Collector</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Collector</Label>
              <Select
                value={formData.collector_id}
                onValueChange={(v) => setFormData(prev => ({ ...prev, collector_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collector" />
                </SelectTrigger>
                <SelectContent>
                  {collectors.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.full_name} ({c.area})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}