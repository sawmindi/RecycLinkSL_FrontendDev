import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { getCitizenPickupRequests, type CitizenPickupRequest } from '../../../services/CitizenService';

type ItemStatusKey = 'collected' | 'scheduled' | 'pending';

export function MyItemsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<CitizenPickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const dateLocale = i18n.language.startsWith('si') ? 'si-LK' : 'en-US';

  useEffect(() => {
    getCitizenPickupRequests()
      .then((res) => {
        if (res.success) setItems(res.data);
        else setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const myItems = useMemo(() => {
    return items.map((r) => {
      const statusKey: ItemStatusKey =
        r.status === 'completed'
          ? 'collected'
          : r.status === 'assigned' || r.status === 'scheduled'
            ? 'scheduled'
            : 'pending';
      const dateStr = (d: string | undefined) =>
        d ? new Date(d).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const scheduleDate = r.schedule_date ? dateStr(r.schedule_date) : '';

      let footerScheduled = '';
      let footerCollected = '';
      if (statusKey === 'scheduled') {
        footerScheduled =
          r.schedule_date && r.assigned_collector
            ? t('citizen.myItems.pickupOnDateByCollector', { date: scheduleDate, collector: r.assigned_collector })
            : t('citizen.myItems.pendingSchedule');
      } else if (statusKey === 'collected' && r.schedule_date) {
        footerCollected = t('citizen.myItems.collectedOnDateByCollector', {
          date: scheduleDate,
          collector: r.assigned_collector || t('citizen.lists.collectorFallback'),
        });
      }

      return {
        id: r._id,
        type: r.item_name || r.category_name || t('citizen.dashboard.itemFallback'),
        statusKey,
        weight: `${Number(r.rough_weight) || 0} ${t('citizen.lists.kg')}`,
        estimatedValue: `LKR ${(Number(r.estimated_earnings) || 0).toFixed(2)}`,
        dateAdded: r.created_at
          ? new Date(r.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })
          : t('citizen.lists.emDash'),
        description: '',
        footerScheduled,
        footerCollected,
        isScheduledStatus: statusKey === 'scheduled',
      };
    });
  }, [items, dateLocale, t]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {t('citizen.myItems.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('citizen.myItems.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterDate')}</span>
            <Select defaultValue="last30days">
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30days">{t('citizen.lists.last30days')}</SelectItem>
                <SelectItem value="last90days">{t('citizen.lists.last90days')}</SelectItem>
                <SelectItem value="all">{t('citizen.lists.allTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterStatus')}</span>
            <Select defaultValue="scheduled">
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">{t('citizen.lists.scheduled')}</SelectItem>
                <SelectItem value="collected">{t('citizen.lists.collected')}</SelectItem>
                <SelectItem value="all">{t('citizen.lists.all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterSort')}</span>
            <Select defaultValue="newest">
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('citizen.lists.sortNewest')}</SelectItem>
                <SelectItem value="oldest">{t('citizen.lists.sortOldest')}</SelectItem>
                <SelectItem value="value-high">{t('citizen.lists.sortValueHighToLow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          {t('citizen.lists.exportList')}
        </Button>
      </div>

      {/* Items List */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingMyItems')}</p>
      ) : (
      <div className="space-y-5">
        {myItems.map((item) => (
          <Card key={item.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-900">{item.type}</h3>
                  <Badge
                    variant="outline"
                    className={`px-4 py-1 text-sm font-medium ${
                      item.statusKey === 'scheduled'
                        ? 'bg-teal-100 text-teal-800 border-teal-200'
                        : item.statusKey === 'collected'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    {t(`citizen.lists.${item.statusKey}`)}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">
                  {t('citizen.myItems.estimatedValueLabel')}{' '}
                  <span className="font-medium text-gray-900">{item.estimatedValue}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <p className="text-gray-500">{t('citizen.lists.weight')}</p>
                  <p className="font-medium text-gray-900 mt-1">{item.weight}</p>
                </div>

                <div>
                  <p className="text-gray-500">{t('citizen.lists.dateAdded')}</p>
                  <p className="font-medium text-gray-900 mt-1">{item.dateAdded}</p>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <p className="text-gray-500">{t('citizen.lists.description')}</p>
                  <p className="text-gray-900 mt-1">{item.description}</p>
                </div>
              </div>

              {/* Collection info */}
              {(item.footerScheduled || item.footerCollected) && (
              <div className="px-6 pb-6 pt-2 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50">
                {item.isScheduledStatus ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-700" />
                    <span>{item.footerScheduled}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-700" />
                    <span>{item.footerCollected}</span>
                  </div>
                )}
              </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <Button variant="outline" size="sm" disabled>
          {t('citizen.lists.previous')}
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            1
          </Button>
          <Button variant="default" size="sm" className="h-9 w-9 p-0 bg-teal-700 hover:bg-teal-800">
            2
          </Button>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            3
          </Button>
        </div>

        <Button variant="outline" size="sm">
          {t('citizen.lists.next')}
        </Button>
      </div>

      {/* Empty state */}
      {myItems.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">{t('citizen.myItems.noItemsTitle')}</p>
          <p className="mt-2">{t('citizen.myItems.noItemsHint')}</p>
          <Button className="mt-6 bg-teal-700 hover:bg-teal-800">
            {t('citizen.myItems.addItemsNow')}
          </Button>
        </div>
      )}
    </div>
  );
}
