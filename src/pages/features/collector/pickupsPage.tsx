import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';


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
      position: "top-right",
      autoClose: 4000,
    });

   
    setIsCompleteModalOpen(false);
    setNotes('');
    setSelectedCitizen(null);

  };

  const isCitizenCompleted = (citizenId: string) => completedCitizens.includes(citizenId);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Pickups
        </h1>
        <p className="text-lg text-gray-600">
          Your scheduled collection routes with citizen details and estimated values
        </p>
      </div>

      <div className="space-y-6">
        {pickupRoutes.map((route) => (
          <Card key={route.id} className="overflow-hidden border-none shadow-md bg-[#f0f9f8]">
            <CardContent className="p-0">
              {/* Route Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-teal-700 text-white px-4 py-1.5">
                      Schedule
                    </Badge>
                    <h3 className="text-xl font-semibold text-teal-900">
                      {route.area}
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDetails(route.id)}
                    >
                      {expandedRoute === route.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button size="sm" className="bg-teal-700 hover:bg-teal-800">
                      Start Route
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-teal-700" />
                    <span>{route.date} • {route.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-teal-700" />
                    <span>{route.citizens} citizens</span>
                  </div>
                </div>
              </div>

              {/* Expanded Citizens */}
              {expandedRoute === route.id && (
                <div className="border-t border-gray-200 bg-white p-6 space-y-6">
                  {route.citizensDetails.map((citizen) => {
                    const completed = isCitizenCompleted(citizen.id);

                    return (
                      <div
                        key={citizen.id}
                        className={`space-y-4 border-b border-gray-100 last:border-none pb-6 last:pb-0 ${
                          completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              Citizen Details:
                            </h4>
                            <p className="text-gray-700 mt-1">{citizen.name}</p>
                            <p className="text-sm text-gray-600">{citizen.address}</p>
                            <p className="text-sm text-gray-600">{citizen.mobile}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-teal-900">
                              {citizen.totalValue}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">
                            Items to collect:
                          </h5>
                          <ul className="space-y-1 text-gray-700">
                            {citizen.items.map((item: any, i: number) => (
                              <li key={i} className="flex justify-between">
                                <span>{item.type} {item.estWeight}</span>
                                <span>{item.estValue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {!completed && (
                          <div className="flex gap-4 pt-4">
                            <Button
                              variant="outline"
                              className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 bg-teal-700 hover:bg-teal-800 text-white"
                              onClick={() => openCompleteModal(citizen)}
                            >
                              Complete
                            </Button>
                          </div>
                        )}

                        {/* Completed status */}
                        {completed && (
                          <div className="pt-4 text-center text-green-700 font-medium">
                            ✓ Pickup completed
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

      {/* Complete Pickup Modal */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Complete Pickup
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="font-medium text-teal-900">
                Record the actual collection details for {selectedCitizen?.name}
              </p>
              <p className="text-xl font-bold text-teal-800 mt-2">
                LKR {selectedCitizen?.totalValue?.replace('LKR ', '') || '550'}
              </p>
            </div>

            {/* Item List with Actual Weight */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Items to collect:</h4>
              {selectedCitizen?.items.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-3 gap-4 items-end border-b pb-3 last:border-none">
                  <div>
                    <Label>Item Type</Label>
                    <Input value={item.type} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Estimated Weight</Label>
                    <Input value={item.estWeight} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Actual Weight</Label>
                    <Input placeholder="Enter actual weight (kg)" className="border-teal-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes / Remarks (optional)</Label>
              <Textarea
                placeholder="Add any observations, issues, or extra details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsCompleteModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompletePickup}
              className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-800"
            >
              Complete Pickup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {pickupRoutes.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No scheduled pickups today</p>
        </div>
      )}
    </div>
  );
}