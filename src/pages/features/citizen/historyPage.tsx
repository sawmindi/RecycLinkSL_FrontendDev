import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { getCitizenHistory, getCitizenPickupRequests, type CitizenHistoryEntry, type CitizenPickupRequest } from '../../../services/CitizenService';
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

type HistoryRaw =
  | { type: 'api'; entries: CitizenHistoryEntry[] }
  | { type: 'derived'; completed: CitizenPickupRequest[] };

const ITEMS_PER_PAGE = 5;

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const [raw, setRaw] = useState<HistoryRaw | null>(null);
  const [loading, setLoading] = useState(true);
  const dateLocale = getDateLocaleFromLanguage(i18n.language);

  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortFilter, setSortFilter] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadHistory = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const histRes = await getCitizenHistory();
      if (cancelled) return;
      if (histRes.success && histRes.data.length > 0) {
        setRaw({ type: 'api', entries: histRes.data });
        setLoading(false);
        return;
      }
      const listRes = await getCitizenPickupRequests();
      if (cancelled) return;
      if (listRes.success) {
        const completed = listRes.data.filter((r) => r.status === 'completed');
        setRaw({ type: 'derived', completed });
      } else {
        setRaw({ type: 'api', entries: [] });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, sortFilter]);

  const allHistoryData = useMemo((): (CitizenHistoryEntry & { collectionDateRaw: Date | null; totalRaw: number })[] => {
    if (!raw) return [];
    if (raw.type === 'api') {
      return raw.entries.map((entry) => ({
        ...entry,
        collectionDateRaw: entry.collection_date ? new Date(entry.collection_date) : null,
        totalRaw: typeof entry.total === 'number' ? entry.total : 0,
      }));
    }

    const byDate = raw.completed.reduce<
      { date: string; dateRaw: Date | null; collector: string; total: number; items: { type: string; weight: string; value: string }[] }[]
    >((acc, r) => {
      const date = r.schedule_date ? formatDisplayDate(r.schedule_date, dateLocale) : t('citizen.lists.emDash');
      const dateRaw = r.schedule_date ? new Date(r.schedule_date) : null;
      const existing = acc.find((e) => e.date === date && e.collector === (r.assigned_collector ?? ''));
      const item = {
        type: r.item_name || r.category_name || t('citizen.dashboard.itemFallback'),
        weight: `${r.rough_weight} ${t('citizen.lists.kg')}`,
        value: `LKR ${(r.estimated_earnings || 0).toFixed(2)}`,
      };
      if (existing) {
        existing.items.push(item);
        existing.total += Number(r.estimated_earnings) || 0;
      } else {
        acc.push({
          date,
          dateRaw,
          collector: r.assigned_collector ?? t('citizen.lists.emDash'),
          total: Number(r.estimated_earnings) || 0,
          items: [item],
        });
      }
      return acc;
    }, []);

    return byDate.map((e, i) => ({
      _id: String(i),
      collection_date: e.date,
      collector_name: e.collector,
      total: e.total,
      items: e.items,
      collectionDateRaw: e.dateRaw,
      totalRaw: e.total,
    }));
  }, [raw, dateLocale, t]);

  const filteredHistory = useMemo(() => {
    const now = new Date();

    let result = allHistoryData.filter((entry) => {
      if (dateFilter !== 'all' && entry.collectionDateRaw) {
        const collected = entry.collectionDateRaw;
        
        if (dateFilter === 'thisweek') {
          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - 7);
          if (collected < cutoff) return false;
        } else if (dateFilter === 'thismonth') {
          if (
            collected.getMonth() !== now.getMonth() ||
            collected.getFullYear() !== now.getFullYear()
          )
            return false;
        } else if (dateFilter === 'lastmonth') {
          const cutoff = new Date(now);
          cutoff.setMonth(now.getMonth() - 1);
          if (collected < cutoff) return false;
        } else if (dateFilter === 'last2months') {
          const cutoff = new Date(now);
          cutoff.setMonth(now.getMonth() - 2);
          if (collected < cutoff) return false;
        }
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortFilter === 'newest') {
        return (b.collectionDateRaw?.getTime() ?? 0) - (a.collectionDateRaw?.getTime() ?? 0);
      } else if (sortFilter === 'oldest') {
        return (a.collectionDateRaw?.getTime() ?? 0) - (b.collectionDateRaw?.getTime() ?? 0);
      } else if (sortFilter === 'value-high') {
        return b.totalRaw - a.totalRaw;
      } else if (sortFilter === 'value-low') {
        return a.totalRaw - b.totalRaw;
      }
      return 0;
    });

    return result;
  }, [allHistoryData, dateFilter, sortFilter]);

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
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {t('citizen.history.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('citizen.history.subtitle')}
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
          {filteredHistory.length} {filteredHistory.length === 1 ? t('citizen.lists.result') : t('citizen.lists.results')}
        </p>
      </div>

      {/* History Entries */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingHistory')}</p>
      ) : pagedHistory.length > 0 ? (
        <div className="space-y-8">
          {pagedHistory.map((entry, index) => (
            <Card
              key={entry._id ?? index}
              className="overflow-hidden border-none shadow-md bg-[#f0f9f8] hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-teal-900 flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-teal-700" />
                    {t('citizen.history.dateCollectedBy', {
                      date: entry.collection_date,
                      name: entry.collector_name ?? t('citizen.lists.emDash'),
                    })}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 font-medium text-gray-700">{t('citizen.lists.item')}</th>
                        <th className="pb-3 font-medium text-gray-700">{t('citizen.lists.weight')}</th>
                        <th className="pb-3 font-medium text-gray-700">{t('citizen.lists.value')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(entry.items ?? []).map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-none">
                          <td className="py-3">{item.type}</td>
                          <td className="py-3">{item.weight}</td>
                          <td className="py-3 font-medium">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{t('citizen.lists.total')}</span>
                  <span className="text-xl font-bold text-teal-900">
                    {typeof entry.total === 'number' ? `LKR ${entry.total.toFixed(2)}` : entry.total}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">{t('citizen.history.noHistoryTitle')}</p>
          <p className="mt-3">{t('citizen.history.noHistoryHint')}</p>
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