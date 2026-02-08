import React from 'react';
import { HandCoins, Truck, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Overview() {
    const { t } = useTranslation();
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
    </div>
  );
}