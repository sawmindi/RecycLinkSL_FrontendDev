import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Package, Calendar, Info, LucideIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCitizenNotifications } from '../../../services/CitizenService';

const iconMap: Record<string, LucideIcon> = {
  'item-added': Package,
  'pickup-scheduled': Calendar,
  'item-collected': CheckCircle,
  'system-update': Info,
  'price-update': Bell,
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: LucideIcon;
};

export function NotificationsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [notificationsData, setNotificationsData] = useState<NotificationItem[]>([]);
  const [hydratedFromApi, setHydratedFromApi] = useState(false);

  const demoNotifications = useMemo<NotificationItem[]>(
    () => [
      {
        id: '1',
        type: 'item-added',
        title: t('citizen.notifications.demo.n1Title'),
        message: t('citizen.notifications.demo.n1Message'),
        timestamp: t('citizen.notifications.demo.n1Time'),
        isRead: false,
        icon: Package,
      },
      {
        id: '2',
        type: 'pickup-scheduled',
        title: t('citizen.notifications.demo.n2Title'),
        message: t('citizen.notifications.demo.n2Message'),
        timestamp: t('citizen.notifications.demo.n2Time'),
        isRead: true,
        icon: Calendar,
      },
      {
        id: '3',
        type: 'item-collected',
        title: t('citizen.notifications.demo.n3Title'),
        message: t('citizen.notifications.demo.n3Message'),
        timestamp: t('citizen.notifications.demo.n3Time'),
        isRead: true,
        icon: CheckCircle,
      },
      {
        id: '4',
        type: 'system-update',
        title: t('citizen.notifications.demo.n4Title'),
        message: t('citizen.notifications.demo.n4Message'),
        timestamp: t('citizen.notifications.demo.n4Time'),
        isRead: false,
        icon: Info,
      },
      {
        id: '5',
        type: 'price-update',
        title: t('citizen.notifications.demo.n5Title'),
        message: t('citizen.notifications.demo.n5Message'),
        timestamp: t('citizen.notifications.demo.n5Time'),
        isRead: true,
        icon: Bell,
      },
    ],
    [t]
  );

  useLayoutEffect(() => {
    if (!hydratedFromApi) {
      setNotificationsData(demoNotifications);
    }
  }, [demoNotifications, hydratedFromApi]);

  useEffect(() => {
    getCitizenNotifications().then((res) => {
      if (res.success && res.data.length > 0) {
        setHydratedFromApi(true);
        setNotificationsData(
          res.data.map((n) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.timestamp,
            isRead: n.isRead,
            icon: iconMap[n.type] ?? Bell,
          }))
        );
      }
    });
  }, []);

  const filteredNotifications = notificationsData.filter((notif) =>
    filter === 'unread' ? !notif.isRead : true
  );

  const unreadCount = notificationsData.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    toast.success(t('citizen.notifications.toastAllRead'));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            {t('citizen.notifications.title')}
          </h1>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="border-teal-600 text-teal-700 hover:bg-teal-50"
          >
            {t('citizen.notifications.markAllRead')}
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('citizen.notifications.filterPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('citizen.notifications.allNotifications')}</SelectItem>
            <SelectItem value="unread">{t('citizen.notifications.unreadOnly')}</SelectItem>
          </SelectContent>
        </Select>

        {unreadCount > 0 && (
          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
            {t('citizen.notifications.unreadCount', { count: unreadCount })}
          </Badge>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{t('citizen.notifications.emptyTitle')}</p>
            <p className="mt-2">{t('citizen.notifications.emptyHint')}</p>
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
                      {t('citizen.notifications.viewInMyItems')}
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
            {t('citizen.notifications.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
