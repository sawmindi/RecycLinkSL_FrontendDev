import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Truck, DollarSign, Users, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { AuthService } from '../../../services/AuthService';
import {
  getCollectorDashboardStats,
  getCollectorTodayRoutes,
  type CollectorDashboardStats,
  type CollectorRouteSummary,
} from '../../../services/CollectorService';


export function OverviewPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith('si') ? 'si-LK' : 'en-LK';

  const [collectorName, setCollectorName] = useState<string>('');
  const [areaName, setAreaName] = useState<string>('');
  const [stats, setStats] = useState<CollectorDashboardStats>({});
  const [routesToday, setRoutesToday] = useState<CollectorRouteSummary[]>([]);

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data) {
        const n = res.data.full_name?.trim();
        const a = res.data.area?.trim();
        if (n) setCollectorName(n);
        if (a) setAreaName(a);
      }
    });

    getCollectorDashboardStats().then((res) => {
      if (res.success) {
        const s = res.data;
        setStats(s);
        setCollectorName((prev) => prev || s.collectorName || '');
        setAreaName((prev) => prev || s.areaName || '');
      }
    });

    getCollectorTodayRoutes().then((res) => {
      if (res.success) setRoutesToday(res.data);
      else setRoutesToday([]);
    });
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Welcome */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1">
                {t('collector.dashboard.welcome', {
                  name: collectorName || stats.collectorName || t('collector.dashboard.nameFallback'),
                })}
              </h1>
              <p className="text-xl text-gray-600">
                {t('collector.dashboard.serviceArea', {
                  area: areaName || stats.areaName || t('citizen.lists.emDash'),
                })}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Truck className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('collector.dashboard.statsTodaysPickups')}</p>
                  <p className="text-4xl font-bold">{stats.todaysPickups ?? 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <DollarSign className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('collector.dashboard.statsPendingPayments')}</p>
                  <p className="text-4xl font-bold">{stats.pendingPayments ?? 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('collector.dashboard.statsCitizensServed')}</p>
                  <p className="text-4xl font-bold">{stats.citizensServed ?? 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Routes */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 flex items-center gap-3">
                <MapPin className="h-7 w-7 text-teal-700" />
                {t('collector.dashboard.routesTitle')}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {routesToday.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-teal-200 bg-[#f0f9f8]/80 px-6 py-14 text-center text-gray-600">
                    <MapPin className="mx-auto mb-4 h-12 w-12 text-teal-600/40" />
                    <p className="text-lg font-medium text-gray-800">{t('collector.dashboard.emptyRoutesTitle')}</p>
                    <p className="mt-2 text-sm">{t('collector.dashboard.emptyRoutesHint')}</p>
                  </div>
                )}
                {routesToday.map((route, index) => {
                  const dateLabel = route.schedule_date
                    ? new Date(route.schedule_date).toLocaleDateString(dateLocale, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : t('citizen.lists.emDash');
                  const timeLabel = route.schedule_time || t('citizen.lists.emDash');
                  return (
                  <Card
                    key={route._id || index}
                    className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8]"
                  >
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-1.5">
                            {t('collector.dashboard.badgeSchedule')}
                          </Badge>
                          <h3 className="text-xl font-semibold text-teal-900">
                            {route.area}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3 text-gray-700">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-teal-700" />
                          <span>{dateLabel} • {timeLabel}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-teal-700" />
                          <span>{t('collector.dashboard.citizensCount', { count: route.citizens })}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 border-teal-700 text-teal-700 hover:bg-teal-50"
                          onClick={() => navigate('/collector/pickups')}
                        >
                          {t('collector.dashboard.viewDetails')}
                        </Button>
                        <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white">
                          {t('collector.dashboard.startRoute')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
      
    </div>
  );
}