import React from 'react';
import { HandCoins, Recycle, Truck, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {

    const navigate = useNavigate();
  
    const citizenSteps = [
        {
        number: 1,
        title: "Add Your Items",
        description: "List recyclable items"
        },
        {
        number: 2,
        title: "Get AI Price Suggestions",
        description: "Receive instant price estimates and earning potential"
        },
        {
        number: 3,
        title: "Schedule Pickup",
        description: "Choose from available pickup slots in your area"
        }
    ];

    const collectorSteps = [
        {
        number: 1,
        title: "Create Schedules",
        description: "Set pickup schedules for different areas and routes"
        },
        {
        number: 2,
        title: "Get AI Price Suggestions",
        description: "Receive instant price estimates and earning potential"
        },
        {
        number: 3,
        title: "Schedule Pickup",
        description: "Choose from available pickup slots in your area"
        }
    ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-10">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#325251] mb-6 leading-tight">
            Smart Waste Collection for Sri Lanka
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
            Connect citizens and waste collectors through intelligent scheduling,
            AI-powered price predictions, and seamless coordination. Reduce noise
            pollution, save fuel, and earn money from your recyclable items.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
            <Button
            onClick={() => navigate('/login')}
              className="group relative bg-[#325251] hover:[#4a5f5c] text-white px-10 py-7 text-base rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Get started as Citizen
            </Button>
            <Button 
            onClick={() => navigate('/login')}
              className="group bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-[#325251] px-10 py-7 text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Truck className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Join as Collector
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
          <Card className="group relative overflow-hidden bg-[#0F504E] border-none shadow-2xl hover:shadow-[#325251] transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="relative p-10 text-center space-y-5">
              <div className="flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  <HandCoins className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">
                AI-Powered Pricing
              </h3>
              <p className="text-emerald-50 leading-relaxed text-lg">
                Get instant price estimates for your recyclable items using advanced AI algorithms
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-[#0F504E] border-none shadow-2xl hover:shadow-[#325251] transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="relative p-10 text-center space-y-5">
              <div className="flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  <Truck className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Smart Scheduling
              </h3>
              <p className="text-teal-50 leading-relaxed text-lg">
                Optimise collection routes and schedules to reduce fuel costs and time wastage
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-[#0F504E] border-none shadow-2xl hover:shadow-[#325251] transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="relative p-10 text-center space-y-5">
              <div className="flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Community Connection
              </h3>
              <p className="text-cyan-50 leading-relaxed text-lg">
                Connect citizens and collectors directly, eliminating the need for loud announcements
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-16">
            How It Work
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* For Citizens */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Users className="w-8 h-8 text-gray-700" />
                <h3 className="text-2xl font-serif text-gray-800">For Citizens</h3>
              </div>
              
              <div className="space-y-6">
                {citizenSteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#4a5f5c] text-white flex items-center justify-center font-semibold">
                        {step.number}
                      </div>
                    </div>
                    <div className="pt-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Collectors */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Truck className="w-8 h-8 text-gray-700" />
                <h3 className="text-2xl font-serif text-gray-800">For Collectors</h3>
              </div>
              
              <div className="space-y-6">
                {collectorSteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#4a5f5c] text-white flex items-center justify-center font-semibold">
                        {step.number}
                      </div>
                    </div>
                    <div className="pt-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300 py-4 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Recycle className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                RecycLinkSL
              </span>
            </div>
            <p className="text-sm text-slate-400">
              &copy; 2026 RecycLinkSL. Making waste collection smarter and quieter.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};