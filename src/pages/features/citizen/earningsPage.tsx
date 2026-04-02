import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { getCitizenPickupRequests, type CitizenPickupRequest } from '../../../services/CitizenService';
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

type EarningStatusKey = 'collected' | 'scheduled' | 'pending';

export function EarningsPage() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState<CitizenPickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const dateLocale = getDateLocaleFromLanguage(i18n.language);

  useEffect(() => {
    getCitizenPickupRequests()
      .then((res) => {
        if (res.success) setRequests(res.data);
        else setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const earningsData = useMemo(() => {
    return requests.map((r) => {
      const statusKey: EarningStatusKey =
        r.status === 'completed'
          ? 'collected'
          : r.status === 'assigned' || r.status === 'scheduled'
            ? 'scheduled'
            : 'pending';
      const dateFmt = (d: string | undefined) =>
        d ? formatDisplayDate(d, dateLocale) : t('citizen.lists.emDash');
      const sched = r.schedule_date ? dateFmt(r.schedule_date) : t('citizen.lists.emDash');

      let pickupInfo = '';
      if (r.status === 'completed' && r.assigned_collector) {
        pickupInfo = t('citizen.earnings.collectedOnDateByCollector', {
          date: sched,
          collector: r.assigned_collector,
        });
      } else if (r.assigned_collector && r.schedule_date) {
        pickupInfo = t('citizen.earnings.scheduledForPickupBy', {
          date: sched,
          collector: r.assigned_collector,
        });
      } else {
        pickupInfo = t('citizen.lists.pending');
      }

      return {
        id: r._id,
        itemType: r.item_name || r.category_name || t('citizen.dashboard.itemFallback'),
        statusKey,
        weight: `${Number(r.rough_weight) || 0} ${t('citizen.lists.kg')}`,
        estimatedValue: `LKR ${(Number(r.estimated_earnings) || 0).toFixed(2)}`,
        dateAdded: r.created_at ? dateFmt(r.created_at) : t('citizen.lists.emDash'),
        description: '',
        pickupInfo,
      };
    });
  }, [requests, dateLocale, t]);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {t('citizen.earnings.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('citizen.earnings.subtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>{t('citizen.lists.filterDate')}</span>
          <Select defaultValue="last30days">
            <SelectTrigger className="w-40 h-9">
              <SelectValue>{t('citizen.lists.last30days')}</SelectValue>
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
            <SelectTrigger className="w-40 h-9">
              <SelectValue>{t('citizen.lists.scheduled')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t('citizen.lists.pending')}</SelectItem>
              <SelectItem value="scheduled">{t('citizen.lists.scheduled')}</SelectItem>
              <SelectItem value="collected">{t('citizen.lists.collected')}</SelectItem>
              <SelectItem value="all">{t('citizen.lists.allStatuses')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span>{t('citizen.lists.filterSort')}</span>
          <Select defaultValue="newest">
            <SelectTrigger className="w-40 h-9">
              <SelectValue>{t('citizen.lists.sortNewest')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('citizen.lists.sortNewest')}</SelectItem>
              <SelectItem value="oldest">{t('citizen.lists.sortOldest')}</SelectItem>
              <SelectItem value="value-high">{t('citizen.lists.sortHighestValue')}</SelectItem>
              <SelectItem value="value-low">{t('citizen.lists.sortLowestValue')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Earnings Cards Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingEarnings')}</p>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {earningsData.map((earning) => (
          <Card
            key={earning.id}
            className="overflow-hidden border-none shadow-md bg-[#f0f9f8] hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-teal-900">
                  {earning.itemType}
                </h3>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 font-medium ${
                    earning.statusKey === 'scheduled'
                      ? 'bg-teal-100 text-teal-800 border-teal-300'
                      : earning.statusKey === 'collected'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}
                >
                  {t(`citizen.lists.${earning.statusKey}`)}
                </Badge>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500">{t('citizen.lists.weight')}</p>
                  <p className="font-medium">{earning.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('citizen.lists.estimatedValue')}</p>
                  <p className="font-medium">{earning.estimatedValue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('citizen.lists.dateAdded')}</p>
                  <p className="font-medium">{earning.dateAdded}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{t('citizen.lists.description')}</p>
                  <p className="font-medium">{earning.description}</p>
                </div>
              </div>

              {/* Pickup Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200 text-gray-700">
                <Calendar className="h-5 w-5 text-teal-700" />
                <p>{earning.pickupInfo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 pt-8 text-gray-600">
        <Button variant="outline" size="sm" disabled>
          {t('citizen.lists.previous')}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-teal-700 text-white border-teal-700 hover:bg-teal-800">
            1
          </Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
        </div>
        <Button variant="outline" size="sm">
          {t('citizen.lists.next')}
        </Button>
      </div>

      {/* Empty state */}
      {earningsData.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">{t('citizen.earnings.noEarningsTitle')}</p>
          <p className="mt-2">{t('citizen.earnings.noEarningsHint')}</p>
        </div>
      )}
    </div>
  );
}
