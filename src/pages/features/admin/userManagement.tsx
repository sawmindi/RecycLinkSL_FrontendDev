import React, { useState, useEffect } from 'react';
import { Edit, Trash2, UserPlus, UserCheck, UserX, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { getUsers, createUser, updateUser, deleteUser, type AdminUser } from '../../../services/AdminService';

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form for Add New User
  const [addForm, setAddForm] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    address: '',
    password: '',
    role: 'citizen',
  });

  // Form for Edit User (all editable fields)
  const [editForm, setEditForm] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    address: '',
    role: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      full_name: user.full_name,
      mobile_number: user.mobile_number,
      email: user.email || '',
      address: user.address ?? '',
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;

    // Validate mobile number (exactly 10 digits)
    if (!/^\d{10}$/.test(editForm.mobile_number)) {
      toast.error('Mobile number must be exactly 10 digits (no spaces, +94, etc.)');
      return;
    }

    try {
      await updateUser(editUser._id, {
        full_name: editForm.full_name,
        mobile_number: editForm.mobile_number,
        email: editForm.email,
        area: editForm.address,
        role: editForm.role,
        is_active: editForm.is_active,
      });
      toast.success(
        editForm.is_active
          ? 'User updated – account is now active'
          : 'User updated – account is now deactivated'
      );
      setEditUser(null);
      fetchUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update user');
    }
  };

  const handleAddSubmit = async () => {
    // Validate required fields
    if (!addForm.full_name || !addForm.mobile_number || !addForm.email || !addForm.address || !addForm.password || !addForm.role) {
      toast.error('Please fill all required fields (*)');
      return;
    }

    // Mobile validation: exactly 10 digits
    if (!/^\d{10}$/.test(addForm.mobile_number)) {
      toast.error('Mobile number must be exactly 10 digits (no spaces or +94)');
      return;
    }

    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const data = await createUser({
        full_name: addForm.full_name,
        mobile_number: addForm.mobile_number,
        email: addForm.email,
        area: addForm.address,
        password: addForm.password,
        role: addForm.role,
      });
      const username = data?.user?.username ?? '—';
      toast.success(`User created successfully! Username: ${username}`);
      setAddModalOpen(false);
      setAddForm({
        full_name: '',
        mobile_number: '',
        email: '',
        address: '',
        password: '',
        role: 'citizen',
      });
      fetchUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Signup failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('This user is deactivated. Permanently delete this account and all associated data? This cannot be undone.')) return;

    try {
      await deleteUser(id);
      toast.success('User account permanently deleted');
      fetchUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    const newStatus = !user.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} ${user.full_name}'s account?`)) return;

    try {
      await updateUser(user._id, { is_active: newStatus });
      toast.success(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update account status');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      collector: 'bg-blue-100 text-blue-800',
      citizen: 'bg-green-100 text-green-800',
    };
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return active
      ? <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><UserCheck className="h-3 w-3" /> Active</Badge>
      : <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><UserX className="h-3 w-3" /> Inactive</Badge>;
  };

  const UserActionButtons = ({ user }: { user: AdminUser }) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => handleEditOpen(user)}>
        <Edit className="h-4 w-4 text-gray-600" />
      </Button>

      {user.is_active ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserX className="h-4 w-4 text-orange-600" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Deactivating <strong>{user.full_name}</strong> will immediately log them out and block access.
                You can reactivate later or delete permanently after deactivation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleToggleActive(user)}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
              >
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <>
          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(user)}>
            <UserCheck className="h-4 w-4 text-green-600" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  User <strong>{user.full_name}</strong> is deactivated. This will permanently delete the account
                  and all associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(user._id)}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 mb-1">
            User Management
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage Citizens, Collectors, Admins and other roles
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white gap-2">
                <UserPlus className="h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
                <div className="space-y-2">
                  <Label>Full Name <span className="text-red-600">*</span></Label>
                  <Input
                    required
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder="e.g. Kamal Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number <span className="text-red-600">*</span></Label>
                  <Input
                    required
                    type="tel"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={addForm.mobile_number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        setAddForm({ ...addForm, mobile_number: val });
                      }
                    }}
                    placeholder="e.g. 0771234567"
                  />
                  <p className="text-xs text-gray-500">Exactly 10 digits (no spaces, +94, etc.)</p>
                </div>

                <div className="space-y-2">
                  <Label>Email <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. kamal@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address (Area) <span className="text-red-600">*</span></Label>
                  <Input
                    required
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                    placeholder="e.g. Colombo 7"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password <span className="text-red-600">*</span></Label>
                  <Input
                    required
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Role <span className="text-red-600">*</span></Label>
                  <Select
                    value={addForm.role}
                    onValueChange={(v) => setAddForm({ ...addForm, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="collector">Collector</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <Button
                 variant="outline" 
                 onClick={() => setAddModalOpen(false)}
                 className="w-full sm:w-auto"
                 >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSubmit}
                  className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white"
                >
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No users found</p>
          <p className="mt-2 text-sm">Click "Add New User" to create one.</p>
        </div>
      ) : (
        <>
        {/* Mobile */}         
           <div className="flex flex-col gap-4 md:hidden">
            {users.map((user) => (
              <Card key={user._id} className={`border shadow-sm ${!user.is_active ? 'opacity-70' : ''}`}>
                <CardContent className="p-4 space-y-3">

                  {/* Top: name + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
                      <div className="mt-1">{getRoleBadge(user.role)}</div>
                    </div>
                    {getStatusBadge(user.is_active)}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{user.mobile_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{user.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{user.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{user.joined_date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-1">
                    <UserActionButtons user={user} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

      {/* Desktop */}
      <Card className="hidden md:block border-none shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">No users found</p>
              <p className="mt-3">Click "Add New User" to create one.</p>
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
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>{user.mobile_number}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.joined_date}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-right">
                        <UserActionButtons user={user} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )}

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit User – {editUser?.full_name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-red-600">*</span></Label>
              <Input
                required
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Mobile Number <span className="text-red-600">*</span></Label>
              <Input
                required
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                value={editForm.mobile_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) {
                    setEditForm({ ...editForm, mobile_number: val });
                  }
                }}
              />
              <p className="text-xs text-gray-500">Exactly 10 digits (no spaces, +94, etc.)</p>
            </div>

            <div className="space-y-2">
              <Label>Email<span className="text-red-600">*</span></Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Address (Area) <span className="text-red-600">*</span></Label>
              <Input
                required
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Role <span className="text-red-600">*</span></Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="collector">Collector</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Status <span className="text-red-600">*</span></Label>
              <Select
                value={editForm.is_active ? 'active' : 'inactive'}
                onValueChange={(v) => setEditForm({ ...editForm, is_active: v === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {!editForm.is_active && (
                <p className="text-xs text-orange-700">
                  Warning: Deactivating will immediately log the user out and block access.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}