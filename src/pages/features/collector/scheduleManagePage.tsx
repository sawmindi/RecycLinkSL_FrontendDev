import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, DollarSign, Users, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { getCollectorSchedules, type CollectorScheduleWithBookings } from '../../../services/CollectorService';
import { formatDisplayTimeHm, formatScheduleSlotDateLong, getDateLocaleFromLanguage } from '../../../lib/formatDate';

export function ScheduleManagementPage() {
  const { i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [routesToday, setRoutesToday] = useState<CollectorScheduleWithBookings[]>([]);

  useEffect(() => {
    getCollectorSchedules().then((res) => {
      if (res.success) setRoutesToday(res.data);
    });
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Schedule Management
        </h1>
        <p className="text-lg text-gray-600">
          Your pickup schedules for different areas
        </p>
      </div>


      {/* Today's Pickup Routes */}
      <div className="space-y-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routesToday.map((route, index) => {
            const progress =
              route.maxBookings > 0 ? (route.bookings / route.maxBookings) * 100 : 0;
            const isFull = route.bookings >= route.maxBookings;
            const dateLabel = route.schedule_date
              ? formatScheduleSlotDateLong(route.schedule_date, dateLocale)
              : '—';
            const timeLabel = formatDisplayTimeHm(route.schedule_time, dateLocale);

            return (
              <Card
                key={route._id || index}
                className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8]"
              >
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`px-4 py-1.5 text-sm font-medium ${
                          isFull ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-700 hover:bg-teal-800'
                        } text-white`}
                      >
                        {isFull ? 'Full' : 'Schedule'}
                      </Badge>
                      <h3 className="text-xl font-semibold text-teal-900">
                        {route.area}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-teal-700" />
                      <span>{dateLabel} • {timeLabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-teal-700" />
                      <span>{route.bookings}/{route.maxBookings} bookings</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <Progress
                      value={progress}
                      className="h-2.5"
                    />
                  </div>

                  
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {routesToday.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No pickup routes scheduled today</p>
          <p className="mt-2">New schedules will appear here when citizens book.</p>
        </div>
      )}
    </div>
  );
}