import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users, ChevronDown, ChevronUp, Phone, Home, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';

// ── Static data ────────────────────────────────────────────────────────────

const pickupRoutes = [
  {
    id: '1',
    area: 'Kuruduwatta',
    date: 'Mon, Jan 15',
    time: '09:00 AM - 11:00 AM',
    citizens: 2,
    status: 'scheduled',
    citizensDetails: [
      {
        id: 'c1',
        name: 'Priya Jayawardhana',
        address: '123 Galle Road, Colombo 7',
        mobile: '+94770000000',
        items: [
          { type: 'Iron', estWeight: '2 kg', estValue: 'LKR 400' },
          { type: 'Paper', estWeight: '1.5 kg', estValue: 'LKR 150' },
        ],
        totalValue: 'LKR 550',
      },
      {
        id: 'c2',
        name: 'Rohan Silva',
        address: '123 Galle Road, Colombo 7',
        mobile: '+94770000000',
        items: [
          { type: 'Iron', estWeight: '2 kg', estValue: 'LKR 400' },
          { type: 'Paper', estWeight: '1.5 kg', estValue: 'LKR 150' },
        ],
        totalValue: 'LKR 550',
      },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function PickupsPage() {
  const { t } = useTranslation();

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [completedCitizens, setCompletedCitizens] = useState<string[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const toggleDetails = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  const openCompleteModal = (citizen: any) => {
    setSelectedCitizen(citizen);
    setIsCompleteModalOpen(true);
  };

  const handleCompletePickup = () => {
    if (selectedCitizen) {
      setCompletedCitizens((prev) => [...prev, selectedCitizen.id]);
    }
    toast.success(`Pickup completed for ${selectedCitizen?.name}!`, {
      position: 'top-right',
      autoClose: 4000,
    });
    setIsCompleteModalOpen(false);
    setNotes('');
    setSelectedCitizen(null);
  };

  const isCitizenCompleted = (citizenId: string) => completedCitizens.includes(citizenId);

  return (
    <div className="space-y-6 px-0 sm:space-y-8">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-serif tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
          Pickups
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Your scheduled collection routes with citizen details and estimated values
        </p>
      </div>

      {/* ── Route Cards ── */}
      <div className="space-y-4 sm:space-y-6">
        {pickupRoutes.map((route) => (
          <Card
            key={route.id}
            className="overflow-hidden border border-teal-100 shadow-md bg-[#f0f9f8]"
          >
            <CardContent className="p-0">

              {/* Route Header */}
              <div className="p-4 sm:p-6">
                {/* Top row: badge + title + actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  {/* Left: badge + area name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge className="shrink-0 bg-teal-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-1.5">
                      Schedule
                    </Badge>
                    <h3 className="truncate text-lg font-semibold text-teal-900 sm:text-xl">
                      {route.area}
                    </h3>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex gap-2 sm:gap-3 sm:shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:flex-none sm:text-sm"
                      onClick={() => toggleDetails(route.id)}
                    >
                      {expandedRoute === route.id ? (
                        <>
                          <ChevronUp className="mr-1 h-3.5 w-3.5" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3.5 w-3.5" />
                          Details
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-teal-700 text-xs hover:bg-teal-800 sm:flex-none sm:text-sm"
                    >
                      Start Route
                    </Button>
                  </div>
                </div>

                {/* Meta info row */}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0 text-teal-600" />
                    <span className="whitespace-nowrap">{route.date}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline whitespace-nowrap">{route.time}</span>
                  </span>
                  {/* Show time on its own line on mobile */}
                  <span className="flex items-center gap-1.5 sm:hidden">
                    <Clock className="h-4 w-4 shrink-0 text-transparent" />
                    <span className="text-gray-500">{route.time}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 shrink-0 text-teal-600" />
                    {route.citizens} citizens
                  </span>
                </div>
              </div>

              {/* ── Expanded Citizen Details ── */}
              {expandedRoute === route.id && (
                <div className="border-t border-teal-100 bg-white">
                  {route.citizensDetails.map((citizen, idx) => {
                    const completed = isCitizenCompleted(citizen.id);
                    return (
                      <div
                        key={citizen.id}
                        className={`p-4 sm:p-6 ${
                          idx < route.citizensDetails.length - 1
                            ? 'border-b border-gray-100'
                            : ''
                        } ${completed ? 'opacity-60' : ''}`}
                      >
                        {/* Citizen header: info + total */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              Citizen Details
                            </p>
                            <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
                              {citizen.name}
                            </p>
                            <div className="mt-1 space-y-0.5">
                              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Home className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <span className="truncate">{citizen.address}</span>
                              </p>
                              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                {citizen.mobile}
                              </p>
                            </div>
                          </div>
                          {/* Total value — right-aligned on sm+, left-aligned on mobile */}
                          <div className="sm:text-right">
                            <p className="text-xs text-gray-400">Est. Total</p>
                            <p className="text-xl font-bold text-teal-800 sm:text-2xl">
                              {citizen.totalValue}
                            </p>
                          </div>
                        </div>

                        {/* Items table */}
                        <div className="mt-4">
                          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Package className="h-4 w-4 text-teal-600" />
                            Items to collect
                          </p>

                          {/* Mobile: stacked cards */}
                          <div className="flex flex-col gap-2 sm:hidden">
                            {citizen.items.map((item: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                              >
                                <span className="font-medium text-gray-700">
                                  {item.type}
                                  <span className="ml-1.5 font-normal text-gray-500">
                                    {item.estWeight}
                                  </span>
                                </span>
                                <span className="font-semibold text-teal-700">{item.estValue}</span>
                              </div>
                            ))}
                          </div>

                          {/* Desktop: table */}
                          <div className="hidden sm:block">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                  <th className="pb-2 pr-4">Item</th>
                                  <th className="pb-2 pr-4">Est. Weight</th>
                                  <th className="pb-2 text-right">Est. Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {citizen.items.map((item: any, i: number) => (
                                  <tr key={i}>
                                    <td className="py-2 pr-4 font-medium text-gray-800">
                                      {item.type}
                                    </td>
                                    <td className="py-2 pr-4 text-gray-500">{item.estWeight}</td>
                                    <td className="py-2 text-right font-semibold text-teal-700">
                                      {item.estValue}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {!completed && (
                          <div className="mt-4 flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 sm:flex-none sm:px-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-teal-700 text-white hover:bg-teal-800 sm:flex-none sm:px-6"
                              onClick={() => openCompleteModal(citizen)}
                            >
                              Complete
                            </Button>
                          </div>
                        )}

                        {completed && (
                          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                            <span className="text-base">✓</span> Pickup completed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Empty State ── */}
      {pickupRoutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <div className="mb-4 rounded-full bg-gray-100 p-5">
            <MapPin className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-base font-semibold text-gray-500">No scheduled pickups today</p>
          <p className="mt-1 text-sm">Check back later for new routes</p>
        </div>
      )}

      {/* ── Complete Pickup Modal ── */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl p-0 sm:w-full">
          <DialogHeader className="px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
            <DialogTitle className="text-lg font-semibold sm:text-xl">
              Complete Pickup
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-5 py-4 sm:px-6 sm:py-5">
            {/* Summary banner */}
            <div className="rounded-xl bg-teal-50 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-sm font-medium text-teal-800">
                Recording collection for{' '}
                <span className="font-bold">{selectedCitizen?.name}</span>
              </p>
              <p className="mt-1 text-xl font-bold text-teal-700 sm:text-2xl">
                {selectedCitizen?.totalValue || 'LKR 550'}
              </p>
            </div>

            {/* Items with actual weight inputs */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Items to collect</h4>
              <div className="space-y-3">
                {selectedCitizen?.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4"
                  >
                    {/* Mobile: stacked layout */}
                    <div className="flex items-center justify-between sm:hidden">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.type}</p>
                        <p className="text-xs text-gray-500">Est. {item.estWeight}</p>
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="Actual (kg)"
                          className="h-8 border-teal-400 text-xs"
                        />
                      </div>
                    </div>

                    {/* Desktop: grid */}
                    <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:items-end">
                      <div>
                        <Label className="text-xs">Item Type</Label>
                        <Input value={item.type} disabled className="mt-1 bg-white text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Estimated Weight</Label>
                        <Input value={item.estWeight} disabled className="mt-1 bg-white text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Actual Weight</Label>
                        <Input
                          placeholder="e.g. 1.8 kg"
                          className="mt-1 border-teal-400 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium">Notes / Remarks (optional)</Label>
              <Textarea
                placeholder="Add any observations, issues, or extra details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1.5 resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 border-t border-gray-100 px-5 py-4 sm:px-6">
            <Button
              variant="outline"
              onClick={() => setIsCompleteModalOpen(false)}
              className="flex-1 text-sm sm:flex-none sm:px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompletePickup}
              className="flex-1 bg-teal-700 text-sm hover:bg-teal-800 sm:flex-none sm:px-6"
            >
              Complete Pickup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}