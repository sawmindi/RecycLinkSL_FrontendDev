import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, DollarSign, Truck, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const collectionHistory = [
  {
    id: '1',
    citizenName: 'Priya Jayawardhana',
    citizenMobile: '+94770000000',
    address: '123 Galle Road, Colombo 7',
    date: 'Oct 28, 2024',
    collector: 'Nimal',
    status: 'Completed',
    totalValue: 'LKR 550',
    items: [
      { type: 'Iron', weight: '2kg', value: 'LKR 400' },
      { type: 'Paper', weight: '1.5kg', value: 'LKR 150' },
    ],
  },
  {
    id: '2',
    citizenName: 'Rohan Silva',
    citizenMobile: '+94770000000',
    address: '123 Galle Road, Colombo 7',
    date: 'Oct 28, 2024',
    collector: 'Nimal',
    status: 'Cancelled',
    totalValue: 'LKR 550',
    items: [
      { type: 'Iron', weight: '2kg', value: 'LKR 400' },
      { type: 'Paper', weight: '1.5kg', value: 'LKR 150' },
    ],
  },
  {
    id: '3',
    citizenName: 'Priya Jayawardhana',
    citizenMobile: '+94770000000',
    address: '123 Galle Road, Colombo 7',
    date: 'Oct 27, 2025',
    collector: 'Nimal',
    status: 'Completed',
    totalValue: 'LKR 310',
    items: [
      { type: 'Paper', weight: '3.1kg', value: 'LKR 310' },
    ],
  },
];

export function CollectionHistoryPage() {
  const { t } = useTranslation();

  const stats = {
    totalCollections: 8,
    totalPaidOut: 'LKR 3,820',
    distanceCovered: '32.7 km',
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Collection History
        </h1>
        <p className="text-lg text-gray-600">
          Track your completed collections and performance metrics
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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

      {/* History Cards */}
      <div className="space-y-6">
        {collectionHistory.map((entry) => (
        <Card
            key={entry.id}
            className="overflow-hidden border-none shadow-md bg-[#f0f9f8] hover:shadow-lg transition-shadow w-full"
        >
            <CardContent className="p-6 space-y-5">
            {/* Citizen Details */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                <h4 className="font-semibold text-lg text-gray-900">
                    Citizen Details:
                </h4>
                <p className="text-gray-700 mt-1">{entry.citizenName}</p>
                <p className="text-sm text-gray-600">{entry.address}</p>
                <p className="text-sm text-gray-600">{entry.citizenMobile}</p>
                </div>

                <Badge
                variant="outline"
                className={`px-4 py-1.5 font-medium text-sm ${
                    entry.status === 'Completed'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}
                >
                {entry.status}
                </Badge>
            </div>

            {/* Items Collected */}
            <div>
                <h5 className="font-medium text-gray-800 mb-2">
                Item collected:
                </h5>
                <ul className="space-y-1 text-gray-700">
                {entry.items.map((item, i) => (
                    <li key={i} className="flex justify-between items-center">
                    <span>{item.type} {item.weight}</span>
                    <span className="font-medium">{item.value}</span>
                    </li>
                ))}
                </ul>
            </div>

            {/* Collection Info */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200 text-gray-700">
                <Calendar className="h-5 w-5 text-teal-700" />
                <p>Collected on {entry.date} by {entry.collector}</p>
            </div>

            {/* Total Value */}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="text-xl font-bold text-teal-900">
                {entry.totalValue}
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
      {collectionHistory.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">No collection history yet</p>
          <p className="mt-3">Completed pickups will appear here with full details.</p>
        </div>
      )}
    </div>
  );
}