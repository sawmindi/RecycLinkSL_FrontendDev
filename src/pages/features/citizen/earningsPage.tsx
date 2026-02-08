import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const earningsData = [
  {
    id: '1',
    itemType: 'Paper',
    status: 'Scheduled',
    weight: '3.1 kg',
    estimatedValue: 'LKR 310.00',
    dateAdded: 'Oct 27, 2025',
    description: 'Newspapers and magazines',
    pickupInfo: 'Scheduled for pickup on Oct 28, 2024 by Nimal',
  },
  {
    id: '2',
    itemType: 'Iron',
    status: 'Collected',
    weight: '3.1 kg',
    estimatedValue: 'LKR 310.00',
    dateAdded: 'Sep 1, 2025',
    description: 'Old iron pipes and metal scraps',
    pickupInfo: 'Collected on Sep 1, 2025 by Nimal',
  },
  {
    id: '3',
    itemType: 'Iron',
    status: 'Collected',
    weight: '3.1 kg',
    estimatedValue: 'LKR 310.00',
    dateAdded: 'Sep 1, 2025',
    description: 'Old iron pipes and metal scraps',
    pickupInfo: 'Collected on Sep 1, 2025 by Nimal',
  },
  {
    id: '4',
    itemType: 'Iron',
    status: 'Collected',
    weight: '3.1 kg',
    estimatedValue: 'LKR 310.00',
    dateAdded: 'Sep 1, 2025',
    description: 'Old iron pipes and metal scraps',
    pickupInfo: 'Collected on Sep 1, 2025 by Nimal',
  },
];

export function EarningsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Earnings
        </h1>
        <p className="text-lg text-gray-600">
          Complete record of your earnings
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Date:</span>
          <Select defaultValue="last30days">
            <SelectTrigger className="w-40 h-9">
              <SelectValue>Last 30 days</SelectValue>
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
            <SelectTrigger className="w-40 h-9">
              <SelectValue>Scheduled</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span>Sort:</span>
          <Select defaultValue="newest">
            <SelectTrigger className="w-40 h-9">
              <SelectValue>Newest</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="value-high">Highest value</SelectItem>
              <SelectItem value="value-low">Lowest value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Earnings Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {earningsData.map((earning) => (
          <Card
            key={earning.id}
            className="overflow-hidden border-none shadow-md bg-[#f0f9f8] hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-teal-900">
                  {earning.itemType}
                </h3>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 font-medium ${
                    earning.status === 'Scheduled'
                      ? 'bg-teal-100 text-teal-800 border-teal-300'
                      : earning.status === 'Collected'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}
                >
                  {earning.status}
                </Badge>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{earning.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Value</p>
                  <p className="font-medium">{earning.estimatedValue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Added</p>
                  <p className="font-medium">{earning.dateAdded}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{earning.description}</p>
                </div>
              </div>

              {/* Pickup Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200 text-gray-700">
                <Calendar className="h-5 w-5 text-teal-700" />
                <p>{earning.pickupInfo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 pt-8 text-gray-600">
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

      {/* Empty state */}
      {earningsData.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No earnings recorded yet.</p>
          <p className="mt-2">Start adding items to see your estimated earnings here.</p>
        </div>
      )}
    </div>
  );
}