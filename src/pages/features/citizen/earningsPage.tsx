import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { getCitizenPickupRequests, type CitizenPickupRequest } from '../../../services/CitizenService';
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

type EarningStatusKey = 'collected' | 'scheduled' | 'pending';

const ITEMS_PER_PAGE = 5;

export function EarningsPage() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState<CitizenPickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const dateLocale = getDateLocaleFromLanguage(i18n.language);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortFilter, setSortFilter] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadRequests = useCallback(() => {
    setLoading(true);
    getCitizenPickupRequests()
      .then((res) => {
        if (res.success) setRequests(res.data);
        else setRequests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, sortFilter]);

  const allEarningsData = useMemo(() => {
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
        estimatedValueRaw: Number(r.estimated_earnings) || 0,
        dateAdded: r.created_at ? dateFmt(r.created_at) : t('citizen.lists.emDash'),
        createdAtRaw: r.created_at ? new Date(r.created_at) : null,
        description: '',
        pickupInfo,
      };
    });
  }, [requests, dateLocale, t]);

  const filteredEarnings = useMemo(() => {
    const now = new Date();

    let result = allEarningsData.filter((earning) => {
      if (statusFilter !== 'all' && earning.statusKey !== statusFilter) return false;

      if (dateFilter !== 'all' && earning.createdAtRaw) {
        const created = earning.createdAtRaw;
        
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
      } else if (sortFilter === 'value-low') {
        return a.estimatedValueRaw - b.estimatedValueRaw;
      }
      return 0;
    });

    return result;
  }, [allEarningsData, statusFilter, dateFilter, sortFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEarnings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedEarnings = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredEarnings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEarnings, safePage]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                <SelectItem value="last2months">{t('citizen.lists.last2months')}</SelectItem>
                <SelectItem value="all">{t('citizen.lists.allTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterStatus')}</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('citizen.lists.allStatuses')}</SelectItem>
                <SelectItem value="pending">{t('citizen.lists.pending')}</SelectItem>
                <SelectItem value="scheduled">{t('citizen.lists.scheduled')}</SelectItem>
                <SelectItem value="collected">{t('citizen.lists.collected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort filter */}
          <div className="flex items-center gap-2">
            <span>{t('citizen.lists.filterSort')}</span>
            <Select value={sortFilter} onValueChange={(v) => setSortFilter(v)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
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

        {/* Result count */}
        <p className="text-sm text-gray-400 shrink-0">
          {filteredEarnings.length} {filteredEarnings.length === 1 ? t('citizen.lists.result') : t('citizen.lists.results')}
        </p>
      </div>

      {/* Earnings Cards Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingEarnings')}</p>
      ) : pagedEarnings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pagedEarnings.map((earning) => (
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
                    <p className="font-medium">{earning.description || t('citizen.lists.emDash')}</p>
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
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">{t('citizen.earnings.noEarningsTitle')}</p>
          <p className="mt-2">{t('citizen.earnings.noEarningsHint')}</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
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
    </div>
  );
}