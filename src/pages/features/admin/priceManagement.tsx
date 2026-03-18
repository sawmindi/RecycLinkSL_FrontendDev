import React, { useState, useEffect } from 'react';
import { Plus, Edit, ToggleLeft, ToggleRight, Trash2, Tag, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
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
    try {
      const data = await getCategoriesForSelect();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getItems();
      setPriceItems(data);
    } catch (err) {
      toast.error('Failed to load prices: ' + ((err as Error).message || 'Check backend'));
    } finally {
      setLoading(false);
    }
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
      toast.error('All fields required');
      return;
    }

    const payload = {
      category_id: formData.category_id,
      name: formData.itemName,
      current_price: Number(formData.currentPrice),
    };

    try {
      if (currentItem) {
        await updateItem(currentItem._id, payload);
      } else {
        await createItem(payload);
      }
      toast.success(currentItem ? 'Price updated!' : 'Item price added!');
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: string) => {
    try {
      await updateItem(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
      toast.success(`Item ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      fetchItems();
    } catch (err) {
      toast.error('Status update failed');
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Delete this price entry?')) return;
    try {
      await deleteItem(id);
      toast.success('Deleted');
      fetchItems();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getChangeDisplay = (change: number) => {
    if (change > 0) return <span className="text-green-600">↑ +{change.toFixed(1)}%</span>;
    if (change < 0) return <span className="text-red-600">↓ {change.toFixed(1)}%</span>;
    return <span className="text-gray-500">-</span>;
  };

  const ActionButtons = ({ item }: { item: PriceItem }) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(item)}>
        <Edit className="h-4 w-4 text-gray-600" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleToggleActive(item._id, item.status)}
      >
        {item.status === 'active'
          ? <ToggleLeft className="h-5 w-5 text-orange-600" />
          : <ToggleRight className="h-5 w-5 text-green-600" />
        }
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Price Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the price for <strong>{item.item_name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(item._id)}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 mb-1">
            Price Management
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage current and historical prices for recyclable items
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2 shrink-0"
          onClick={() => openModal()}
        >
          <Plus className="h-4 w-4" />
          Add Item Price
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading prices...</div>
      ) : priceItems.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No prices added yet</p>
          <p className="mt-2 text-sm">Click "Add Item Price" to start managing.</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {priceItems.map((item) => (
              <Card
                key={item._id}
                className={`border shadow-sm ${item.status === 'inactive' ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4 space-y-3">

                  {/* Top: item name + status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate">{item.item_name}</span>
                    <Badge
                      className={`shrink-0 ${item.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-red-100 text-red-800 hover:bg-red-100'}`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                      {item.category_name}
                    </Badge>
                  </div>

                  {/* Price grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Current Price</p>
                      <p className="font-semibold text-gray-900">LKR {item.current_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Previous Price</p>
                      <p className="font-medium text-gray-700">
                        {item.previous_price ? `LKR ${item.previous_price.toFixed(2)}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Change</p>
                      <p className="font-medium">{getChangeDisplay(item.change ?? 0)}</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 mt-[3px] shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Updated</p>
                        <p>{new Date(item.last_updated).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-1">
                    <ActionButtons item={item} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card className="hidden md:block border-none shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Item Prices</h3>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium text-gray-700">Item Name</TableHead>
                      <TableHead className="font-medium text-gray-700">Category</TableHead>
                      <TableHead className="font-medium text-gray-700">Current Price(LKR)</TableHead>
                      <TableHead className="font-medium text-gray-700">Previous Price(LKR)</TableHead>
                      <TableHead className="font-medium text-gray-700">Change</TableHead>
                      <TableHead className="font-medium text-gray-700">Last Updated</TableHead>
                      <TableHead className="font-medium text-gray-700">Status</TableHead>
                      <TableHead className="font-medium text-gray-700 text-right">Actions</TableHead>
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
                            {new Date(item.last_updated).toLocaleDateString('en-GB')}
                          </TableCell>
                        <TableCell>
                          <Badge
                            className={`px-3 py-1 ${
                              item.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionButtons item={item} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 text-gray-600">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <div className="flex gap-1 sm:gap-2">
                  <Button variant="outline" size="sm" className="bg-teal-700 text-white border-teal-700 hover:bg-teal-800 w-8 h-8 p-0">1</Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
                </div>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardContent>
          </Card>
          </>
      )}

          {/* Add/Edit Price Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle className="text-xl font-semibold">
                  {currentItem ? 'Update Item Price' : 'Add New Item Price'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                {/* Item Name */}
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    placeholder="e.g., Iron/Steel"
                    value={formData.itemName}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, category_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                  <Label>Price per Kg (LKR)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
                  />
                </div>

                {/* Context info for edit */}
                {currentItem && (
                  <div className="p-3 bg-gray-50 rounded-lg border text-sm space-y-1">
                    <p><strong>Current Price:</strong> LKR {currentItem.current_price}/kg</p>
                    <p><strong>Last Updated:</strong> {currentItem.last_updated}</p>
                  </div>
                )}

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white">
                    {currentItem ? 'Update Price' : 'Add Price'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    </div>
  );
}