import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface PickupRequest {
  id: number;
  citizen_name: string;
  citizen_area: string;
  item_name: string;
  rough_weight: number;
  priority: string;
  estimated_earnings: number;
  status: string;
  created_at: string;
}

export function PickupRequestsList() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/pickup-requests/admin');
      if (!res.ok) throw new Error('Failed to load requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load pickup requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    if (!confirm(`Change status to "${newStatus}"?`)) return;

    try {
      const res = await fetch(`http://localhost:4000/api/pickup-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Update failed');

      toast.success(`Status updated to ${newStatus}`);
      fetchRequests(); // refresh list
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Pickup Requests List
          </h1>
          <p className="text-lg text-gray-600">
            View and manage all pickup requests submitted by citizens
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">No pickup requests yet</p>
              <p className="mt-3">When citizens add items, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Citizen</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Est. Earnings (LKR)</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{req.citizen_name}</TableCell>
                      <TableCell>{req.citizen_area}</TableCell>
                      <TableCell>{req.item_name}</TableCell>
                      <TableCell>{req.rough_weight.toFixed(2)}</TableCell>
                      <TableCell>{req.estimated_earnings.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{req.priority}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>{req.created_at}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(req.id, 'assigned')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Assign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(req.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                          </>
                        )}
                        {req.status === 'assigned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(req.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Mark Completed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}