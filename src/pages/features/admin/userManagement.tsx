import React, { useState, useEffect } from 'react';
import { RefreshCw, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface User {
  id: number;
  full_name: string;
  email: string | null;
  mobile_number: string;
  address: string; 
  role: string;
  is_active: boolean;
  joined_date: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ role: '', is_active: true });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/users/admin');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setFormData({ role: user.role, is_active: user.is_active });
  };

  const handleUpdate = async () => {
    if (!editUser) return;

    try {
      const res = await fetch(`http://localhost:4000/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Update failed');

      toast.success('User updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user permanently?')) return;

    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      collector: 'bg-blue-100 text-blue-800',
      citizen: 'bg-green-100 text-green-800',
    };
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100'}>{role}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return active
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage all users
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchUsers}
          className="h-10 w-10"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">No users found</p>
              <p className="mt-3">New users will appear here after signup.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Full Name</TableHead>
                    <TableHead>Address (Area)</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>{user.mobile_number}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.joined_date}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
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
                              <AlertDialogTitle>Delete User?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{user.full_name}</strong> ({user.role}).
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User – {editUser?.full_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="collector">Collector</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {/* Add more roles here later */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onValueChange={(v) => setFormData({ ...formData, is_active: v === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}