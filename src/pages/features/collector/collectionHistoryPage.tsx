import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { getCollectorHistory, type CollectorHistoryEntry } from '../../../services/CollectorService';
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

const ITEMS_PER_PAGE = 1;

export function CollectionHistoryPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [collectionHistory, setCollectionHistory] = useState<CollectorHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('lastmonth');
  const [sortFilter, setSortFilter] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadHistory = useCallback(() => {
    setLoading(true);
    getCollectorHistory()
      .then((res) => {
        if (res.success) setCollectionHistory(res.data);
        else setCollectionHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, sortFilter]);

  const labelForStatus = (status: string) => {
    if (status === 'Completed') return t('collector.collectionHistory.statusCompleted');
    if (status === 'Cancelled') return t('collector.collectionHistory.statusCancelled');
    return status;
  };

  const allMappedHistory = useMemo(() => {
    return collectionHistory.map((entry) => {
      const statusNormalized = entry.status?.toLowerCase() || '';
      const totalValueNum = typeof entry.totalValue === 'string' 
        ? parseFloat(entry.totalValue.replace(/[^0-9.-]+/g, '')) || 0
        : entry.totalValue || 0;

      return {
        ...entry,
        statusKey: statusNormalized === 'completed' ? 'completed' : 'cancelled',
        dateRaw: entry.date ? new Date(entry.date) : null,
        totalValueRaw: totalValueNum,
      };
    });
  }, [collectionHistory]);

  const filteredHistory = useMemo(() => {
    const now = new Date();

    let result = allMappedHistory.filter((entry) => {
      if (statusFilter !== 'all' && entry.statusKey !== statusFilter) return false;

      if (dateFilter !== 'all' && entry.dateRaw) {
        const created = entry.dateRaw;
        
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
        return (b.dateRaw?.getTime() ?? 0) - (a.dateRaw?.getTime() ?? 0);
      } else if (sortFilter === 'oldest') {
        return (a.dateRaw?.getTime() ?? 0) - (b.dateRaw?.getTime() ?? 0);
      } else if (sortFilter === 'value-high') {
        return b.totalValueRaw - a.totalValueRaw;
      }
      return 0;
    });

    return result;
  }, [allMappedHistory, statusFilter, dateFilter, sortFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedHistory = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHistory, safePage]);

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
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {t('collector.collectionHistory.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('collector.collectionHistory.subtitle')}
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
                <SelectItem value="last2months">{t('citizen.lists.last2Months')}</SelectItem>
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
                <SelectItem value="all">{t('citizen.lists.all')}</SelectItem>
                <SelectItem value="completed">{t('collector.collectionHistory.statusCompleted')}</SelectItem>
                <SelectItem value="cancelled">{t('collector.collectionHistory.statusCancelled')}</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-400 shrink-0">
          {filteredHistory.length} {filteredHistory.length === 1 ? t('citizen.lists.result') : t('citizen.lists.results')}
        </p>
      </div>

      {/* History Cards */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingHistory')}</p>
      ) : pagedHistory.length > 0 ? (
        <div className="space-y-6">
          {pagedHistory.map((entry) => (
            <Card
              key={entry._id}
              className="overflow-hidden border-none shadow-md bg-[#f0f9f8] hover:shadow-lg transition-shadow w-full"
            >
              <CardContent className="p-6 space-y-5">
                {/* Citizen Details */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">
                      {t('collector.collectionHistory.citizenDetailsHeading')}
                    </h4>
                    <p className="text-gray-700 mt-1">{entry.citizenName}</p>
                    <p className="text-sm text-gray-600">{entry.area}</p>
                    <p className="text-sm text-gray-600">{entry.citizenMobile}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`px-4 py-1.5 font-medium text-sm ${
                      entry.status === 'Completed'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {labelForStatus(entry.status)}
                  </Badge>
                </div>

                {/* Items Collected */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">
                    {t('collector.collectionHistory.itemCollected')}
                  </h5>
                  <ul className="space-y-1 text-gray-700">
                    {(entry.items ?? []).map((item, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>{item.type} {item.weight}</span>
                        <span className="font-medium">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Collection Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 text-gray-700">
                  <Calendar className="h-5 w-5 text-teal-700" />
                  <p>
                    {t('collector.collectionHistory.collectedOnBy', {
                      date: formatDisplayDate(entry.date, dateLocale),
                      collector: entry.collector,
                    })}
                  </p>
                </div>

                {/* Total Value */}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{t('citizen.lists.total')}</span>
                  <span className="text-xl font-bold text-teal-900">
                    {entry.totalValue}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">{t('collector.collectionHistory.emptyTitle')}</p>
          <p className="mt-3">{t('collector.collectionHistory.emptyHint')}</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-10">
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