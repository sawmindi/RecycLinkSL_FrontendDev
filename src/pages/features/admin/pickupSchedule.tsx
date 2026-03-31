import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { PradeshiyaSabhaSelect } from '../../../components/forms/PradeshiyaSabhaSelect';
import { PRADESHIYA_SABHA_VALUE_SET } from '../../../data/pradeshiyaSabhas';
import {
  getPickupSchedules,
  createPickupSchedule,
  updatePickupSchedule,
  deletePickupSchedule,
  getItems,
  type PickupSchedule,
  type PriceItem,
} from '../../../services/AdminService';

function isItemActive(it: PriceItem): boolean {
  const s = (it.status || '').toLowerCase();
  return s === '' || s === 'active';
}

export function PickupScheduleManagementPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith('si') ? 'si-LK' : undefined;
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
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
    getItems()
      .then((res) => {
        if (res.success) setPriceItems(res.data.filter(isItemActive));
        else {
          setPriceItems([]);
          toast.error(res.message || t('admin.pickupSchedule.toastLoadItems'));
        }
      })
      .catch(() => toast.error(t('admin.pickupSchedule.toastLoadItems')));
  }, [t]);

  const fetchSchedules = async () => {
    const res = await getPickupSchedules();
    if (res.success) {
      setSchedules(res.data);
    } else {
      await swalError(t('admin.pickupSchedule.toastLoadSchedules'), res.message);
    }
    setLoading(false);
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
      await swalError(t('admin.pickupSchedule.toastRequired'));
      return;
    }

    if (!currentSchedule && !PRADESHIYA_SABHA_VALUE_SET.has(formData.area)) {
      await swalError(t('admin.pickupSchedule.toastValidPS'));
      return;
    }

    const itemNames = new Set(priceItems.map((i) => i.item_name));
    const itemsValid =
      itemNames.has(formData.items) ||
      (!!currentSchedule && formData.items === currentSchedule.items);
    if (!itemsValid) {
      toast.error(t('admin.pickupSchedule.toastSelectItem'));
      return;
    }

    const payload = {
      area: formData.area,
      schedule_date: formData.schedule_date,
      schedule_time: formData.schedule_time,
      items: formData.items,
    };

    const res = currentSchedule
      ? await updatePickupSchedule(currentSchedule._id, payload)
      : await createPickupSchedule(payload);
    if (res.success) {
      await swalSuccess(
        currentSchedule ? t('admin.pickupSchedule.toastUpdated') : t('admin.pickupSchedule.toastCreated')
      );
      resetForm();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchSchedules();
    } else {
      await swalError(t('admin.pickupSchedule.toastGeneric'), res.message);
    }
  };

  const handleDelete = async (id: string, area: string, dateLabel: string) => {
    const ok = await swalConfirm({
      title: t('admin.pickupSchedule.deleteTitle'),
      text: t('admin.pickupSchedule.deleteDesc', { area, date: dateLabel }),
      confirmButtonText: t('admin.common.delete'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const res = await deletePickupSchedule(id);
    if (res.success) {
      await swalSuccess(t('admin.pickupSchedule.toastDeleted'));
      fetchSchedules();
    } else {
      await swalError(t('admin.pickupSchedule.toastDeleteFail'), res.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assigned':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.pickupSchedule.schStatusAssigned')}</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.pickupSchedule.schStatusPending')}</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">{t('admin.pickupSchedule.schStatusCompleted')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            {t('admin.pickupSchedule.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('admin.pickupSchedule.subtitle')}
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-4 w-4" />
          {t('admin.pickupSchedule.addSchedule')}
        </Button>
      </div>

      {/* Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-700" />
              {t('admin.pickupSchedule.sectionAll')}
            </h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">{t('admin.pickupSchedule.loading')}</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-xl font-medium">{t('admin.pickupSchedule.emptyTitle')}</p>
              <p className="mt-3">{t('admin.pickupSchedule.emptyHint')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>{t('admin.pickupSchedule.thArea')}</TableHead>
                    <TableHead>{t('admin.pickupSchedule.thDate')}</TableHead>
                    <TableHead>{t('admin.pickupSchedule.thTime')}</TableHead>
                    <TableHead>{t('admin.pickupSchedule.thItems')}</TableHead>
                    {/* <TableHead>{t('admin.pickupSchedule.thCollector')}</TableHead> */}
                    <TableHead>{t('admin.common.status')}</TableHead>
                    <TableHead className="text-right">{t('admin.common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((sch) => (
                    <TableRow key={sch._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{sch.area}</TableCell>
                      <TableCell>
                        {new Date(sch.schedule_date).toLocaleDateString(dateLocale)}
                      </TableCell>
                      <TableCell>{sch.schedule_time.slice(0, 5)}</TableCell>
                      <TableCell>{sch.items}</TableCell>
                      {/* <TableCell>{sch.collector_name ?? t('admin.pickupSchedule.unassigned')}</TableCell> */}
                      <TableCell>{getStatusBadge(sch.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(sch)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleDelete(
                              sch._id,
                              sch.area,
                              new Date(sch.schedule_date).toLocaleDateString(dateLocale)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentSchedule ? t('admin.pickupSchedule.modalEdit') : t('admin.pickupSchedule.modalAdd')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>
                {t('admin.pickupSchedule.labelPS')} <span className="text-red-600">*</span>
              </Label>
              <PradeshiyaSabhaSelect
                value={formData.area}
                onValueChange={(area) => setFormData((prev) => ({ ...prev, area }))}
                placeholder={t('admin.pickupSchedule.psPlaceholder')}
              />
              <p className="text-xs text-gray-500">{t('admin.pickupSchedule.psHelp')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.pickupSchedule.labelDate')}</Label>
              <Input
                type="date"
                value={formData.schedule_date}
                onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.pickupSchedule.labelTime')}</Label>
              <Input
                type="time"
                value={formData.schedule_time}
                onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.pickupSchedule.labelItem')} <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.items}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, items: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.pickupSchedule.itemPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[min(60vh,280px)]">
                  {priceItems.map((it) => (
                    <SelectItem key={it._id} value={it.item_name}>
                      {it.category_name
                        ? `${it.item_name} — ${it.category_name}`
                        : it.item_name}
                    </SelectItem>
                  ))}
                  {formData.items &&
                    !priceItems.some((it) => it.item_name === formData.items) && (
                      <SelectItem value={formData.items}>
                        {formData.items} {t('admin.pickupSchedule.currentValueSuffix')}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{t('admin.pickupSchedule.itemHelp')}</p>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={resetForm}>
                {t('admin.common.cancel')}
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                {currentSchedule ? t('admin.pickupSchedule.update') : t('admin.pickupSchedule.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {!loading && schedules.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">{t('admin.pickupSchedule.emptyFooterTitle')}</p>
          <p className="mt-3">{t('admin.pickupSchedule.emptyFooterHint')}</p>
        </div>
      )}
    </div>
  );
}