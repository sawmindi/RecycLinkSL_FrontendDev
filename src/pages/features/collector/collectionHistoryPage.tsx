import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { getCollectorHistory, type CollectorHistoryEntry } from '../../../services/CollectorService';
import { formatDisplayDate, getDateLocaleFromLanguage } from '../../../lib/formatDate';

export function CollectionHistoryPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [collectionHistory, setCollectionHistory] = useState<CollectorHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollectorHistory()
      .then((res) => {
        if (res.success) setCollectionHistory(res.data);
        else setCollectionHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const labelForStatus = (status: string) => {
    if (status === 'Completed') return t('collector.collectionHistory.statusCompleted');
    if (status === 'Cancelled') return t('collector.collectionHistory.statusCancelled');
    return status;
  };

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
              <SelectItem value="completed">{t('collector.collectionHistory.statusCompleted')}</SelectItem>
              <SelectItem value="cancelled">{t('collector.collectionHistory.statusCancelled')}</SelectItem>
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

      {/* History Cards */}
      {!loading && (
      <div className="space-y-6">
        {collectionHistory.map((entry) => (
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
      )}

      {/* Pagination */}
      {!loading && collectionHistory.length > 0 && (
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
      )}

      {loading && (
        <p className="text-center text-gray-500 py-8">{t('citizen.lists.loadingHistory')}</p>
      )}

      {/* Empty state */}
      {!loading && collectionHistory.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
          <p className="text-xl font-medium">{t('collector.collectionHistory.emptyTitle')}</p>
          <p className="mt-3">{t('collector.collectionHistory.emptyHint')}</p>
        </div>
      )}
    </div>
  );
}
