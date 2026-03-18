import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { getCitizenPickupRequests, type CitizenPickupRequest } from '../../../services/CitizenService';

export function MyItemsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CitizenPickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCitizenPickupRequests()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const myItems = items.map((r) => ({
    id: r._id,
    type: r.item_name || r.category_name || 'Item',
    status: r.status === 'completed' ? 'Collected' : r.status === 'assigned' || r.status === 'scheduled' ? 'Scheduled' : 'Pending',
    weight: `${Number(r.rough_weight) || 0} kg`,
    estimatedValue: `LKR ${(Number(r.estimated_earnings) || 0).toFixed(2)}`,
    dateAdded: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    description: '',
    scheduledFor: r.schedule_date && r.assigned_collector
      ? `pickup on ${new Date(r.schedule_date).toLocaleDateString('en-GB')} by ${r.assigned_collector}`
      : 'Pending schedule',
    collectedOn: r.status === 'completed' && r.schedule_date
      ? `Collected on ${new Date(r.schedule_date).toLocaleDateString('en-GB')} by ${r.assigned_collector || 'collector'}`
      : '',
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          My Items
        </h1>
        <p className="text-lg text-gray-600">
          Track all your recyclable items and their collection status
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Date:</span>
            <Select defaultValue="last30days">
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Select defaultValue="scheduled">
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span>Sort:</span>
            <Select defaultValue="newest">
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="value-high">Value (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          Export List
        </Button>
      </div>

      {/* Items List */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading your items...</p>
      ) : (
      <div className="space-y-5">
        {myItems.map((item) => (
          <Card key={item.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-900">{item.type}</h3>
                  <Badge
                    variant="outline"
                    className={`px-4 py-1 text-sm font-medium ${
                      item.status === 'Scheduled'
                        ? 'bg-teal-100 text-teal-800 border-teal-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">
                  Estimated Value: <span className="font-medium text-gray-900">{item.estimatedValue}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <p className="text-gray-500">Weight</p>
                  <p className="font-medium text-gray-900 mt-1">{item.weight}</p>
                </div>

                <div>
                  <p className="text-gray-500">Date Added</p>
                  <p className="font-medium text-gray-900 mt-1">{item.dateAdded}</p>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <p className="text-gray-500">Description</p>
                  <p className="text-gray-900 mt-1">{item.description}</p>
                </div>
              </div>

              {/* Collection info */}
              <div className="px-6 pb-6 pt-2 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50">
                {item.status === 'Scheduled' ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-700" />
                    <span>Scheduled for pickup on {item.scheduledFor}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-700" />
                    <span>{item.collectedOn}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            1
          </Button>
          <Button variant="default" size="sm" className="h-9 w-9 p-0 bg-teal-700 hover:bg-teal-800">
            2
          </Button>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            3
          </Button>
        </div>

        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>

      {/* Empty state */}
      {myItems.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No items added yet</p>
          <p className="mt-2">Start by adding recyclable items in the "Add Items" section.</p>
          <Button className="mt-6 bg-teal-700 hover:bg-teal-800">
            Add Items Now
          </Button>
        </div>
      )}
    </div>
  );
}