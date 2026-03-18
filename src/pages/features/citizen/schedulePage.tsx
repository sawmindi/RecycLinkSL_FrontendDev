import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
import { AuthService } from '../../../services/AuthService';
import {
  getCitizenAvailableSchedules,
  getCitizenPickupRequests,
  assignScheduleToPickupRequest,
  type CitizenScheduleSlot,
} from '../../../services/CitizenService';

export function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasItems, setHasItems] = useState<boolean>(false);
  const [scheduleSlots, setScheduleSlots] = useState<CitizenScheduleSlot[]>([]);
  const [userArea, setUserArea] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recycLinkAddedItems');
    const items = stored ? JSON.parse(stored) : [];
    setHasItems(items.length > 0);
  }, []);

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data?.area) setUserArea(res.data.area);
    });
    Promise.all([
      getCitizenAvailableSchedules().then((slots) => {
        setScheduleSlots(slots);
        return slots;
      }),
      getCitizenPickupRequests().then((list) => {
        const pending = list.filter((r) => r.status === 'pending' || r.status === 'assigned').map((r) => r._id);
        setPendingRequestIds(pending);
        return pending;
      }),
    ]).catch(() => toast.error('Could not load schedules')).finally(() => setLoading(false));
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

  const handleScheduleClick = async (slotId: string) => {
    if (!hasItems && pendingRequestIds.length === 0) return;

    const requestId = pendingRequestIds[0];
    if (requestId) {
      try {
        await assignScheduleToPickupRequest(requestId, slotId);
        toast.success("Pickup scheduled successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } catch (err) {
        toast.error((err as Error).message || "Failed to schedule pickup");
        return;
      }
    } else {
      toast.success("Pickup scheduled successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }

    localStorage.removeItem('recycLinkAddedItems');
    setTimeout(() => navigate('/citizen/my-items'), 1500);
  };

  const areaLabel = userArea || 'your area';

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Schedule Pickup for {areaLabel}
        </h1>
        <p className="text-lg text-gray-600">
          Choose from available pickup slots in your area
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading schedules...</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduleSlots.map((slot) => (
          <Card
            key={slot._id}
            className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8] hover:bg-[#e6f5f3]"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-teal-900">
                  {slot.collector_name || 'Collector'}
                </h3>
                {(slot.spots_left ?? slot.spotsLeft) != null && (
                  <Badge
                    variant="secondary"
                    className="bg-teal-100 text-teal-800 hover:bg-teal-100 px-3 py-1 font-medium"
                  >
                    {(slot.spots_left ?? slot.spotsLeft)} spots left
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-teal-700" />
                <span>{slot.schedule_date ? new Date(slot.schedule_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="h-5 w-5 text-teal-700" />
                <span>{slot.schedule_time || '—'}</span>
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
                        onClick={() => handleScheduleClick(slot._id)}
                        disabled={!hasItems && pendingRequestIds.length === 0}
                        className={`w-full mt-4 text-base font-medium transition-all ${
                          hasItems || pendingRequestIds.length > 0
                            ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Schedule Pickup
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!hasItems && pendingRequestIds.length === 0 && (
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
      )}

      {!loading && scheduleSlots.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No pickup schedules available yet in your area.</p>
        </div>
      )}
    </div>
  );
}