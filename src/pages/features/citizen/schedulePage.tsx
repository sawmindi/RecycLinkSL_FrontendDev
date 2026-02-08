import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
const scheduleData = [
  { id: '1', collector: 'Kamal Silva', date: 'Saturday, October 28', time: '09.00 AM - 11.00 AM', area: 'Colombo 7', spotsLeft: 3 },
  { id: '2', collector: 'Johson Perera', date: 'Monday, October 30', time: '09.00 AM - 11.00 AM', area: 'Colombo 7', spotsLeft: 5 },
  { id: '3', collector: 'Kamal Silva', date: 'Tuesday, October 31', time: '09.00 AM - 11.00 AM', area: 'Colombo 7', spotsLeft: 2 },
  { id: '4', collector: 'Sunil Fernando', date: 'Wednesday, November 1', time: '09.00 AM - 11.00 AM', area: 'Colombo 7', spotsLeft: 4 },
  { id: '5', collector: 'Joseph Anthony', date: 'Thursday, November 2', time: '09.00 AM - 11.00 AM', area: 'Colombo 7', spotsLeft: 1 },
  { id: '6', collector: 'Sunil Fernando', date: 'Friday, November 3', time: '09.00 AM - 11.00 AM', area: 'Colombo 7', spotsLeft: 3 },
];

export function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasItems, setHasItems] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem('recycLinkAddedItems');
    const items = stored ? JSON.parse(stored) : [];
    setHasItems(items.length > 0);
  }, []);

  const cameFromAddItems = location.state?.from === 'add-items';

  useEffect(() => {
    if (cameFromAddItems && hasItems) {
      toast.info("You can now select a pickup slot!", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  }, [cameFromAddItems, hasItems]);

  const handleScheduleClick = (slotId: string) => {
    if (!hasItems) return;

    toast.success("Pickup scheduled successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    
    localStorage.removeItem('recycLinkAddedItems');

    setTimeout(() => {
      navigate('/citizen/my-items');
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Schedule Pickup for Colombo 7
        </h1>
        <p className="text-lg text-gray-600">
          Choose from available pickup slots in your area
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduleData.map((slot) => (
          <Card
            key={slot.id}
            className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8] hover:bg-[#e6f5f3]"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-teal-900">
                  {slot.collector}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-teal-100 text-teal-800 hover:bg-teal-100 px-3 py-1 font-medium"
                >
                  {slot.spotsLeft} spots left
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-teal-700" />
                <span>{slot.date}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="h-5 w-5 text-teal-700" />
                <span>{slot.time}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-teal-700" />
                <span>{slot.area}</span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        onClick={() => handleScheduleClick(slot.id)}
                        disabled={!hasItems}
                        className={`w-full mt-4 text-base font-medium transition-all ${
                          hasItems
                            ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Schedule Pickup
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!hasItems && (
                    <TooltipContent side="top" className="bg-gray-800 text-white border-none max-w-xs">
                      First, you need to add items. You can't select a schedule yet.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduleData.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No pickup schedules available yet in your area.</p>
        </div>
      )}
    </div>
  );
}