import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users, ChevronDown, ChevronUp, Phone, Home, Package, X } from 'lucide-react';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  getCollectorPickupRoutes,
  completeCollectorPickup,
  cancelCollectorPickup,
  type CollectorPickupRoute,
  type CollectorPickupCitizen,
} from '../../../services/CollectorService';


export function PickupsPage() {
  const { t } = useTranslation();

  const [pickupRoutes, setPickupRoutes] = useState<CollectorPickupRoute[]>([]);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [completedCitizens, setCompletedCitizens] = useState<string[]>([]);
  const [skippedPickups, setSkippedPickups] = useState<string[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<CollectorPickupCitizen | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [actualWeights, setActualWeights] = useState<string[]>([]);

  const getPickupRequestId = (citizen: CollectorPickupCitizen): string => {
    const raw = citizen as unknown as Record<string, unknown>;
    const candidates = [
      citizen.requestId,
      typeof raw.pickupId === 'string' ? raw.pickupId : '',
      typeof raw.pickup_id === 'string' ? raw.pickup_id : '',
      typeof raw.requestId === 'string' ? raw.requestId : '',
      typeof raw.request_id === 'string' ? raw.request_id : '',
    ];
    return candidates.find((v) => typeof v === 'string' && v.trim().length > 0)?.trim() ?? '';
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setNotes('');
    setSelectedCitizen(null);
    setSelectedRouteId(null);
    setActualWeights([]);
  };

  useEffect(() => {
    getCollectorPickupRoutes().then((res) => {
      if (res.success) setPickupRoutes(res.data);
    });
  }, []);

  const toggleDetails = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  const openCompleteModal = (routeId: string, citizen: CollectorPickupCitizen) => {
    setSelectedRouteId(routeId);
    setSelectedCitizen(citizen);
    setNotes('');
    setActualWeights((citizen.items ?? []).map(() => ''));
    setIsCompleteModalOpen(true);
  };

  const handleCompletePickup = async () => {
    if (!selectedCitizen || !selectedRouteId) return;
    const requestId = getPickupRequestId(selectedCitizen);
    if (!requestId) {
      await swalError(t('collector.pickups.swalErrorTitle'), t('collector.pickups.missingRequestId'));
      return;
    }

    const ok = await swalConfirm({
      title: t('collector.pickups.confirmCompleteTitle'),
      text: t('collector.pickups.confirmCompleteText', { name: selectedCitizen.name }),
      confirmButtonText: t('collector.pickups.confirm'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;

    const res = await completeCollectorPickup(requestId, {
      citizenId: selectedCitizen.id,
      notes,
      items: selectedCitizen.items?.map((item, i) => ({
        type: item.type,
        actualWeight: actualWeights[i]?.trim() || undefined,
      })),
    });

    if (res.success) {
      setCompletedCitizens((prev) => [...prev, selectedCitizen.id]);
      await swalSuccess(
        t('collector.pickups.swalDone'),
        t('collector.pickups.swalPickupCompleted', { name: selectedCitizen.name })
      );
      closeCompleteModal();
    } else {
      await swalError(t('collector.pickups.swalErrorTitle'), res.message);
    }
  };

  const pickupSessionKey = (routeId: string, citizenId: string) => `${routeId}:${citizenId}`;

  const isCitizenCompleted = (citizenId: string) => completedCitizens.includes(citizenId);

  const isPickupSkipped = (routeId: string, citizenId: string) =>
    skippedPickups.includes(pickupSessionKey(routeId, citizenId));

  const handleCancelPickup = async (routeId: string, citizen: CollectorPickupCitizen) => {
    const ok = await swalConfirm({
      title: t('collector.pickups.confirmSkipTitle'),
      text: t('collector.pickups.confirmSkipText', { name: citizen.name }),
      confirmButtonText: t('collector.pickups.confirm'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;
    const requestId = getPickupRequestId(citizen);
    if (!requestId) {
      await swalError(t('collector.pickups.swalErrorTitle'), t('collector.pickups.missingRequestId'));
      return;
    }
    const res = await cancelCollectorPickup(requestId, {
      citizenId: citizen.id,
      status: 'Cancled',
    });
    if (res.success) {
      const key = pickupSessionKey(routeId, citizen.id);
      setSkippedPickups((prev) => (prev.includes(key) ? prev : [...prev, key]));
      await swalSuccess(
        t('collector.pickups.swalSkippedTitle'),
        t('collector.pickups.swalSkippedText', { name: citizen.name })
      );
    } else {
      await swalError(t('collector.pickups.swalErrorTitle'), res.message);
    }
  };

  return (
    <div className="space-y-6 px-0 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
          {t('collector.pickups.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          {t('collector.pickups.subtitle')}
        </p>
      </div>

      {/* Route Cards */}
      <div className="space-y-4 sm:space-y-6">
        {pickupRoutes.map((route) => (
          <Card
            key={route.id}
            className="overflow-hidden border border-teal-100 shadow-md bg-[#f0f9f8]"
          >
            <CardContent className="p-0">

              {/* Route Header */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge className="shrink-0 bg-teal-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-1.5">
                      {t('collector.dashboard.badgeSchedule')}
                    </Badge>
                    <h3 className="truncate text-lg font-semibold text-teal-900 sm:text-xl">
                      {route.area}
                    </h3>
                  </div>

                  <div className="flex gap-2 sm:gap-3 sm:shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:flex-none sm:text-sm"
                      onClick={() => toggleDetails(route.id)}
                    >
                      {expandedRoute === route.id ? (
                        <>
                          <ChevronUp className="mr-1 h-3.5 w-3.5" />
                          {t('collector.pickups.hide')}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3.5 w-3.5" />
                          {t('collector.pickups.details')}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-teal-700 text-xs hover:bg-teal-800 sm:flex-none sm:text-sm"
                    >
                      {t('collector.dashboard.startRoute')}
                    </Button>
                  </div>
                </div>

                {/* Meta info row */}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0 text-teal-600" />
                    <span className="whitespace-nowrap">{route.date}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline whitespace-nowrap">{route.time}</span>
                  </span>
                  <span className="flex items-center gap-1.5 sm:hidden">
                    <Clock className="h-4 w-4 shrink-0 text-transparent" />
                    <span className="text-gray-500">{route.time}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 shrink-0 text-teal-600" />
                    {t('collector.pickups.citizensOnRoute', { count: route.citizens })}
                  </span>
                </div>
              </div>

              {/*  Expanded Citizen Details */}
              {expandedRoute === route.id && (
                <div className="border-t border-teal-100 bg-white">
                  {(route.citizensDetails ?? []).map((citizen, idx) => {
                    const completed = isCitizenCompleted(citizen.id);
                    const skipped = isPickupSkipped(route.id, citizen.id);
                    const details = route.citizensDetails ?? [];
                    return (
                      <div
                        key={citizen.id || `citizen-${idx}`}
                        className={`p-4 sm:p-6 ${
                          idx < details.length - 1 ? 'border-b border-gray-100' : ''
                        } ${completed || skipped ? 'opacity-60' : ''}`}
                      >
                        
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              {t('collector.pickups.citizenDetails')}
                            </p>
                            <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
                              {citizen.name}
                            </p>
                            <div className="mt-1 space-y-0.5">
                              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Home className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <span className="truncate">{citizen.area}</span>
                              </p>
                              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                {citizen.mobile}
                              </p>
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs text-gray-400">{t('collector.pickups.estTotal')}</p>
                            <p className="text-xl font-bold text-teal-800 sm:text-2xl">
                              {citizen.totalValue}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Package className="h-4 w-4 text-teal-600" />
                            {t('collector.pickups.itemsToCollect')}
                          </p>

                          {/* Mobile cards */}
                          <div className="flex flex-col gap-2 sm:hidden">
                            {(citizen.items ?? []).map((item, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                              >
                                <span className="font-medium text-gray-700">
                                  {item.type}
                                  <span className="ml-1.5 font-normal text-gray-500">
                                    {item.estWeight}
                                  </span>
                                </span>
                                <span className="font-semibold text-teal-700">{item.estValue}</span>
                              </div>
                            ))}
                          </div>

                          {/* Desktop table */}
                          <div className="hidden sm:block">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                  <th className="pb-2 pr-4">{t('collector.pickups.tableItem')}</th>
                                  <th className="pb-2 pr-4">{t('collector.pickups.estWeight')}</th>
                                  <th className="pb-2 text-right">{t('collector.pickups.estValue')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {(citizen.items ?? []).map((item, i: number) => (
                                  <tr key={i}>
                                    <td className="py-2 pr-4 font-medium text-gray-800">
                                      {item.type}
                                    </td>
                                    <td className="py-2 pr-4 text-gray-500">{item.estWeight}</td>
                                    <td className="py-2 text-right font-semibold text-teal-700">
                                      {item.estValue}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {!completed && !skipped && (
                          <div className="mt-4 flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 sm:flex-none sm:px-6"
                              onClick={() => handleCancelPickup(route.id, citizen)}
                            >
                              {t('admin.common.cancel')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="flex-1 bg-teal-700 text-white hover:bg-teal-800 sm:flex-none sm:px-6"
                              onClick={() => openCompleteModal(route.id, citizen)}
                            >
                              {t('collector.pickups.complete')}
                            </Button>
                          </div>
                        )}

                        {completed && (
                          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                            <span className="text-base">✓</span> {t('collector.pickups.pickupCompleted')}
                          </div>
                        )}

                        {skipped && !completed && (
                          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
                            <X className="h-4 w-4 shrink-0" aria-hidden />
                            {t('collector.pickups.pickupSkipped')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/*  Empty State */}
      {pickupRoutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <div className="mb-4 rounded-full bg-gray-100 p-5">
            <MapPin className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-base font-semibold text-gray-500">{t('collector.pickups.emptyTitle')}</p>
          <p className="mt-1 text-sm">{t('collector.pickups.emptyHint')}</p>
        </div>
      )}

      {/*  Complete Pickup Modal*/}
      <Dialog
        open={isCompleteModalOpen}
        onOpenChange={(open) => {
          setIsCompleteModalOpen(open);
          if (!open) {
            setNotes('');
            setSelectedCitizen(null);
            setSelectedRouteId(null);
            setActualWeights([]);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl p-0 sm:w-full">
          <DialogHeader className="px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
            <DialogTitle className="text-lg font-semibold sm:text-xl">
              {t('collector.pickups.modalTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-5 py-4 sm:px-6 sm:py-5">
            {/* Summary banner */}
            <div className="rounded-xl bg-teal-50 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-sm font-medium text-teal-800">
                {t('collector.pickups.recordingFor', {
                  name: selectedCitizen?.name ?? t('citizen.lists.emDash'),
                })}
              </p>
              <p className="mt-1 text-xl font-bold text-teal-700 sm:text-2xl">
                {selectedCitizen?.totalValue || 'LKR 550'}
              </p>
            </div>

            {/* Items with actual weight inputs */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">{t('collector.pickups.itemsToCollect')}</h4>
              <div className="space-y-3">
                {selectedCitizen?.items.map((item, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4"
                  >
                    {/* Mobile layout */}
                    <div className="flex items-center justify-between sm:hidden">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.type}</p>
                        <p className="text-xs text-gray-500">
                          {t('collector.pickups.estWeightInline', { weight: item.estWeight })}
                        </p>
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder={t('collector.pickups.actualKgPlaceholder')}
                          className="h-8 border-teal-400 text-xs"
                          value={actualWeights[i] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setActualWeights((prev) => {
                              const next = [...prev];
                              next[i] = v;
                              return next;
                            });
                          }}
                        />
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:items-end">
                      <div>
                        <Label className="text-xs">{t('collector.pickups.itemType')}</Label>
                        <Input value={item.type} disabled className="mt-1 bg-white text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('collector.pickups.estimatedWeight')}</Label>
                        <Input value={item.estWeight} disabled className="mt-1 bg-white text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('collector.pickups.actualWeight')}</Label>
                        <Input
                          placeholder={t('collector.pickups.actualKgExample')}
                          className="mt-1 border-teal-400 text-sm"
                          value={actualWeights[i] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setActualWeights((prev) => {
                              const next = [...prev];
                              next[i] = v;
                              return next;
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium">{t('collector.pickups.notesLabel')}</Label>
              <Textarea
                placeholder={t('collector.pickups.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1.5 resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 border-t border-gray-100 px-5 py-4 sm:px-6">
            <Button
              variant="outline"
              type="button"
              onClick={closeCompleteModal}
              className="flex-1 text-sm sm:flex-none sm:px-6"
            >
              {t('admin.common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleCompletePickup}
              className="flex-1 bg-teal-700 text-sm hover:bg-teal-800 sm:flex-none sm:px-6"
            >
              {t('collector.pickups.completePickup')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
