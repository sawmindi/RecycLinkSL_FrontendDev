import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, DollarSign, Users, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';


const routesToday = [
  {
    area: 'Kuruduwatta',
    time: '09:00 AM - 11:00 AM',
    date: 'Mon, Jan 15',
    citizens: 2,
  },
  {
    area: 'Kuruduwatta',
    time: '09:00 AM - 11:00 AM',
    date: 'Mon, Jan 15',
    citizens: 2,
  },
  {
    area: 'Kuruduwatta',
    time: '09:00 AM - 11:00 AM',
    date: 'Mon, Jan 15',
    citizens: 2,
  },
  {
    area: 'Kuruduwatta',
    time: '09:00 AM - 11:00 AM',
    date: 'Mon, Jan 15',
    citizens: 2,
  },
];

export function OverviewPage() {
//   const navigate = useNavigate();

  const stats = {
    todaysPickups: 8,
    pendingPayments: 8,
    citizensServed: 32,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Welcome */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1">
                Welcome, Kamal Silva
              </h1>
              <p className="text-xl text-gray-600">
                Service Area: Colombo 7
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Truck className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Today's Pickups</p>
                  <p className="text-4xl font-bold">{stats.todaysPickups}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <DollarSign className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Pending Payments</p>
                  <p className="text-4xl font-bold">{stats.pendingPayments}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#043937] text-white border-none shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto opacity-90" />
                  <p className="text-lg opacity-90">Citizens Served</p>
                  <p className="text-4xl font-bold">{stats.citizensServed}</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Routes */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 flex items-center gap-3">
                <MapPin className="h-7 w-7 text-teal-700" />
                Today's Pickup Routes
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {routesToday.map((route, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-[#f0f9f8]"
                  >
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-1.5">
                            Schedule
                          </Badge>
                          <h3 className="text-xl font-semibold text-teal-900">
                            {route.area}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3 text-gray-700">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-teal-700" />
                          <span>{route.date} • {route.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-teal-700" />
                          <span>{route.citizens} citizens</span>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 border-teal-700 text-teal-700 hover:bg-teal-50"
                        >
                          View Details
                        </Button>
                        <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white">
                          Start Route
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      
    </div>
  );
}