import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Truck, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';

const collectorNotifications = [
  {
    id: '1',
    type: 'new-booking',
    title: 'New Pickup Booking Received',
    message: 'Priya Jayawardhana from Colombo 7 booked a pickup for 2 kg Iron & 1.5 kg Paper – Total est. LKR 550',
    timestamp: 'Today at 10:15 AM',
    isRead: false,
    icon: Truck,
  },
  {
    id: '2',
    type: 'pickup-completed',
    title: 'Pickup Completed Successfully',
    message: 'You completed collection for Rohan Silva (Colombo 7). Earnings: LKR 550 added to your pending payments.',
    timestamp: 'Yesterday at 12:40 PM',
    isRead: true,
    icon: CheckCircle,
  },
  {
    id: '3',
    type: 'payment-processed',
    title: 'Payment Processed',
    message: 'Your earnings of LKR 1,820 for last week have been transferred to your account.',
    timestamp: 'Jan 10, 2026',
    isRead: true,
    icon: DollarSign,
  },
  {
    id: '4',
    type: 'route-full',
    title: 'Pickup Route is Full',
    message: 'Colombo 6 route for Jan 16 is now full (12/12 bookings). No more slots available.',
    timestamp: 'Jan 15, 2026',
    isRead: false,
    icon: AlertTriangle,
  },
  {
    id: '5',
    type: 'schedule-reminder',
    title: 'Pickup Reminder',
    message: 'You have 8 pickups scheduled today (09:00 AM - 11:00 AM) in Colombo 7. Start route soon.',
    timestamp: 'Today at 08:00 AM',
    isRead: false,
    icon: Calendar,
  },
];

export function NotificationsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all'); // all / unread

  const filteredNotifications = collectorNotifications.filter((notif) =>
    filter === 'unread' ? !notif.isRead : true
  );

  const unreadCount = collectorNotifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    toast.success('All notifications marked as read', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Notifications
          </h1>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="border-teal-600 text-teal-700 hover:bg-teal-50"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All notifications</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
          </SelectContent>
        </Select>

        {unreadCount > 0 && (
          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="mt-2">When there's an update about bookings, pickups, or payments, it will appear here.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`overflow-hidden border-none shadow-sm transition-all ${
                !notif.isRead ? 'bg-teal-50 border-l-4 border-teal-500' : 'bg-white'
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  !notif.isRead ? 'bg-teal-100' : 'bg-gray-100'
                }`}>
                  <notif.icon className={`h-6 w-6 ${
                    !notif.isRead ? 'text-teal-700' : 'text-gray-600'
                  }`} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-gray-900">
                      {notif.title}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-gray-700">
                    {notif.message}
                  </p>

                  
                  {(notif.type === 'new-booking' || notif.type === 'pickup-completed') && (
                    <Button
                      variant="link"
                      className="text-teal-700 hover:text-teal-900 p-0 h-auto font-medium"
                      onClick={() => {
                        window.location.href = '/collector/pickups';
                      }}
                    >
                      View in Pickups →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredNotifications.length > 0 && filteredNotifications.length >= 5 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" className="px-8">
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}