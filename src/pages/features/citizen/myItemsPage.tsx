import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { getCitizenPickupRequests, type CitizenPickupRequest } from '../../../services/CitizenService';
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';
import { AuthService } from '../../../services/AuthService';
import { cancelCitizenPickupRequest } from '../../../services/pickupCancel';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';

type ItemStatusKey = 'collected' | 'scheduled' | 'pending' | 'cancelled';

const ITEMS_PER_PAGE = 1;

export function MyItemsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<CitizenPickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortFilter, setSortFilter] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadItems = useCallback(() => {
    setLoading(true);
    getCitizenPickupRequests()
      .then((res) => {
        if (res.success) setItems(res.data);
        else setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, sortFilter]);

  const handleCancelPickup = async (requestId: string) => {
    const ok = await swalConfirm({
      title: t('citizen.myItems.confirmCancelTitle'),
      text: t('citizen.myItems.confirmCancelText'),
      confirmButtonText: t('citizen.myItems.cancelPickup'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const me = await AuthService.getMe();
    if (!me.success || !me.data?._id) {
      await swalError(t('citizen.myItems.toastCancelFail'), t('citizen.myItems.toastNeedLogin'));
      return;
    }
    const res = await cancelCitizenPickupRequest(requestId);
    if (res.success) {
      await swalSuccess(t('citizen.myItems.toastCancelOk'));
      loadItems();
    } else {
      await swalError(t('citizen.myItems.toastCancelFail'), res.message);
    }
  };

  const allMappedItems = useMemo(() => {
    return items.map((r) => {
      const s = (r.status || '').toLowerCase();
      const statusKey: ItemStatusKey =
        s === 'completed'
          ? 'collected'
          : s === 'cancelled' || s === 'canceled'
            ? 'cancelled'
            : s === 'assigned' || s === 'scheduled'
              ? 'scheduled'
              : 'pending';
      const canCancel = statusKey === 'pending' || statusKey === 'scheduled';
      const dateStr = (d: string | undefined) => (d ? formatDisplayDate(d, dateLocale) : '');
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
        canCancel,
        weight: `${Number(r.rough_weight) || 0} ${t('citizen.lists.kg')}`,
        estimatedValue: `LKR ${(Number(r.estimated_earnings) || 0).toFixed(2)}`,
        estimatedValueRaw: Number(r.estimated_earnings) || 0,
        dateAdded: r.created_at ? formatDisplayDate(r.created_at, dateLocale) : t('citizen.lists.emDash'),
        createdAtRaw: r.created_at ? new Date(r.created_at) : null,
        description: '',
        footerScheduled,
        footerCollected,
        isScheduledStatus: statusKey === 'scheduled',
      };
    });
  }, [items, dateLocale, t]);

  const filteredItems = useMemo(() => {
    const now = new Date();

    let result = allMappedItems.filter((item) => {
      if (statusFilter !== 'all' && item.statusKey !== statusFilter) return false;

      if (dateFilter !== 'all' && item.createdAtRaw) {
        const created = item.createdAtRaw;
        if (dateFilter === 'thisweek') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);
          if (created < cutoff) return false;
        } else if (dateFilter === 'thismonth') {
          if (
            created.getMonth() !== now.getMonth() ||
            created.getFullYear() !== now.getFullYear()
          )
            return false;
        } else if (dateFilter === 'lastmonth') {
          const cutoff = new Date(now);
          cutoff.setMonth(now.getMonth() - 1);
          if (created < cutoff) return false;
        } else if (dateFilter === 'last2months') {
          const cutoff = new Date(now);
          cutoff.setMonth(now.getMonth() - 2);
          if (created < cutoff) return false;
        }
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortFilter === 'newest') {
        return (b.createdAtRaw?.getTime() ?? 0) - (a.createdAtRaw?.getTime() ?? 0);
      } else if (sortFilter === 'oldest') {
        return (a.createdAtRaw?.getTime() ?? 0) - (b.createdAtRaw?.getTime() ?? 0);
      } else if (sortFilter === 'value-high') {
        return b.estimatedValueRaw - a.estimatedValueRaw;
      }
      return 0;
    });

    return result;
  }, [allMappedItems, statusFilter, dateFilter, sortFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const near = new Set([1, totalPages, safePage, safePage - 1, safePage + 1].filter((n) => n >= 1 && n <= totalPages));
    const sorted = [...near].sort((a, b) => a - b);
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) pages.push('...');
      pages.push(n);
    });
    return pages;
  }, [totalPages, safePage]);

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

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterDate')}</span>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisweek">{t('citizen.lists.thisWeek')}</SelectItem>
                <SelectItem value="thismonth">{t('citizen.lists.thisMonth')}</SelectItem>
                <SelectItem value="lastmonth">{t('citizen.lists.lastMonth')}</SelectItem>
                <SelectItem value="last2months">{t('citizen.lists.last2Months')}</SelectItem>
                <SelectItem value="all">{t('citizen.lists.allTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterStatus')}</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('citizen.lists.all')}</SelectItem>
                <SelectItem value="scheduled">{t('citizen.lists.scheduled')}</SelectItem>
                <SelectItem value="collected">{t('citizen.lists.collected')}</SelectItem>
                <SelectItem value="pending">{t('citizen.lists.pending')}</SelectItem>
                <SelectItem value="cancelled">{t('citizen.lists.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort filter */}
          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterSort')}</span>
            <Select value={sortFilter} onValueChange={(v) => setSortFilter(v)}>
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

        {/* Result count */}
        <p className="text-sm text-gray-400 shrink-0">
          {filteredItems.length} {filteredItems.length === 1 ? t('citizen.lists.result') : t('citizen.lists.results')}
        </p>
      </div>

      {/* Items List */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingMyItems')}</p>
      ) : (
        <div className="space-y-5">
          {pagedItems.map((item) => (
            <Card key={item.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{item.type}</h3>
                    <Badge
                      variant="outline"
                      className={`px-4 py-1 text-sm font-medium ${
                        item.statusKey === 'scheduled'
                          ? 'bg-teal-100 text-teal-800 border-teal-200'
                          : item.statusKey === 'collected'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : item.statusKey === 'cancelled'
                              ? 'bg-gray-100 text-gray-700 border-gray-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}
                    >
                      {t(`citizen.lists.${item.statusKey}`)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    {item.canCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => void handleCancelPickup(item.id)}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        {t('citizen.myItems.cancelPickup')}
                      </Button>
                    )}
                    <div className="text-sm text-gray-600">
                      {t('citizen.myItems.estimatedValueLabel')}{' '}
                      <span className="font-medium text-gray-900">{item.estimatedValue}</span>
                    </div>
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
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            {t('citizen.lists.previous')}
          </Button>

          <div className="flex items-center gap-1.5">
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === safePage ? 'default' : 'outline'}
                  size="sm"
                  className={`h-9 w-9 p-0 ${p === safePage ? 'bg-teal-700 hover:bg-teal-800' : ''}`}
                  onClick={() => setCurrentPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('citizen.lists.next')}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">{t('citizen.myItems.noItemsTitle')}</p>
          <p className="mt-2">{t('citizen.myItems.noItemsHint')}</p>
        </div>
      )}
    </div>
  );
}