import React from 'react';
import { HandCoins, Truck, Package, CalendarPlus, History, Gift, BookOpen, MessageSquare, AlertTriangle, ArrowUpRight, TrendingUp, Leaf, Bell, MapPin, Clock, CheckCircle2, CircleDot, Circle, CirclePlus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'

export default function Overview() {
    const { t } = useTranslation();

    const quickLinks = [
  {
    icon: CirclePlus,
    labelKey: 'Add Items',
    label: 'Add Items',
    desc: 'Book your next collection',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-100',
    href: '/citizen/add-item',
  },
  {
    icon: CalendarPlus,
    labelKey: 'Schedules',
    label: 'Schedule Pickup',
    desc: 'Choose from available pickups',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-100',
    href: '/citizen/schedules',
  },
  {
    icon: History,
    labelKey: 'history',
    label: 'View History',
    desc: 'Past pickups & earnings',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-100',
    href: '/citizen/history',
  },
  {
    icon: Package,
    labelKey: 'My Items',
    label: 'My Items',
    desc: 'View and manage your items',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-100',
    href: '/citizen/add-item',
  }
];

const pickupSchedule = [
  {
    id: 1,
    date: 'Mar 15, 2026',
    day: 'Tomorrow',
    time: '9:00 AM – 11:00 AM',
    location: '45/B, Galle Road, Colombo 03',
    type: 'Metal'
  },
  {
    id: 2,
    date: 'Mar 19, 2026',
    day: 'Thursday',
    time: '2:00 PM – 4:00 PM',
    location: '45/B, Galle Road, Colombo 03',
    type: 'Paper'
  },
  {
    id: 3,
    date: 'Mar 24, 2026',
    day: 'Tuesday',
    time: '9:00 AM – 11:00 AM',
    location: '45/B, Galle Road, Colombo 03',
    type: 'E-Waste'
  },
];

const typeColors: Record<string, string> = {
  'Metal': 'bg-gray-100 text-gray-600',
  'Paper': 'bg-violet-100 text-violet-700',
  'E-Waste': 'bg-teal-100 text-teal-700',
};
  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h1 className="text-4xl font-serif text-gray-900 mb-1">
          {t('welcome')} {t('name')}
        </h1>
        <p className="text-xl text-gray-600">{t('location')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings */}
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
            LKR 2,450
          </p>
        </div>

        {/* Pending Pickups */}
        <div className="bg-[#043937] text-white rounded-xl p-6 shadow-md">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-700/50 p-4 rounded-full">
              <Truck className="h-8 w-8" />
            </div>
          </div>
          <p className="text-center text-lg font-medium opacity-90">
            {t('citizen.pendingPickups')}
          </p>
          <p className="text-center text-3xl font-bold mt-2">3</p>
        </div>

        {/* Total Weight */}
        <div className="bg-[#043937] text-white rounded-xl p-6 shadow-md">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-700/50 p-4 rounded-full">
              <Package className="h-8 w-8" />
            </div>
          </div>
          <p className="text-center text-lg font-medium opacity-90">
            {t('citizen.totalWeight')}
          </p>
          <p className="text-center text-3xl font-bold mt-2">8.0 kg</p>
        </div>
      </div>

    {/* Quick Links */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          <span className="text-xs text-gray-400">All services</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map(({ icon: Icon, label, labelKey, desc, color, iconBg, href }) => (
            <a
              key={labelKey}
              href={href}
              className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md ${color}`}
            >
              <div className={`${iconBg} rounded-xl p-3 transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">{t(labelKey) || label}</span>
              <span className="hidden text-[10px] leading-tight opacity-70 sm:block">{desc}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#043937]/10 p-2">
              <Truck className="h-4 w-4 text-[#043937]" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Upcoming Pickups</h2>
          </div>
          <Link
            to="/citizen/schedules"
            className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {pickupSchedule.map((pickup) => {
            return (
              <div
                key={pickup.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-teal-200 hover:bg-teal-50/30 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Date block */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#043937] text-white shadow-sm">
                    <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-teal-300">
                      {pickup.date.split(' ')[0]}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {pickup.date.split(' ')[1].replace(',', '')}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{pickup.day}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeColors[pickup.type]}`}>
                        {pickup.type}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {pickup.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[200px]">{pickup.location}</span>
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