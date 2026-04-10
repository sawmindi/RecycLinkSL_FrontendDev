import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
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
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

function isItemActive(it: PriceItem): boolean {
  const s = (it.status || '').toLowerCase();
  return s === '' || s === 'active';
}

export function PickupScheduleManagementPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
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

  return (
    <div className="space-y-6 sm:space-y-10 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-1 sm:mb-2">
            {t('admin.pickupSchedule.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {t('admin.pickupSchedule.subtitle')}
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2 w-full sm:w-auto"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-4 w-4" />
          {t('admin.pickupSchedule.addSchedule')}
        </Button>
      </div>

      {/* Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">

          {loading ? (
            <div className="p-10 text-center text-gray-500">{t('admin.pickupSchedule.loading')}</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-xl font-medium">{t('admin.pickupSchedule.emptyTitle')}</p>
              <p className="mt-3">{t('admin.pickupSchedule.emptyHint')}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>{t('admin.pickupSchedule.thArea')}</TableHead>
                      <TableHead>{t('admin.pickupSchedule.thDate')}</TableHead>
                      <TableHead>{t('admin.pickupSchedule.thTime')}</TableHead>
                      <TableHead>{t('admin.pickupSchedule.thItems')}</TableHead>
                      <TableHead className="text-right">{t('admin.common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((sch) => (
                      <TableRow key={sch._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{sch.area}</TableCell>
                        <TableCell>
                          {formatDisplayDate(sch.schedule_date, dateLocale)}
                        </TableCell>
                        <TableCell>{sch.schedule_time.slice(0, 5)}</TableCell>
                        <TableCell>{sch.items}</TableCell>
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
                                formatDisplayDate(sch.schedule_date, dateLocale)
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

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {schedules.map((sch) => (
                  <div key={sch._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900">{sch.area}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
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
                              formatDisplayDate(sch.schedule_date, dateLocale)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">{t('admin.pickupSchedule.thDate')}: </span>
                        <span className="text-gray-800">{formatDisplayDate(sch.schedule_date, dateLocale)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.pickupSchedule.thTime')}: </span>
                        <span className="text-gray-800">{sch.schedule_time.slice(0, 5)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t('admin.pickupSchedule.thItems')}: </span>
                        <span className="text-gray-800">{sch.items}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] mx-auto">
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

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
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
    </div>
  );
}