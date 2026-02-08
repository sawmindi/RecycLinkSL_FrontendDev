import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';

interface Category {
  id: string | number;
  name: string;
  unit: 'kg' | 'g' | string;
  description?: string;
  isActive: boolean;
}

export function CategoriesPage() {
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
    try {
      const res = await fetch('http://localhost:4000/api/categories/admin');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data.map((c: any) => ({
        ...c,
        isActive: c.is_active,          
      })));
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
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
      isActive: category.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      unit: formData.unit,
      description: formData.description || null,
      is_active: formData.isActive,
    };

    const url = currentCategory 
      ? `http://localhost:4000/api/categories/${currentCategory.id}`
      : 'http://localhost:4000/api/categories';
    
    const method = currentCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Operation failed');
      }

      toast.success(currentCategory ? 'Category updated!' : 'Category added!');
      resetForm();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchCategories(); 
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  // const handleToggleActive = async (category: Category) => {
  //   try {
  //     await fetch(`http://localhost:4000/api/categories/${category.id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ is_active: !category.isActive }),
  //     });
  //     toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
  //     fetchCategories();
  //   } catch (err) {
  //     toast.error('Status update failed');
  //   }
  // };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Category Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage recyclable material categories
          </p>
        </div>
        <Button 
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Layers className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">No categories yet</p>
          <p className="mt-3">Click "Add Category" to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
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
                      {category.isActive ? 'Active' : 'Inactive'}
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
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{category.name}</strong>? 
                          This will remove it from citizen view.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
              {currentCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Iron"
                  value={formData.name}
                  onChange={handleInputChange}
                  name="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(v) => handleSelectChange('unit', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Scrap iron and metal items"
                  value={formData.description}
                  onChange={handleInputChange}
                  name="description"
                  rows={3}
                />
              </div>

              {currentCategory && (
                <div className="flex items-center space-x-3 pt-3">
                  <Label htmlFor="isActive">Active Status</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <span className={formData.isActive ? 'text-green-600' : 'text-red-600'}>
                    {formData.isActive ? 'Active' : 'Inactive'}
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                >
                  {currentCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}