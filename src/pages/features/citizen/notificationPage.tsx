import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Package, Calendar, Info } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { useNavigate } from 'react-router-dom';

const notificationsData = [
  {
    id: '1',
    type: 'item-added',
    title: 'New item added to your list',
    message: 'You added 3.1 kg of Paper. Estimated earning: LKR 310.00',
    timestamp: 'Today at 2:45 PM',
    isRead: false,
    icon: Package,
  },
  {
    id: '2',
    type: 'pickup-scheduled',
    title: 'Pickup scheduled',
    message: 'Your items are scheduled for pickup on Oct 28, 2024 by Nimal between 9:00 AM - 11:00 AM',
    timestamp: 'Yesterday at 11:30 AM',
    isRead: true,
    icon: Calendar,
  },
  {
    id: '3',
    type: 'item-collected',
    title: 'Items collected',
    message: 'Your 3.1 kg of Iron was successfully collected. Earnings: LKR 310.00 added to your wallet.',
    timestamp: 'Sep 1, 2025',
    isRead: true,
    icon: CheckCircle,
  },
  {
    id: '4',
    type: 'system-update',
    title: 'New feature available',
    message: 'You can now track your pickup status in real-time from the My Items page.',
    timestamp: 'Aug 28, 2025',
    isRead: false,
    icon: Info,
  },
  {
    id: '5',
    type: 'price-update',
    title: 'Market price updated',
    message: 'Plastic prices increased by 15%. Your pending items may now have higher estimated value.',
    timestamp: 'Aug 25, 2025',
    isRead: true,
    icon: Bell,
  },
];

export function NotificationsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filteredNotifications = notificationsData.filter((notif) =>
    filter === 'unread' ? !notif.isRead : true
  );

  const unreadCount = notificationsData.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    toast.success('All notifications marked as read');
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
            <p className="mt-2">When there's an update about your items or earnings, it will appear here.</p>
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

                  {notif.type === 'pickup-scheduled' && (
                    <Button
                      variant="link"
                      className="text-teal-700 hover:text-teal-900 p-0 h-auto font-medium"
                      onClick={() => navigate('/citizen/my-items')}
                    >
                      View in My Items →
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