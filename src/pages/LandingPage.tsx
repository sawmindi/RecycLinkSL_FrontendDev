import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, HandCoins, Truck, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '../components/ui/tooltip';
import FooterPage from '../components/layout/Footer';

export function LandingPage() {

  const { i18n, t } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'si' ? 'en' : 'si';
    i18n.changeLanguage(newLang);
  };

    const navigate = useNavigate();
  
    const citizenSteps = [
      {
        number: 1,
        title: t("landing.addYourItems"),
        description: t("landing.listRecyclableItems"),
      },
      {
        number: 2,
        title: t("landing.getPriceSuggestions"),
        description: t("landing.receiveInstantPriceEstimatesAndEarningPotential"),
      },
      {
        number: 3,
        title: t("landing.schedulePickup"),
        description: t("landing.chooseFromAvailablePickupSlotsInYourArea"),
      },
    ];
    const collectorSteps = [
  {
    number: 1,
    title: t("landing.schedulePickup"),
    description: t("landing.chooseFromAvailablePickupSlotsInYourArea"),
  },
  {
    number: 2,
    title: t("landing.getPriceSuggestions"),
    description: t("landing.receiveInstantPriceEstimatesAndEarningPotential"),
  },
  {
    number: 3,
    title: t("landing.smartScheduling"),
    description: t("landing.optimiseCollectionRoutesAndSchedulesToReduceFuelCostsAndTimeWastage"),
  },
];

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img
            src="/logo.png"
            alt="RecycLinkSL"
            className="h-9 md:h-11 cursor-pointer"
            onClick={() => navigate('/')}
          />

          <div className="flex items-center gap-2 md:gap-4">
            
          <Button
            variant="link"
            className="text-gray-700"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('landing.howItWorks')}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:text-teal-200 hover:bg-teal-900/40 rounded-full"
                  onClick={toggleLanguage}
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {i18n.language === 'si' ? 'English' : 'සිංහල'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs md:text-sm text-gray-500 hover:text-[#325251]"
              onClick={() => navigate('/login')}
            >
              {t('landing.login')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-10">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#325251] mb-6 leading-tight">
            {t('landing.smartWasteCollectionForSriLanka')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
            {t('landing.connectCitizensAndWasteCollectorsThroughIntelligentSchedulingAI-poweredPricePredictionsAndSeamlessCoordinationReduceNoisePollutionSaveFuelAndEarnMoneyFromYourRecyclableItems')}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
            <Button
            onClick={() => navigate('/login')}
              className="group relative bg-[#325251] hover:[#4a5f5c] text-white px-10 py-7 text-base rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              {t('landing.getStartedAsCitizen')}
            </Button>
            {/* <Button 
            onClick={() => navigate('/login')}
              className="group bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-[#325251] px-10 py-7 text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Truck className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              {t('landing.joinAsCollector')}
            </Button> */}
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
                {t('landing.aiPoweredPricing')}
              </h3>
              <p className="text-emerald-50 leading-relaxed text-lg">
                {t('landing.getInstantPriceEstimatesForYourRecyclableItemsUsingAdvancedAIAlgorithms')}
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
                {t('landing.smartScheduling')}
              </h3>
              <p className="text-teal-50 leading-relaxed text-lg">
                {t('landing.optimiseCollectionRoutesAndSchedulesToReduceFuelCostsAndTimeWastage')}
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
                {t('landing.communityConnection')}
              </h3>
              <p className="text-cyan-50 leading-relaxed text-lg">
                {t('landing.connectCitizensAndCollectorsDirectlyEliminatingTheNeedForLoudAnnouncements')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-16">
            {t('landing.howItWorks')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* For Citizens */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Users className="w-8 h-8 text-gray-700" />
                <h3 className="text-2xl font-serif text-gray-800">{t('landing.forCitizen')}</h3>
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
                <h3 className="text-2xl font-serif text-gray-800">{t('landing.forCollectors')}</h3>
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

        <FooterPage />
    </div>
  );
};