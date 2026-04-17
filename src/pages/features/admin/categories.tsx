import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '../../../services/AdminService';

export function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategories();
    if (res.success) {
      setCategories(res.data);
    } else {
      await swalError(t('admin.categories.toastLoadFail'), res.message);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price_per_kg' ? value : value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, unit: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', unit: 'kg', description: '', isActive: true });
    setCurrentCategory(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      unit: category.unit,
      description: category.description || '',
      isActive: category.isActive ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit) {
      await swalError(t('admin.categories.toastRequired'));
      return;
    }

    const payload = {
      name: formData.name,
      unit: formData.unit,
      description: formData.description || null,
      is_active: formData.isActive,
    };

    const res = currentCategory
      ? await updateCategory(currentCategory._id, payload)
      : await createCategory(payload);
    if (res.success) {
      await swalSuccess(currentCategory ? t('admin.categories.toastUpdated') : t('admin.categories.toastAdded'));
      resetForm();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchCategories();
    } else {
      await swalError(t('admin.categories.toastGeneric'), res.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await swalConfirm({
      title: t('admin.categories.deleteTitle'),
      text: t('admin.categories.deleteDesc', { name }),
      confirmButtonText: t('admin.common.delete'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const res = await deleteCategory(id);
    if (res.success) {
      await swalSuccess(t('admin.categories.toastDeleted'));
      fetchCategories();
    } else {
      await swalError(t('admin.categories.toastDeleteFail'), res.message);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            {t('admin.categories.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('admin.categories.subtitle')}
          </p>
        </div>
        <Button 
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-4 w-4" />
          {t('admin.categories.addCategory')}
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-10">{t('admin.categories.loading')}</p>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Layers className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">{t('admin.categories.emptyTitle')}</p>
          <p className="mt-3">{t('admin.categories.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8]"
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-100 rounded-full">
                      <Layers className="h-6 w-6 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-teal-900">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={`px-4 py-1.5 font-medium ${
                        category.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      {category.isActive ? t('admin.common.active') : t('admin.common.inactive')}
                    </Badge>
                  </div>
                </div>

                {category.description && (
                  <p className="text-gray-700 text-sm border-t pt-3">
                    {category.description}
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-teal-700 text-teal-700 hover:bg-teal-50"
                    onClick={() => handleOpenEditModal(category)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('admin.common.edit')}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(category._id, category.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {currentCategory ? t('admin.categories.modalEdit') : t('admin.categories.modalAdd')}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.categories.nameLabel')}</Label>
                <Input
                  id="name"
                  placeholder={t('admin.categories.namePlaceholder')}
                  value={formData.name}
                  onChange={handleInputChange}
                  name="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">{t('admin.categories.unitLabel')}</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(v) => handleSelectChange(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.categories.unitPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('admin.categories.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('admin.categories.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={handleInputChange}
                  name="description"
                  rows={3}
                />
              </div>

              {currentCategory && (
                <div className="flex items-center space-x-3 pt-3">
                  <Label htmlFor="isActive">{t('admin.categories.activeStatus')}</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <span className={formData.isActive ? 'text-green-600' : 'text-red-600'}>
                    {formData.isActive ? t('admin.common.active') : t('admin.common.inactive')}
                  </span>
                </div>
              )}

              <DialogFooter className="pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  {t('admin.common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                >
                  {currentCategory ? t('admin.categories.update') : t('admin.categories.create')}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}