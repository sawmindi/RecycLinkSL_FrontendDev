import React, { useState, useEffect } from 'react';
import { Plus, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
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


export default function PriceManagementPage() {
  const [priceItems, setPriceItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
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
      const res = await fetch('http://localhost:4000/api/categories/admin');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchItems = async () => {
  setLoading(true);
  try {
    // console.log('Fetching items from backend...');
    const res = await fetch('http://localhost:4000/api/items');
    // console.log('Status:', res.status);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    // console.log('Real data received:', data);

    // Convert prices
    const enriched = data.map((item: any) => ({
      ...item,
      current_price: Number(item.current_price),
      previous_price: item.previous_price ? Number(item.previous_price) : null,
      change: item.previous_price 
        ? ((Number(item.current_price) - Number(item.previous_price)) / Number(item.previous_price)) * 100 
        : 0,
    }));

    setPriceItems(enriched);
  } catch (err: any) {
    console.error('Fetch error:', err);
    toast.error('Failed to load prices: ' + (err.message || 'Check backend'));
  } finally {
    setLoading(false);
    console.log('Fetch finished');
  }
};

  const resetForm = () => {
    setFormData({ category_id: '', itemName: '', currentPrice: '' });
    setCurrentItem(null);
  };

  const openModal = (item?: any) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        category_id: item.category_id || '',
        itemName: item.item_name || item.name,
        currentPrice: item.current_price.toString(),
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id || !formData.itemName || !formData.currentPrice) {
      toast.error('All fields required');
      return;
    }

    const payload = {
      category_id: Number(formData.category_id),
      name: formData.itemName,
      current_price: Number(formData.currentPrice),
    };

    const url = currentItem
    ? `http://localhost:4000/api/items/${currentItem.id}`
    : 'http://localhost:4000/api/items';

    const method = currentItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');
      toast.success(currentItem ? 'Price updated!' : 'Item price added!');
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await fetch(`http://localhost:4000/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' }),
      });
      toast.success(`Item ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
      fetchItems();
    } catch (err) {
      toast.error('Status update failed');
    }
  };


  const handleDelete = async (id) => {
    if (!confirm('Delete this price entry?')) return;
    try {
      await fetch(`http://localhost:4000/api/items/${id}`, { method: 'DELETE' });
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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Price Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage current and historical prices for recyclable items
          </p>
        </div>

        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
          onClick={() => openModal()}
        >
          <Plus className="h-4 w-4" />
          Add Item Price
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Item Prices</h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading prices...</div>
          ) : priceItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">No prices added yet</p>
              <p className="mt-3">Click "Add Item Price" to start managing.</p>
            </div>
          ) : (

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
                {priceItems.map((item:any) => (
                  <TableRow
                    key={item.id}
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
                      {getChangeDisplay(item.change)}
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
                        onClick={() => handleToggleActive(item.id, item.status)}
                      >
                        {item.status === 'active' ? (
                          <ToggleLeft className="h-5 w-5 text-orange-600" />
                        ) : (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Price Entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the price for <strong>{item.item_name}</strong>?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
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

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 p-6 border-t border-gray-200 text-gray-600">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-teal-700 text-white border-teal-700 hover:bg-teal-800">
                1
              </Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Price Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {currentItem ? 'Update Item Price' : 'Add New Item Price'}
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
                onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
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
              <div className="p-3 bg-gray-50 rounded border text-sm space-y-1">
                <p><strong>Current Price:</strong> LKR {currentItem.currentPrice}/kg</p>
                <p><strong>Last Updated:</strong> {currentItem.lastUpdated}</p>
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
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                {currentItem ? 'Update Price' : 'Add Price'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {priceItems.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-medium">No prices added yet</p>
          <p className="mt-3">Click "Add Item Price" to start managing.</p>
        </div>
      )}
    </div>
  );
}