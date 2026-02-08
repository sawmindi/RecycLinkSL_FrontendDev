import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { useTranslation } from 'react-i18next';


interface Item {
  id: number;
  item_name: string;
  current_price: number;
  category_name?: string;  
  category_id: number;
}

interface AddedItem {
  id: string;
  itemId: number;
  itemType: string;
  weight: number;
  unit: 'g' | 'kg';
  description?: string;
  estimatedEarning: number;
}

export function AddItemPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [itemId, setItemId] = useState<string>(''); 
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<'g' | 'kg'>('kg');
  const [description, setDescription] = useState<string>('');
  const [estimatedEarning, setEstimatedEarning] = useState<number | null>(null);
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);


  useEffect(() => {
    const stored = localStorage.getItem('recycLinkAddedItems');
    if (stored) {
      setAddedItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/items/active');
        if (!res.ok) throw new Error('Failed to load items');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        toast.error('Could not load item items. Backend may be down.');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, []);

  const selectedItem = items.find(c => c.id === Number(itemId));

  const canGetEstimate =
    itemId !== '' &&
    weight !== '' &&
    !isNaN(Number(weight)) &&
    Number(weight) > 0 &&
    selectedItem !== undefined;

  const handleGetEstimate = () => {
    if (!selectedItem) return;

    const weightKg = Number(weight) / (unit === 'g' ? 1000 : 1);
    const earning = weightKg * selectedItem.current_price;

    setEstimatedEarning(Math.round(earning));
  };

  const handleAddToList = async () => {
    if (!canGetEstimate || estimatedEarning === null || !selectedItem) return;

    try {
      const res = await fetch('http://localhost:4000/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: selectedItem.id,
          rough_weight: Number(weight) / (unit === 'g' ? 1000 : 1), 
          priority: 'medium', 
          estimated_earnings: estimatedEarning,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save item');
      }

      toast.success('Item saved to your pickup requests!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save item to backend. Saved locally only.');
    }

    const newItem: AddedItem = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemType: selectedItem.item_name,
      weight: Number(weight),
      unit,
      description: description.trim() || undefined,
      estimatedEarning,
    };

    const updated = [...addedItems, newItem];
    setAddedItems(updated);
    localStorage.setItem('recycLinkAddedItems', JSON.stringify(updated));

    // Reset form
    setItemId('');
    setWeight('');
    setUnit('kg');
    setDescription('');
    setEstimatedEarning(null);
  };

  const handleRemoveItem = (id: string) => {
    const updated = addedItems.filter(i => i.id !== id);
    setAddedItems(updated);
    localStorage.setItem('recycLinkAddedItems', JSON.stringify(updated));
  };

  const totalEarning = addedItems.reduce((sum, i) => sum + i.estimatedEarning, 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {t('citizen.addItems')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('citizen.selectYourRecyclableItemsAndGetReal-timeEstimates')}
        </p>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-8">
          {loadingItems ? (
            <p className="text-center text-gray-500">Loading items from database...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t('citizen.itemType')}</Label>
                <Select value={itemId} onValueChange={setItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('citizen.selectItemType')}/>
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(i=> (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.item_name} (Rs. {(Number(i.current_price) || 0).toFixed(2)}/kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('citizen.weight')}</Label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder={t('citizen.enterWeight')}
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    min="0.1"
                    step="0.1"
                    className="flex-1"
                  />
                  <Select value={unit} onValueChange={v => setUnit(v as 'g' | 'kg')}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('citizen.description')} ({t('citizen.optional')})</Label>
            <Textarea
              placeholder={t('citizen.addAnyExtraDetails')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGetEstimate}
              disabled={!canGetEstimate}
              className={`px-10 py-6 text-lg ${
                canGetEstimate ? 'bg-teal-700 hover:bg-teal-800 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('citizen.getEstimate')}
            </Button>
          </div>

          {estimatedEarning !== null && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-center space-y-4">
              <p className="text-lg text-teal-800">
                {t('citizen.estimatedEarningFor')} {selectedItem?.item_name}: ~LKR {estimatedEarning.toLocaleString()} 
                ({(estimatedEarning / (Number(weight) || 1) * (unit === 'g' ? 1000 : 1)).toFixed(2)} per kg)
              </p>
              <Button
                onClick={handleAddToList}
                className="bg-teal-700 hover:bg-teal-800 text-white px-10 py-6 text-lg"
              >
                {t('citizen.addToList')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {addedItems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('citizen.addedItems')} ({addedItems.length}) – {t('citizen.totalEst')}. LKR {totalEarning.toLocaleString()}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {addedItems.map(item => (
              <Card key={item.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{item.itemType}</h3>
                      <p>{item.weight} {item.unit}</p>
                      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                  <p className="mt-2 text-teal-700 font-medium">
                    Est. LKR {item.estimatedEarning.toLocaleString()}.00
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              className="bg-teal-700 hover:bg-teal-800 text-white px-12 py-7 text-lg"
              onClick={() => navigate('/citizen/schedules', { state: { from: 'add-items' } })}
            >
              {t('citizen.proceedToSchedulePickup')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}