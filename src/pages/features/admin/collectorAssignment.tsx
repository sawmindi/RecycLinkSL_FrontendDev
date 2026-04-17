import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
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
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

export function CollectorAssignmentPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
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
    const res = await getCollectors();
    if (res.success) setCollectors(res.data);
    else await swalError(t('admin.collectorAssignment.toastLoadCollectors'), res.message);
  };

  const fetchCategories = async () => {
    const res = await getCategories();
    if (res.success) setCategories(res.data.map((c) => ({ _id: c._id, name: c.name })));
    else await swalError(t('admin.collectorAssignment.toastLoadCategories'), res.message);
  };

  const fetchCategoryAssignments = async () => {
    const res = await getCollectorCategoryAssignments();
    if (res.success) setCategoryAssignments(res.data);
    else await swalError(t('admin.collectorAssignment.toastLoadAssignments'), res.message);
  };

  const fetchPickupRequests = async () => {
    const res = await getPickupRequests();
    if (res.success) setPickupRequests(res.data);
    else await swalError(t('admin.collectorAssignment.toastLoadPickups'), res.message);
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
      await swalError(t('admin.collectorAssignment.toastSelectCollector'));
      return;
    }

    if (modalType === 'category') {
      if (!formData.category_id || !formData.area) {
        await swalError(t('admin.collectorAssignment.toastCategoryArea'));
        return;
      }

      const res = await createCollectorCategoryAssignment({
        collector_id: formData.collector_id,
        category_id: formData.category_id,
        area: formData.area.trim(),
      });
      if (res.success) {
        await swalSuccess(t('admin.collectorAssignment.toastAssignedCategory'));
        fetchCategoryAssignments();
        setIsModalOpen(false);
        resetForm();
      } else {
        await swalError(res.message || 'Assignment failed');
      }
    } else if (modalType === 'pickup' && selectedItem) {
      const res = await assignCollectorToPickupRequest(selectedItem._id, formData.collector_id);
      if (res.success) {
        await swalSuccess(
          selectedItem.assigned_collector
            ? t('admin.collectorAssignment.toastReassignedPickup')
            : t('admin.collectorAssignment.toastAssignedPickup')
        );
        fetchPickupRequests();
        setIsModalOpen(false);
        resetForm();
      } else {
        await swalError(res.message || 'Assign failed');
      }
    }
  };

  const handleDeleteCategoryAssignment = async (id: string) => {
    const ok = await swalConfirm({
      title: t('admin.collectorAssignment.confirmRemove'),
      confirmButtonText: t('admin.common.delete'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const res = await deleteCollectorCategoryAssignment(id);
    if (res.success) {
      await swalSuccess(t('admin.collectorAssignment.toastRemoved'));
      fetchCategoryAssignments();
    } else {
      await swalError(t('admin.collectorAssignment.toastRemoveFail'), res.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-1 sm:mb-2">
            {t('admin.collectorAssignment.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">{t('admin.collectorAssignment.subtitle')}</p>
        </div>

        {activeTab === 'categories' && (
          <Button 
            className="bg-teal-700 hover:bg-teal-800 text-white gap-2 w-full sm:w-auto"
            onClick={() => openModal('category')}
          >
            <Plus className="h-4 w-4" />
            {t('admin.collectorAssignment.newAssignment')}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'categories' | 'pickups')} className="space-y-6">
        <TabsList className="bg-gray-100 w-full sm:w-auto">
          <TabsTrigger value="categories" className="flex-1 sm:flex-none">{t('admin.collectorAssignment.tabCategories')}</TabsTrigger>
          <TabsTrigger value="pickups" className="flex-1 sm:flex-none">{t('admin.collectorAssignment.tabPickups')}</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold">{t('admin.collectorAssignment.cardCategoriesTitle')}</h3>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>{t('admin.collectorAssignment.thCollector')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thCategory')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thArea')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thAssignedDate')}</TableHead>
                      <TableHead>{t('admin.common.status')}</TableHead>
                      <TableHead className="text-right">{t('admin.common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryAssignments.map((a) => (
                      <TableRow key={a._id}>
                        <TableCell className="font-medium">{a.collector_name}</TableCell>
                        <TableCell>{a.category_name}</TableCell>
                        <TableCell>{a.area}</TableCell>
                        <TableCell>{formatDisplayDate(a.assigned_date, dateLocale)}</TableCell>
                        <TableCell>
                          <Badge className={a.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {a.status === 'active'
                              ? t('admin.common.active')
                              : a.status === 'inactive'
                                ? t('admin.common.inactive')
                                : a.status}
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
                          {t('admin.collectorAssignment.emptyAssignments')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {categoryAssignments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 text-sm">
                    {t('admin.collectorAssignment.emptyAssignments')}
                  </p>
                ) : (
                  categoryAssignments.map((a) => (
                    <div key={a._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{a.collector_name}</p>
                          <p className="text-sm text-gray-500">{a.area}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={a.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {a.status === 'active'
                              ? t('admin.common.active')
                              : a.status === 'inactive'
                                ? t('admin.common.inactive')
                                : a.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategoryAssignment(a._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">{t('admin.collectorAssignment.thCategory')}: </span>
                          <span className="text-gray-800">{a.category_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.collectorAssignment.thAssignedDate')}: </span>
                          <span className="text-gray-800">{formatDisplayDate(a.assigned_date, dateLocale)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pickups Tab */}
        <TabsContent value="pickups">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold">{t('admin.collectorAssignment.cardPickupsTitle')}</h3>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>{t('admin.collectorAssignment.thCitizen')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thArea')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thItem')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thWeight')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thEarnings')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thPriority')}</TableHead>
                      <TableHead>{t('admin.collectorAssignment.thAssignedCollector')}</TableHead>
                      <TableHead>{t('admin.common.status')}</TableHead>
                      <TableHead className="text-right">{t('admin.common.actions')}</TableHead>
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
                            <span className="text-gray-500">{t('admin.collectorAssignment.unassigned')}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                            {req.status === 'pending'
                              ? t('admin.common.pending')
                              : req.status === 'assigned'
                                ? t('admin.common.assigned')
                                : req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('pickup', req)}
                            disabled={req.status === 'completed'}
                            className={
                              req.status === 'completed' 
                                ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100 cursor-not-allowed' 
                                : ''
                            }
                          >
                            {req.status === 'completed' 
                              ? t('admin.common.completed') 
                              : req.assigned_collector
                                ? t('admin.collectorAssignment.reassign')
                                : t('admin.collectorAssignment.assign')
                            }
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pickupRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          {t('admin.collectorAssignment.emptyPickups')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {pickupRequests.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 text-sm">
                    {t('admin.collectorAssignment.emptyPickups')}
                  </p>
                ) : (
                  pickupRequests.map((req) => (
                    <div key={req._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{req.citizen_name}</p>
                          <p className="text-sm text-gray-500">{req.citizen_area}</p>
                        </div>
                        <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                          {req.status === 'pending'
                            ? t('admin.common.pending')
                            : req.status === 'assigned'
                              ? t('admin.common.assigned')
                              : req.status}
                        </Badge>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">{t('admin.collectorAssignment.thItem')}: </span>
                          <span className="text-gray-800">{req.item_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.collectorAssignment.thPriority')}: </span>
                          <span className="text-gray-800 capitalize">{req.priority}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.collectorAssignment.thWeight')}: </span>
                          <span className="text-gray-800">{req.rough_weight?.toFixed(2) || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('admin.collectorAssignment.thEarnings')}: </span>
                          <span className="text-gray-800">{req.estimated_earnings?.toFixed(2) || '—'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">{t('admin.collectorAssignment.thAssignedCollector')}: </span>
                          {req.assigned_collector ? (
                            <span className="font-medium text-blue-700">{req.assigned_collector}</span>
                          ) : (
                            <span className="text-gray-500">{t('admin.collectorAssignment.unassigned')}</span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full ${
                          req.status === 'completed' 
                            ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed' 
                            : ''
                        }`}
                        onClick={() => openModal('pickup', req)}
                        disabled={req.status === 'completed'}
                      >
                        {req.status === 'completed' 
                          ? t('admin.common.completed') 
                          : req.assigned_collector
                            ? t('admin.collectorAssignment.reassign')
                            : t('admin.collectorAssignment.assign')
                        }
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'category'
                ? t('admin.collectorAssignment.modalCategory')
                : selectedItem?.assigned_collector
                  ? t('admin.collectorAssignment.modalReassignPickup')
                  : t('admin.collectorAssignment.modalAssignPickup')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>
                {t('admin.collectorAssignment.collector')} <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.collector_id}
                onValueChange={(collectorId) => {
                  const pool = eligibleCollectors.length > 0 ? eligibleCollectors : collectors;
                  const col = pool.find((c) => c._id === collectorId);
                  setFormData((prev) => ({
                    ...prev,
                    collector_id: collectorId,
                    ...(modalType === 'category'
                      ? { area: (col?.area && String(col.area).trim()) || '' }
                      : {}),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.collectorAssignment.selectCollector')} />
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
                <p className="text-xs text-orange-700 mt-1">{t('admin.collectorAssignment.noteEligible')}</p>
              )}
            </div>

            {modalType === 'category' && (
              <>
                <div className="space-y-2">
                  <Label>
                    {t('admin.collectorAssignment.category')} <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.collectorAssignment.selectCategory')} />
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
                  <Label>
                    {t('admin.collectorAssignment.areaPS')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                    placeholder={t('admin.collectorAssignment.areaPlaceholder')}
                  />
                  <p className="text-xs text-gray-500">{t('admin.collectorAssignment.areaHelp')}</p>
                </div>
              </>
            )}

            {modalType === 'pickup' && selectedItem && (
              <div className="p-4 bg-gray-50 rounded border space-y-2 text-sm">
                <p>
                  <strong>{t('admin.collectorAssignment.summaryCitizen')}</strong> {selectedItem.citizen_name}
                </p>
                <p>
                  <strong>{t('admin.collectorAssignment.summaryArea')}</strong> {selectedItem.citizen_area}
                </p>
                <p>
                  <strong>{t('admin.collectorAssignment.summaryItem')}</strong> {selectedItem.item_name}
                </p>
                <p>
                  <strong>{t('admin.collectorAssignment.summaryCollector')}</strong>{' '}
                  {selectedItem.assigned_collector || t('admin.common.none')}
                </p>
              </div>
            )}

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                {selectedItem?.assigned_collector
                  ? t('admin.collectorAssignment.reassign')
                  : t('admin.collectorAssignment.assign')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}