import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';


const historyData = [
  {
    collectionDate: 'Jan 10, 2026',
    collector: 'Nimal',
    total: 'LKR 570',
    items: [
      { type: 'Iron', weight: '3kg', value: 'LKR 300' },
      { type: 'Plastic', weight: '2kg', value: 'LKR 180' },
      { type: 'Glass', weight: '1kg', value: 'LKR 90' },
    ],
  },
  {
    collectionDate: 'Jan 10, 2026',
    collector: 'Nimal',
    total: 'LKR 570',
    items: [
      { type: 'Iron', weight: '3kg', value: 'LKR 300' },
      { type: 'Plastic', weight: '2kg', value: 'LKR 180' },
      { type: 'Glass', weight: '1kg', value: 'LKR 90' },
    ],
  },
  {
    collectionDate: 'Jan 10, 2026',
    collector: 'Nimal',
    total: 'LKR 570',
    items: [
      { type: 'Iron', weight: '3kg', value: 'LKR 300' },
      { type: 'Plastic', weight: '2kg', value: 'LKR 180' },
      { type: 'Glass', weight: '1kg', value: 'LKR 90' },
    ],
  },
  {
    collectionDate: 'Jan 10, 2026',
    collector: 'Nimal',
    total: 'LKR 570',
    items: [
      { type: 'Iron', weight: '3kg', value: 'LKR 300' },
      { type: 'Plastic', weight: '2kg', value: 'LKR 180' },
      { type: 'Glass', weight: '1kg', value: 'LKR 90' },
    ],
  },
];

export function HistoryPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          History
        </h1>
        <p className="text-lg text-gray-600">
          Complete history of item submissions and earnings
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
          <Select defaultValue="all">
            <SelectTrigger className="w-40 h-9">
              <SelectValue>All statuses</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="all">All</SelectItem>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History Entries */}
      <div className="space-y-8">
        {historyData.map((entry, index) => (
          <Card
            key={index}
            className="overflow-hidden border-none shadow-md bg-[#f0f9f8] hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6 space-y-5">
              {/* Collection Date + Collector */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-teal-900 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-700" />
                  {entry.collectionDate} • Collected by {entry.collector}
                </h3>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 font-medium text-gray-700">Item</th>
                      <th className="pb-3 font-medium text-gray-700">Weight</th>
                      <th className="pb-3 font-medium text-gray-700">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-none">
                        <td className="py-3">{item.type}</td>
                        <td className="py-3">{item.weight}</td>
                        <td className="py-3 font-medium">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="text-xl font-bold text-teal-900">
                  {entry.total}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 pt-10 text-gray-600">
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
      {historyData.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">No collection history yet</p>
          <p className="mt-3">Once your items are collected, they'll appear here with full earnings details.</p>
        </div>
      )}
    </div>
  );
}