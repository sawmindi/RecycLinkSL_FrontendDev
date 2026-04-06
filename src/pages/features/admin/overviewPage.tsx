import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Truck, Calendar, Users, UserCheck, Layers } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import {
  getAdminDashboardStats,
  getAreaPickups,
  getItemTypeDistribution,
  type AdminDashboardStats,
  type AreaPickupItem,
  type ItemTypeDistributionItem,
} from '../../../services/AdminService';
import { AuthService } from '../../../services/AuthService';

const DEFAULT_STATS: AdminDashboardStats = {
  todaysPickups: 0,
  pendingSchedules: 0,
  registeredCitizens: 0,
  activeCollectors: 0,
  activeCategories: 0,
};

const DEFAULT_CHART_COLORS = ['#0284c7', '#f97316', '#dc2626', '#059669', '#8b5cf6'];

export function OverviewPage() {
  const { t } = useTranslation();
  const [adminStats, setAdminStats] = useState<AdminDashboardStats>(DEFAULT_STATS);
  const [areaPickupsData, setAreaPickupsData] = useState<AreaPickupItem[]>([]);
  const [itemTypeDistribution, setItemTypeDistribution] = useState<ItemTypeDistributionItem[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data?.full_name) setUserName(res.data.full_name);
    });
    getAdminDashboardStats().then((res) => {
      if (res.success && res.data && Object.keys(res.data).length) {
        setAdminStats((prev) => ({ ...prev, ...res.data }));
      }
    });
    getAreaPickups().then((res) => {
      if (res.success && res.data?.length) setAreaPickupsData(res.data);
    });
    getItemTypeDistribution().then((res) => {
      if (res.success && res.data?.length) {
        setItemTypeDistribution(
          res.data.map((d, i) => ({
            ...d,
            color: d.color ?? DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length],
          }))
        );
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex flex-1">

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Welcome */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1">
                {t('admin.overview.welcome', { name: userName || t('admin.overview.admin') })}
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Truck className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('admin.overview.statTodaysPickups')}</p>
                  <p className="text-4xl font-bold">{adminStats.todaysPickups ?? 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Calendar className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('admin.overview.statPendingSchedules')}</p>
                  <p className="text-4xl font-bold">{adminStats.pendingSchedules ?? 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('admin.overview.statRegisteredCitizens')}</p>
                  <p className="text-4xl font-bold">{adminStats.registeredCitizens ?? 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <UserCheck className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('admin.overview.statActiveCollectors')}</p>
                  <p className="text-4xl font-bold">{adminStats.activeCollectors ?? 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Layers className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">{t('admin.overview.statActiveCategories')}</p>
                  <p className="text-4xl font-bold">{adminStats.activeCategories ?? 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart - Area Analysis */}
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('admin.overview.chartAreaTitle')}
                  </h3>
                  <div className="h-96">   
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={areaPickupsData.length ? areaPickupsData : [{ area: 'No Data', pickups: 0 }]} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}  
                      >
                        <XAxis 
                          dataKey="area" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}                    
                          tickMargin={10}                
                          interval={0}                   
                          minTickGap={10}                
                          fontSize={12}                  
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="pickups" fill="#0f766e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart - Item Type Distribution */}
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('admin.overview.chartItemTypeTitle')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('admin.overview.chartItemTypeSubtitle')}
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={itemTypeDistribution.length ? itemTypeDistribution : [{ name: t('admin.overview.chartNoData'), value: 100, color: '#e5e7eb' }]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={true}
                        >
                          {(itemTypeDistribution.length ? itemTypeDistribution : [{ name: t('admin.overview.chartNoData'), value: 100, color: '#e5e7eb' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}