import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { swalError, swalSuccess } from '../../../lib/swal';
import { Calendar, Clock, MapPin, Users, Phone, Recycle } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
import { AuthService } from '../../../services/AuthService';
import {
  getCitizenAvailableSchedules,
  getCitizenPickupRequests,
  getCollectorsForCitizenArea,
  assignScheduleToPickupRequest,
  type CitizenScheduleSlot,
  type CitizenAreaCollector,
} from '../../../services/CitizenService';
import {
  resolveCitizenAreaForSchedules,
  type ScheduleAreaResolution,
} from '../../../data/scheduleAreaForCitizen';
import i18n from '../../../i18n';
import { formatDisplayTimeHm, formatScheduleSlotDateLong, getDateLocaleFromLanguage } from '../../../lib/formatDate';

export function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);

  const [hasItems, setHasItems] = useState<boolean>(false);
  const [scheduleSlots, setScheduleSlots] = useState<CitizenScheduleSlot[]>([]);
  const [userArea, setUserArea] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
  const [areaCollectors, setAreaCollectors] = useState<CitizenAreaCollector[]>([]);
  const [scheduleResolution, setScheduleResolution] = useState<ScheduleAreaResolution | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('recycLinkAddedItems');
    const items = stored ? JSON.parse(stored) : [];
    setHasItems(items.length > 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const me = await AuthService.getMe();
        const area = me.success && me.data?.area ? String(me.data.area).trim() : '';
        const resolved = resolveCitizenAreaForSchedules(area);
        if (!cancelled) {
          setUserArea(area);
          setScheduleResolution(resolved);
        }

        const scheduleQuery = resolved.queryArea || undefined;

        const [slotsRes, listRes, collectorsRes] = await Promise.all([
          getCitizenAvailableSchedules(scheduleQuery),
          getCitizenPickupRequests(),
          getCollectorsForCitizenArea(scheduleQuery || ''),
        ]);

        if (cancelled) return;
        if (slotsRes.success) setScheduleSlots(slotsRes.data);
        if (collectorsRes.success) setAreaCollectors(collectorsRes.data);

        if (listRes.success) {
          const pending = listRes.data
            .filter((r) => r.status === 'pending' || r.status === 'assigned')
            .map((r) => r._id);
          setPendingRequestIds(pending);
        }
      } catch {
        if (!cancelled) toast.error(i18n.t('citizen.schedule.toastLoadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const cameFromAddItems = location.state?.from === 'add-items';

  useEffect(() => {
    if (cameFromAddItems && hasItems) {
      toast.info(i18n.t('citizen.schedule.toastCanSelectSlot'), {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  }, [cameFromAddItems, hasItems]);

  const handleScheduleClick = async (slotId: string) => {
    if (!hasItems && pendingRequestIds.length === 0) return;

    const requestId = pendingRequestIds[0];
    if (requestId) {
      const res = await assignScheduleToPickupRequest(requestId, slotId);
      if (res.success) {
        await swalSuccess(t('citizen.schedule.swalScheduledTitle'), t('citizen.schedule.swalScheduledText'));
      } else {
        await swalError(t('citizen.schedule.swalFailTitle'), res.message);
        return;
      }
    } else {
      await swalSuccess(t('citizen.schedule.swalScheduledTitle'), t('citizen.schedule.swalScheduledText'));
    }

    localStorage.removeItem('recycLinkAddedItems');
    setTimeout(() => navigate('/citizen/my-items'), 1500);
  };

  const areaLabel = userArea || t('citizen.schedule.yourArea');

  const collectorsFromSchedules = React.useMemo(() => {
    type Row = { key: string; name: string; slotCount: number };
    const map = new Map<string, Row>();
    for (const s of scheduleSlots) {
      const name = (s.full_name || s.collector_name || '').trim();
      const key = (s.collector_id && String(s.collector_id)) || name || s._id;
      if (!name && !s.collector_id) continue;
      const displayName = name || t('citizen.schedule.collectorFallback');
      const row: Row = map.get(key) ?? { key, name: displayName, slotCount: 0 };
      row.slotCount += 1;
      if (!map.has(key)) map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [scheduleSlots, t]);

  const displayedCollectors = React.useMemo(() => {
    const fromApi = areaCollectors.map((c) => ({
      key: c._id,
      name: c.full_name,
      mobile: c.mobile_number,
      slotCount: scheduleSlots.filter(
        (s) => s.collector_id === c._id || (s.full_name || s.collector_name) === c.full_name
      ).length,
    }));
    const apiKeys = new Set(fromApi.map((x) => x.key));
    const apiNames = new Set(fromApi.map((x) => x.name.toLowerCase()));
    const extra = collectorsFromSchedules.filter(
      (r) => !apiKeys.has(r.key) && !apiNames.has(r.name.toLowerCase())
    );
    return [
      ...fromApi,
      ...extra.map((r) => ({
        key: r.key,
        name: r.name,
        mobile: undefined as string | undefined,
        slotCount: r.slotCount,
      })),
    ];
  }, [areaCollectors, collectorsFromSchedules, scheduleSlots]);

  const initials = (name: string) => {
    const p = name.trim().split(/\s+/);
    if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase() || '?';
  };

  const scheduleItemTokens = (slot: CitizenScheduleSlot): string[] => {
    const fromItems = slot.items;
    if (Array.isArray(fromItems)) {
      return fromItems.map((s) => String(s).trim()).filter(Boolean);
    }
    const raw = (fromItems ?? slot.item_name ?? '').trim();
    if (!raw) return [];
    return raw
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const noCollectorsTarget =
    scheduleResolution?.queryArea && scheduleResolution.scheduleCouncilLabel
      ? scheduleResolution.scheduleCouncilLabel
      : t('citizen.schedule.yourLocation');
  const noCollectorsCovers =
    scheduleResolution?.mappedFromMainCity && userArea
      ? t('citizen.schedule.coversYourArea', { area: userArea })
      : '';

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          {t('citizen.schedule.title', { area: areaLabel })}
        </h1>
        <p className="text-lg text-gray-600">{t('citizen.schedule.subtitle')}</p>
      </div>

      {!loading && (
        <div className="rounded-2xl border border-teal-100 bg-[#f0f9f8] p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-800" />
            <h2 className="text-xl font-serif font-semibold text-teal-950">
              {userArea ? t('citizen.schedule.collectorsInYourArea') : t('citizen.schedule.collectorsOnSchedules')}
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            {userArea ? (
              scheduleResolution?.mappedFromMainCity &&
              scheduleResolution.scheduleCouncilLabel !== scheduleResolution.profileArea ? (
                <>
                  {t('citizen.schedule.explainerCouncilMapped', {
                    council: scheduleResolution.scheduleCouncilLabel,
                    userArea,
                  })}
                </>
              ) : (
                <>
                  {t('citizen.schedule.explainerCouncil', {
                    council: scheduleResolution?.scheduleCouncilLabel || userArea,
                  })}
                </>
              )
            ) : (
              <>
                {t('citizen.schedule.explainerNoArea', { profile: t('sidebar.myProfile') })}
              </>
            )}
          </p>
          {displayedCollectors.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t('citizen.schedule.noCollectorsYet', { target: noCollectorsTarget, covers: noCollectorsCovers })}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCollectors.map((c) => (
                <div
                  key={c.key}
                  className="flex items-start gap-3 rounded-xl border border-teal-100/80 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                    {c.mobile ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{c.mobile}</span>
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-teal-800">
                      {c.slotCount > 0
                        ? t('citizen.schedule.openSlotsBelow', { count: c.slotCount })
                        : t('citizen.schedule.listedForArea')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">{t('citizen.schedule.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduleSlots.map((slot) => {
            const spots = slot.spots_left ?? slot.spotsLeft;
            const tokens = scheduleItemTokens(slot);
            const displayTokens = tokens.length ? tokens : slot.items != null ? [String(slot.items)] : [];
            return (
              <Card
                key={slot._id}
                className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8] hover:bg-[#e6f5f3]"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-teal-900">
                      {slot.full_name || t('citizen.schedule.collectorFallback')}
                    </h3>
                    {spots != null && (
                      <Badge
                        variant="secondary"
                        className="bg-teal-100 text-teal-800 hover:bg-teal-100 px-3 py-1 font-medium"
                      >
                        {t('citizen.schedule.spotsLeft', { count: spots })}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-teal-700" />
                    <span>
                      {slot.schedule_date ? formatScheduleSlotDateLong(slot.schedule_date, dateLocale) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-teal-700" />
                    <span>{formatDisplayTimeHm(slot.schedule_time, dateLocale)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-teal-700" />
                    <span>{slot.area}</span>
                  </div>

                  <div className="rounded-lg border border-teal-200/80 bg-white/70 px-3 py-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-900">
                      <Recycle className="h-4 w-4 shrink-0 text-teal-700" />
                      {t('citizen.schedule.materialsOnRoute')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayTokens.map((label, idx) => (
                        <Badge
                          key={`${slot._id}-mat-${idx}`}
                          variant="secondary"
                          className="border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-50 font-normal"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            onClick={() => handleScheduleClick(slot._id)}
                            disabled={!hasItems && pendingRequestIds.length === 0}
                            className={`w-full mt-4 text-base font-medium transition-all ${
                              hasItems || pendingRequestIds.length > 0
                                ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {t('citizen.schedule.bookPickup')}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!hasItems && pendingRequestIds.length === 0 && (
                        <TooltipContent side="top" className="bg-gray-800 text-white border-none max-w-xs">
                          {t('citizen.schedule.tooltipNeedItems')}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && scheduleSlots.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t('citizen.schedule.emptyNoSlots')}</p>
          {userArea && scheduleResolution?.queryArea && scheduleResolution.mappedFromMainCity ? (
            <p className="mt-2 max-w-lg mx-auto text-sm">
              {t('citizen.schedule.emptyAdminHint', {
                council: scheduleResolution.scheduleCouncilLabel,
                userArea,
              })}
            </p>
          ) : userArea ? (
            <p className="mt-2 text-sm">
              {t('citizen.schedule.emptyQueryUsed', {
                query: scheduleResolution?.queryArea || userArea,
              })}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
