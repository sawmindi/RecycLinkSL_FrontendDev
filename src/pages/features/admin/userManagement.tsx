import React, { useState, useEffect } from 'react';
import { RefreshCw, Edit, Trash2, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { PradeshiyaSabhaSelect } from '../../../components/forms/PradeshiyaSabhaSelect';
import { MainCitySelect } from '../../../components/forms/MainCitySelect';
import { PRADESHIYA_SABHA_VALUE_SET } from '../../../data/pradeshiyaSabhas';
import { MAIN_CITY_VALUE_SET } from '../../../data/mainCities';
import { getUsers, createUser, updateUser, deleteUser, type AdminUser } from '../../../services/AdminService';

export function UserManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form for Add New User
  const [addForm, setAddForm] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    area: '',
    password: '',
    role: 'CITIZEN',
  });

  // Form for Edit User
  const [editForm, setEditForm] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    area: '',
    role: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getUsers();
    if (res.success) {
      setUsers(res.data);
    } else {
      await swalError(t('admin.userManagement.toastLoadUsers'), res.message);
    }
    setLoading(false);
  };

  const handleEditOpen = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      full_name: user.full_name,
      mobile_number: user.mobile_number,
      email: user.email || '',
      area: user.area ?? '',
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;

    // Validate mobile number (exactly 10 digits)
    if (!/^\d{10}$/.test(editForm.mobile_number)) {
      await swalError(t('admin.userManagement.toastMobileInvalid'));
      return;
    }

    if (editForm.role === 'COLLECTOR' && !editForm.area.trim()) {
      await swalError(t('admin.userManagement.toastCollectorAreaRequired'));
      return;
    }

    if (editForm.role === 'CITIZEN' && !editForm.area.trim()) {
      await swalError(t('admin.userManagement.toastCitizenAreaRequired'));
      return;
    }

    const res = await updateUser(editUser._id, {
      full_name: editForm.full_name,
      mobile_number: editForm.mobile_number,
      email: editForm.email || null,
      area: editForm.area,
      role: editForm.role,
      is_active: editForm.is_active,
    });
    if (res.success) {
      await swalSuccess(
        editForm.is_active
          ? t('admin.userManagement.toastUpdatedActive')
          : t('admin.userManagement.toastUpdatedInactive')
      );
      setEditUser(null);
      fetchUsers();
    } else {
      await swalError(t('admin.userManagement.toastUpdateFail'), res.message);
    }
  };

  const handleAddSubmit = async () => {
    // Validate required fields
    if (!addForm.full_name || !addForm.mobile_number || !addForm.area || !addForm.password || !addForm.role) {
      await swalError(t('admin.userManagement.toastFillAll'));
      return;
    }

    if (addForm.role === 'COLLECTOR' && !PRADESHIYA_SABHA_VALUE_SET.has(addForm.area)) {
      await swalError(t('admin.userManagement.toastCollectorPS'));
      return;
    }

    if (addForm.role === 'CITIZEN' && !MAIN_CITY_VALUE_SET.has(addForm.area)) {
      await swalError(t('admin.userManagement.toastCitizenCity'));
      return;
    }

    if (!/^\d{10}$/.test(addForm.mobile_number)) {
      await swalError(t('admin.userManagement.toastMobileInvalidShort'));
      return;
    }

    const res = await createUser({
      full_name: addForm.full_name,
      mobile_number: addForm.mobile_number,
      email: addForm.email || null,
      area: addForm.area,
      password: addForm.password,
      role: addForm.role,
    });
    if (res.success) {
      const username = res.data?.user?.username ?? '—';
      await swalSuccess(t('admin.userManagement.toastUserCreated', { username }));
      setAddModalOpen(false);
      setAddForm({
        full_name: '',
        mobile_number: '',
        email: '',
        area: '',
        password: '',
        role: 'CITIZEN',
      });
      fetchUsers();
    } else {
      await swalError(t('admin.userManagement.toastSignupFail'), res.message);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await swalConfirm({
      title: t('admin.userManagement.confirmDeleteUser'),
      confirmButtonText: t('admin.common.delete'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const res = await deleteUser(id);
    if (res.success) {
      await swalSuccess(t('admin.userManagement.toastUserDeleted'));
      fetchUsers();
    } else {
      await swalError(t('admin.userManagement.toastDeleteUserFail'), res.message);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    const newStatus = !user.is_active;

    const ok = await swalConfirm({
      title: newStatus
        ? t('admin.userManagement.confirmActivate', { name: user.full_name })
        : t('admin.userManagement.confirmDeactivate', { name: user.full_name }),
      confirmButtonText: 'OK',
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;

    const res = await updateUser(user._id, { is_active: newStatus });
    if (res.success) {
      await swalSuccess(
        newStatus ? t('admin.userManagement.toastAccountActivated') : t('admin.userManagement.toastAccountDeactivated')
      );
      fetchUsers();
    } else {
      await swalError(t('admin.userManagement.toastStatusUpdateFail'), res.message);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      COLLECTOR: 'bg-blue-100 text-blue-800',
      CITIZEN: 'bg-green-100 text-green-800',
    };
    const r = role.toUpperCase();
    const label =
      r === 'CITIZEN'
        ? t('admin.userManagement.roleCitizen')
        : r === 'COLLECTOR'
          ? t('admin.userManagement.roleCollector')
          : r === 'ADMIN'
            ? t('admin.userManagement.roleAdmin')
            : role;
    return (
      <Badge className={colors[r] || 'bg-gray-100 text-gray-800'}>{label}</Badge>
    );
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <UserCheck className="h-3 w-3" /> {t('admin.common.active')}
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <UserX className="h-3 w-3" /> {t('admin.common.inactive')}
      </Badge>
    );
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            {t('admin.userManagement.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('admin.userManagement.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white gap-2">
                <UserPlus className="h-4 w-4" />
                {t('admin.userManagement.addUser')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('admin.userManagement.addModalTitle')}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.userManagement.fullName')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    required
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder={t('admin.userManagement.placeholderFullName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('admin.userManagement.mobile')} <span className="text-red-600">*</span>
                  </Label>
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
                    placeholder={t('admin.userManagement.placeholderMobile')}
                  />
                  <p className="text-xs text-gray-500">{t('admin.userManagement.mobileHint')}</p>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.userManagement.emailOptional')}</Label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder={t('admin.userManagement.placeholderEmail')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('admin.userManagement.role')} <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={addForm.role}
                    onValueChange={(v) =>
                      setAddForm((prev) => ({
                        ...prev,
                        role: v,
                        area:
                          (v === 'COLLECTOR' && prev.role !== 'COLLECTOR') ||
                          (v === 'CITIZEN' && prev.role === 'COLLECTOR')
                            ? ''
                            : prev.area,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.userManagement.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CITIZEN">{t('admin.userManagement.roleCitizen')}</SelectItem>
                      <SelectItem value="COLLECTOR">{t('admin.userManagement.roleCollector')}</SelectItem>
                      <SelectItem value="ADMIN">{t('admin.userManagement.roleAdmin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>
                    {addForm.role === 'COLLECTOR' ? (
                      <>
                        {t('admin.userManagement.labelAreaPS')} <span className="text-red-600">*</span>
                      </>
                    ) : addForm.role === 'CITIZEN' ? (
                      <>
                        {t('admin.userManagement.labelAreaCity')} <span className="text-red-600">*</span>
                      </>
                    ) : (
                      <>
                        {t('admin.userManagement.labelAreaAdmin')} <span className="text-red-600">*</span>
                      </>
                    )}
                  </Label>
                  {addForm.role === 'COLLECTOR' ? (
                    <>
                      <PradeshiyaSabhaSelect
                        value={addForm.area}
                        onValueChange={(area) => setAddForm((prev) => ({ ...prev, area }))}
                        placeholder={t('admin.userManagement.psPlaceholder')}
                      />
                      <p className="text-xs text-gray-500">{t('admin.userManagement.psHelpNew')}</p>
                    </>
                  ) : addForm.role === 'CITIZEN' ? (
                    <>
                      <MainCitySelect
                        value={addForm.area}
                        onValueChange={(area) => setAddForm((prev) => ({ ...prev, area }))}
                        placeholder={t('admin.userManagement.cityPlaceholder')}
                      />
                      <p className="text-xs text-gray-500">{t('admin.userManagement.cityHelpNew')}</p>
                    </>
                  ) : (
                    <Input
                      required
                      value={addForm.area}
                      onChange={(e) => setAddForm({ ...addForm, area: e.target.value })}
                      placeholder={t('admin.userManagement.addressPlaceholder')}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('admin.userManagement.password')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    required
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder={t('admin.userManagement.passwordPlaceholder')}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                  {t('admin.common.cancel')}
                </Button>
                <Button
                  onClick={handleAddSubmit}
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                >
                  {t('admin.userManagement.createUser')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">{t('admin.userManagement.loading')}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">{t('admin.userManagement.emptyTitle')}</p>
              <p className="mt-3">{t('admin.userManagement.emptyHint')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>{t('admin.userManagement.thName')}</TableHead>
                    <TableHead>{t('admin.userManagement.thArea')}</TableHead>
                    <TableHead>{t('admin.userManagement.thMobile')}</TableHead>
                    <TableHead>{t('admin.userManagement.thEmail')}</TableHead>
                    <TableHead>{t('admin.userManagement.thRole')}</TableHead>
                    <TableHead>{t('admin.userManagement.thJoined')}</TableHead>
                    <TableHead>{t('admin.common.status')}</TableHead>
                    <TableHead className="text-right">{t('admin.common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.area}</TableCell>
                      <TableCell>{user.mobile_number}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.joined_date}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-right space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditOpen(user)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>

                        {user.is_active ? (
                          // Active → show Deactivate
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <UserX className="h-4 w-4 text-orange-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin.userManagement.deactivateTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('admin.userManagement.deactivateDesc', { name: user.full_name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleToggleActive(user)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  {t('admin.userManagement.deactivate')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          // Inactive → show Activate + Delete
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(user)}
                            >
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('admin.userManagement.deletePermanentTitle')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('admin.userManagement.deletePermanentDesc', { name: user.full_name })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(user._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    {t('admin.userManagement.deletePermanent')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
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

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editUser ? t('admin.userManagement.editTitle', { name: editUser.full_name }) : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label>
                {t('admin.userManagement.fullName')} <span className="text-red-600">*</span>
              </Label>
              <Input
                required
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.userManagement.mobile')} <span className="text-red-600">*</span>
              </Label>
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
              <p className="text-xs text-gray-500">{t('admin.userManagement.mobileHint')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.userManagement.emailOptional')}</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.userManagement.role')} <span className="text-red-600">*</span>
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(v) =>
                  setEditForm((prev) => ({
                    ...prev,
                    role: v,
                    area:
                      (v === 'COLLECTOR' && prev.role !== 'COLLECTOR') ||
                      (v === 'CITIZEN' && prev.role === 'COLLECTOR')
                        ? ''
                        : prev.area,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.userManagement.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZEN">{t('admin.userManagement.roleCitizen')}</SelectItem>
                  <SelectItem value="COLLECTOR">{t('admin.userManagement.roleCollector')}</SelectItem>
                  <SelectItem value="ADMIN">{t('admin.userManagement.roleAdmin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                {editForm.role === 'COLLECTOR' ? (
                  <>
                    {t('admin.userManagement.labelAreaPS')} <span className="text-red-600">*</span>
                  </>
                ) : editForm.role === 'CITIZEN' ? (
                  <>
                    {t('admin.userManagement.labelAreaCity')} <span className="text-red-600">*</span>
                  </>
                ) : (
                  <>
                    {t('admin.userManagement.labelAreaAdmin')} <span className="text-red-600">*</span>
                  </>
                )}
              </Label>
              {editForm.role === 'COLLECTOR' ? (
                <>
                  <PradeshiyaSabhaSelect
                    value={editForm.area}
                    onValueChange={(area) => setEditForm((prev) => ({ ...prev, area }))}
                    placeholder={t('admin.userManagement.psPlaceholder')}
                  />
                  <p className="text-xs text-gray-500">{t('admin.userManagement.psHelpEdit')}</p>
                </>
              ) : editForm.role === 'CITIZEN' ? (
                <>
                  <MainCitySelect
                    value={editForm.area}
                    onValueChange={(area) => setEditForm((prev) => ({ ...prev, area }))}
                    placeholder={t('admin.userManagement.cityPlaceholder')}
                  />
                  <p className="text-xs text-gray-500">{t('admin.userManagement.cityHelpEdit')}</p>
                </>
              ) : (
                <Input
                  required
                  value={editForm.area}
                  onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.userManagement.accountStatus')} <span className="text-red-600">*</span>
              </Label>
              <Select
                value={editForm.is_active ? 'active' : 'inactive'}
                onValueChange={(v) => setEditForm({ ...editForm, is_active: v === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.userManagement.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('admin.common.active')}</SelectItem>
                  <SelectItem value="inactive">{t('admin.common.inactive')}</SelectItem>
                </SelectContent>
              </Select>
              {!editForm.is_active && (
                <p className="text-xs text-orange-700 mt-1">{t('admin.userManagement.warningDeactivate')}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              {t('admin.userManagement.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}