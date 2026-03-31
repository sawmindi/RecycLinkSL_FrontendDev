import React, { useState, useEffect } from 'react';
import { Plus, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'react-toastify';
import {
  getCategoriesForSelect,
  getItems,
  createItem,
  updateItem,
  deleteItem,
  type PriceItem,
} from '../../../services/AdminService';

export default function PriceManagementPage() {
  const { t, i18n } = useTranslation();
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PriceItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    category_id: '',
    itemName: '',
    currentPrice: '',
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategoriesForSelect();
    if (res.success) {
      setCategories(res.data);
    } else {
      await swalError(t('admin.priceManagement.toastLoadCategories'), res.message);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    const res = await getItems();
    if (res.success) {
      setPriceItems(res.data);
    } else {
      await swalError(t('admin.priceManagement.toastLoadPrices'), res.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ category_id: '', itemName: '', currentPrice: '' });
    setCurrentItem(null);
  };

  const openModal = (item?: PriceItem | null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        category_id: item.category_id ?? item._id ?? '',
        itemName: item.item_name ?? '',
        currentPrice: String(item.current_price ?? ''),
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.itemName || !formData.currentPrice) {
      await swalError(t('admin.priceManagement.toastAllFields'));
      return;
    }

    const payload = {
      category_id: formData.category_id,
      name: formData.itemName,
      current_price: Number(formData.currentPrice),
    };

    const res = currentItem
      ? await updateItem(currentItem._id, payload)
      : await createItem(payload);
    if (res.success) {
      await swalSuccess(currentItem ? t('admin.priceManagement.toastUpdated') : t('admin.priceManagement.toastAdded'));
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } else {
      await swalError(t('admin.priceManagement.toastOpFail'), res.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: string) => {
    const res = await updateItem(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
    if (res.success) {
      await swalSuccess(
        currentStatus === 'active'
          ? t('admin.priceManagement.toastDeactivated')
          : t('admin.priceManagement.toastActivated')
      );
      fetchItems();
    } else {
      await swalError(t('admin.priceManagement.toastStatusFail'), res.message);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    const ok = await swalConfirm({
      title: t('admin.priceManagement.deleteTitle'),
      text: t('admin.priceManagement.deleteDesc', { name: itemName }),
      confirmButtonText: t('admin.common.delete'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const res = await deleteItem(id);
    if (res.success) {
      await swalSuccess(t('admin.priceManagement.toastDeleted'));
      fetchItems();
    } else {
      await swalError(t('admin.priceManagement.toastDeleteFail'), res.message);
    }
  };

  const getChangeDisplay = (change: number) => {
    if (change > 0) return <span className="text-green-600">↑ +{change.toFixed(1)}%</span>;
    if (change < 0) return <span className="text-red-600">↓ {change.toFixed(1)}%</span>;
    return <span className="text-gray-500">—</span>;
  };

  const dateLocale = i18n.language.startsWith('si') ? 'si-LK' : 'en-GB';

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            {t('admin.priceManagement.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('admin.priceManagement.subtitle')}
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={() => openModal()}
        >
          <Plus className="h-4 w-4" />
          {t('admin.priceManagement.addItemPrice')}
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{t('admin.priceManagement.sectionTitle')}</h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">{t('admin.priceManagement.loading')}</div>
          ) : priceItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">{t('admin.priceManagement.emptyTitle')}</p>
              <p className="mt-3">{t('admin.priceManagement.emptyHint')}</p>
            </div>
          ) : (

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colItem')}</TableHead>
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colCategory')}</TableHead>
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colCurrent')}</TableHead>
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colPrevious')}</TableHead>
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colChange')}</TableHead>
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colUpdated')}</TableHead>
                  <TableHead className="font-medium text-gray-700">{t('admin.priceManagement.colStatus')}</TableHead>
                  <TableHead className="font-medium text-gray-700 text-right">{t('admin.priceManagement.colActions')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {priceItems.map((item) => (
                  <TableRow
                    key={item._id}
                    className={`hover:bg-gray-50 ${item.status === 'inactive' ? 'opacity-60 bg-gray-50' : ''}`}
                  >
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {item.category_name}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.current_price.toFixed(2)}</TableCell>
                    <TableCell>
                        {item.previous_price ? item.previous_price.toFixed(2) : '—'}
                      </TableCell>
                    <TableCell className="font-medium">
                      {getChangeDisplay(item.change ?? 0)}
                    </TableCell>
                    <TableCell>
                        {new Date(item.last_updated).toLocaleDateString(dateLocale)}
                      </TableCell>
                    <TableCell>
                      <Badge
                        className={`px-3 py-1 ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }`}
                      >
                        {item.status === 'active'
                          ? t('admin.common.active')
                          : item.status === 'inactive'
                            ? t('admin.common.inactive')
                            : item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openModal(item)}
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(item._id, item.status)}
                      >
                        {item.status === 'active' ? (
                          <ToggleLeft className="h-5 w-5 text-orange-600" />
                        ) : (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(item._id, item.item_name)}
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

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 text-gray-600">
            <Button variant="outline" size="sm" disabled>
              {t('admin.priceManagement.prev')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-teal-700 text-white border-teal-700 hover:bg-teal-800">
                1
              </Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
            </div>
            <Button variant="outline" size="sm">
              {t('admin.priceManagement.next')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Price Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {currentItem ? t('admin.priceManagement.modalEdit') : t('admin.priceManagement.modalAdd')}
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
            {/* Item Name */}
            <div className="space-y-2">
              <Label>{t('admin.priceManagement.itemName')}</Label>
              <Input
                placeholder={t('admin.priceManagement.itemPlaceholder')}
                value={formData.itemName}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t('admin.priceManagement.category')}</Label>
              <Select
                value={formData.category_id}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, category_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.priceManagement.selectCategory')} />
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

            {/* Current Price */}
            <div className="space-y-2">
              <Label>{t('admin.priceManagement.pricePerKg')}</Label>
              <Input
                type="number"
                placeholder={t('admin.priceManagement.pricePlaceholder')}
                value={formData.currentPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
              />
            </div>

            {/* Context info for edit */}
            {currentItem && (
              <div className="p-3 bg-gray-50 rounded border text-sm space-y-1">
                <p>
                  <strong>{t('admin.priceManagement.editCurrentPrice')}</strong> LKR {currentItem.current_price}
                  {t('admin.priceManagement.perKg')}
                </p>
                <p>
                  <strong>{t('admin.priceManagement.editLastUpdated')}</strong> {currentItem.last_updated}
                </p>
              </div>
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
                {t('admin.common.cancel')}
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                {currentItem ? t('admin.priceManagement.updatePrice') : t('admin.priceManagement.addPrice')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {priceItems.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-medium">{t('admin.priceManagement.emptyTitle')}</p>
          <p className="mt-3">{t('admin.priceManagement.emptyHint')}</p>
        </div>
      )}
    </div>
  );
}