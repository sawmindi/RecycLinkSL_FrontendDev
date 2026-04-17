import React, { useState, useEffect } from 'react';
import { HandCoins, Truck, Package, CalendarPlus, History, ArrowUpRight, MapPin, Clock, CirclePlus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService';
import {
  getCitizenDashboardStats,
  getCitizenPickupRequests,
  type CitizenDashboardStats,
  type CitizenPickupRequest,
} from '../../../services/CitizenService';
import {
  formatDayMonthBadge,
  formatDisplayTimeHm,
  formatWeekdayLong,
  getDateLocaleFromLanguage,
} from '../../../lib/formatDate';

export default function Overview() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [userName, setUserName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [stats, setStats] = useState<CitizenDashboardStats>({});
  const [upcomingPickups, setUpcomingPickups] = useState<CitizenPickupRequest[]>([]);

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data) {
        setUserName(res.data.full_name ?? '');
        setUserLocation(res.data.area ?? '');
      }
    });
    getCitizenDashboardStats().then((res) => {
      if (res.success) setStats(res.data);
    });
    getCitizenPickupRequests().then((res) => {
      if (!res.success) return;
      const list = res.data;
      const pending = list.filter((r) => r.status === 'pending' || r.status === 'assigned').slice(0, 5);
      setUpcomingPickups(pending);
      setStats((prev) => {
        const hasApiStats = prev.totalEarnings !== undefined || prev.pendingPickups !== undefined || prev.totalWeightKg !== undefined;
        if (hasApiStats) return prev;
        const pendingCount = list.filter((r) => r.status === 'pending' || r.status === 'assigned').length;
        const totalEarnings = list.reduce((sum, r) => sum + (Number(r.estimated_earnings) || 0), 0);
        const totalWeightKg = list.reduce((sum, r) => sum + (Number(r.rough_weight) || 0), 0);
        return { ...prev, totalEarnings, pendingPickups: pendingCount, totalWeightKg };
      });
    });
  }, []);

  const totalEarnings = stats.totalEarnings ?? 0;
  const pendingCount = stats.pendingPickups ?? 0;
  const totalWeight = stats.totalWeightKg ?? 0;

  const quickLinks = [
    {
      icon: CirclePlus,
      labelKey: 'citizen.addItems',
      descKey: 'citizen.dashboard.bookCollection',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100',
      href: '/citizen/add-item',
    },
    {
      icon: CalendarPlus,
      labelKey: 'landing.schedulePickup',
      descKey: 'citizen.dashboard.choosePickups',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100',
      href: '/citizen/schedules',
    },
    {
      icon: History,
      labelKey: 'sidebar.history',
      descKey: 'citizen.dashboard.pastPickupsEarnings',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100',
      href: '/citizen/history',
    },
    {
      icon: Package,
      labelKey: 'sidebar.myItems',
      descKey: 'citizen.dashboard.manageItems',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100',
      href: '/citizen/add-item',
    },
  ];

  const typeColors: Record<string, string> = {
    Metal: 'bg-gray-100 text-gray-600',
    Paper: 'bg-violet-100 text-violet-700',
    'E-Waste': 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h1 className="text-4xl font-serif text-gray-900 mb-1">
          {t('welcome')} {userName?.trim() || ''}
        </h1>
        <p className="text-xl text-gray-600">{userLocation?.trim() || '—'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#043937] text-white rounded-xl p-6 shadow-md">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-700/50 p-4 rounded-full">
              <HandCoins className="h-8 w-8" />
            </div>
          </div>
          <p className="text-center text-lg font-medium opacity-90">
            {t('citizen.totalEarnings')}
          </p>
          <p className="text-center text-3xl font-bold mt-2">
            LKR {totalEarnings.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#043937] text-white rounded-xl p-6 shadow-md">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-700/50 p-4 rounded-full">
              <Truck className="h-8 w-8" />
            </div>
          </div>
          <p className="text-center text-lg font-medium opacity-90">
            {t('citizen.pendingPickups')}
          </p>
          <p className="text-center text-3xl font-bold mt-2">{pendingCount}</p>
        </div>

        <div className="bg-[#043937] text-white rounded-xl p-6 shadow-md">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-700/50 p-4 rounded-full">
              <Package className="h-8 w-8" />
            </div>
          </div>
          <p className="text-center text-lg font-medium opacity-90">
            {t('citizen.totalWeight')}
          </p>
          <p className="text-center text-3xl font-bold mt-2">{totalWeight.toFixed(1)} kg</p>
        </div>
      </div>

    {/* Quick Links */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">{t('citizen.dashboard.quickActions')}</h2>
          <span className="text-xs text-gray-400">{t('citizen.dashboard.allServices')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map(({ icon: Icon, labelKey, descKey, color, iconBg, href }) => (
            <Link
              key={labelKey}
              to={href}
              className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md ${color}`}
            >
              <div className={`${iconBg} rounded-xl p-3 transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">{t(labelKey)}</span>
              <span className="hidden text-[10px] leading-tight opacity-70 sm:block">{t(descKey)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#043937]/10 p-2">
              <Truck className="h-4 w-4 text-[#043937]" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">{t('citizen.dashboard.upcomingSection')}</h2>
          </div>
          <Link
            to="/citizen/schedules"
            className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
          >
            {t('citizen.dashboard.viewAll')} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingPickups.map((pickup) => {
            const { month: monthShort, day: dayNum } = formatDayMonthBadge(pickup.schedule_date, dateLocale);
            const weekday = formatWeekdayLong(pickup.schedule_date, dateLocale);
            const timeLabel = formatDisplayTimeHm(pickup.schedule_time, dateLocale);
            const typeName = pickup.item_name || pickup.category_name || t('citizen.dashboard.itemFallback');
            return (
              <div
                key={pickup._id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-teal-200 hover:bg-teal-50/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#043937] text-white shadow-sm">
                    <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-teal-300">
                      {monthShort}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {dayNum}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{weekday}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeColors[typeName] ?? 'bg-gray-100 text-gray-600'}`}>
                        {typeName}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {timeLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[200px]">{pickup.area ?? '—'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}