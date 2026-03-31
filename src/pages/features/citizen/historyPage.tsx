import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { getCitizenHistory, getCitizenPickupRequests, type CitizenHistoryEntry, type CitizenPickupRequest } from '../../../services/CitizenService';

type HistoryRaw =
  | { type: 'api'; entries: CitizenHistoryEntry[] }
  | { type: 'derived'; completed: CitizenPickupRequest[] };

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const [raw, setRaw] = useState<HistoryRaw | null>(null);
  const [loading, setLoading] = useState(true);
  const dateLocale = i18n.language.startsWith('si') ? 'si-LK' : 'en-US';

  useEffect(() => {
    let cancelled = false;
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

  const historyData = useMemo((): CitizenHistoryEntry[] => {
    if (!raw) return [];
    if (raw.type === 'api') return raw.entries;

    const byDate = raw.completed.reduce<
      { date: string; collector: string; total: number; items: { type: string; weight: string; value: string }[] }[]
    >((acc, r) => {
      const date = r.schedule_date
        ? new Date(r.schedule_date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })
        : t('citizen.lists.emDash');
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
    }));
  }, [raw, dateLocale, t]);

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
          <Select defaultValue="all">
            <SelectTrigger className="w-40 h-9">
              <SelectValue>{t('citizen.lists.allStatuses')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t('citizen.lists.pending')}</SelectItem>
              <SelectItem value="scheduled">{t('citizen.lists.scheduled')}</SelectItem>
              <SelectItem value="collected">{t('citizen.lists.collected')}</SelectItem>
              <SelectItem value="all">{t('citizen.lists.all')}</SelectItem>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History Entries */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingHistory')}</p>
      ) : (
      <div className="space-y-8">
        {historyData.map((entry, index) => (
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
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 pt-10 text-gray-600">
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
      {!loading && historyData.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">{t('citizen.history.noHistoryTitle')}</p>
          <p className="mt-3">{t('citizen.history.noHistoryHint')}</p>
        </div>
      )}
    </div>
  );
}
