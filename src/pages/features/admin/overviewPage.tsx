import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Truck, Calendar, Users, UserCheck, Layers, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';


const adminStats = {
  todaysPickups: 40,
  pendingSchedules: 8,
  registeredCitizens: 248,
  activeCollectors: 48,
  activeCategories: 10,
};

const areaPickupsData = [
  { area: 'Colombo', pickups: 38 },
  { area: 'Kalutara', pickups: 25 },
  { area: 'Hikkaduwa', pickups: 20 },
  { area: 'Kandy', pickups: 15 },
  { area: 'Galle', pickups: 12 },
  { area: 'Nuwara Eliya', pickups: 8 },
];

const itemTypeDistribution = [
  { name: 'Coconut Shells', value: 38.9, color: '#0284c7' },
  { name: 'Paper', value: 27.8, color: '#f97316' },
  { name: 'Plastic', value: 16.7, color: '#dc2626' },
  { name: 'Iron', value: 11.1, color: '#059669' },
  { name: 'Cardboard', value: 5.5, color: '#8b5cf6' },
];

// const COLORS = ['#0284c7', '#f97316', '#dc2626', '#059669', '#8b5cf6'];

export function OverviewPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex flex-1">

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Welcome */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1">
                Welcome, Sahan Perera
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Truck className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Today's Pickups</p>
                  <p className="text-4xl font-bold">{adminStats.todaysPickups}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Calendar className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Pending Schedules</p>
                  <p className="text-4xl font-bold">{adminStats.pendingSchedules}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Registered Citizens</p>
                  <p className="text-4xl font-bold">{adminStats.registeredCitizens}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <UserCheck className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Active Collectors</p>
                  <p className="text-4xl font-bold">{adminStats.activeCollectors}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Layers className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Active Categories</p>
                  <p className="text-4xl font-bold">{adminStats.activeCategories}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart - Area Analysis */}
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Most Number of Pickups - Area Analysis
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={areaPickupsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="area" angle={-45} textAnchor="end" height={70} />
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
                    Collection by Item Type
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Distribution of collected materials
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={itemTypeDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={true}
                        >
                          {itemTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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