import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Truck, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { getCollectorNotifications, type CollectorNotification } from '../../../services/CollectorService';
import { formatSmartDateTime, getDateLocaleFromLanguage } from '../../../lib/formatDate';

function notificationIcon(type: string) {
  switch (type) {
    case 'pickup-completed':
      return CheckCircle;
    case 'payment-processed':
      return DollarSign;
    case 'route-full':
      return AlertTriangle;
    case 'schedule-reminder':
      return Calendar;
    case 'new-booking':
    default:
      return Truck;
  }
}

export function NotificationsPage() {
  const { i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [filter, setFilter] = useState('all'); // all / unread
  const [notifications, setNotifications] = useState<CollectorNotification[]>([]);

  useEffect(() => {
    getCollectorNotifications().then((res) => {
      if (res.success) setNotifications(res.data);
    });
  }, []);

  const filteredNotifications = notifications.filter((notif) =>
    filter === 'unread' ? !notif.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
          filteredNotifications.map((notif) => {
            const Icon = notificationIcon(notif.type);
            return (
            <Card
              key={notif._id}
              className={`overflow-hidden border-none shadow-sm transition-all ${
                !notif.isRead ? 'bg-teal-50 border-l-4 border-teal-500' : 'bg-white'
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  !notif.isRead ? 'bg-teal-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    !notif.isRead ? 'text-teal-700' : 'text-gray-600'
                  }`} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-gray-900">
                      {notif.title}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatSmartDateTime(notif.timestamp, dateLocale)}
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
          );
          })
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