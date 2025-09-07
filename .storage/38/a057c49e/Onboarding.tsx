import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, MapPin, Users, TrendingDown } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { LocationService } from '../services/locationService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChatBot } from '../components/ChatBot';

export default function Onboarding() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { location, loading, error, getCurrentLocation, setManualLocation } = useLocation();
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".onboarding-card", 
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      );

      gsap.fromTo(".privacy-item", 
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 0.3,
          ease: "power2.out"
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [step]);

  const handleLocationRequest = async () => {
    await getCurrentLocation();
    if (!error) {
      setStep(3);
    }
  };

  const handleManualLocation = () => {
    if (selectedCity) {
      const cities = LocationService.getMockCities();
      const selected = cities.find(city => city.city === selectedCity);
      if (selected) {
        setManualLocation(selected);
        setStep(3);
      }
    }
  };

  const handleContinue = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => navigate('/survey')
    });
  };

  const renderStep1 = () => (
    <Card className="onboarding-card max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-gray-800">Privacy & Data Use</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="privacy-item flex items-start space-x-3 p-4 bg-green-50/80 rounded-lg">
            <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Your Data is Protected</h4>
              <p className="text-sm text-gray-600">All personal information is encrypted and stored securely</p>
            </div>
          </div>
          
          <div className="privacy-item flex items-start space-x-3 p-4 bg-blue-50/80 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Anonymous by Default</h4>
              <p className="text-sm text-gray-600">Your identity remains private while contributing to community insights</p>
            </div>
          </div>
          
          <div className="privacy-item flex items-start space-x-3 p-4 bg-purple-50/80 rounded-lg">
            <TrendingDown className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Personalized Recommendations</h4>
              <p className="text-sm text-gray-600">We use your data only to provide better carbon reduction suggestions</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setStep(2)} 
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          I Understand, Continue
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="onboarding-card max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-gray-800">Location for Community Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-center text-gray-600 leading-relaxed">
          We'll use your location to compare your carbon footprint with others in Mumbai & Navi Mumbai area and provide relevant local recommendations.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLocationRequest}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? <LoadingSpinner /> : 'Auto-Detect My Location'}
          </Button>
          
          <div className="text-center text-sm text-gray-500">or</div>
          
          <div className="space-y-3">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-white/80 border-gray-200 shadow-sm">
                <SelectValue placeholder="Select your city manually" />
              </SelectTrigger>
              <SelectContent>
                {LocationService.getMockCities().map(city => (
                  <SelectItem key={`${city.city}-${city.country}`} value={city.city}>
                    {city.city}, {city.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleManualLocation}
              disabled={!selectedCity}
              variant="outline"
              className="w-full bg-white/80 border-gray-200 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              Use Selected City
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50/80 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="onboarding-card max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MapPin className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-gray-800">Location Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {location && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200/50 shadow-sm">
            <p className="font-medium text-green-800 text-lg">
              📍 {location.city}, {location.country}
            </p>
            <p className="text-sm text-green-600 mt-2">
              Ready to analyze your carbon footprint in this area
            </p>
          </div>
        )}
        
        <p className="text-gray-600 leading-relaxed">
          Great! Now let's collect some information about your lifestyle to calculate your carbon footprint and provide personalized recommendations.
        </p>
        
        <Button 
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Start Carbon Survey
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen py-8 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%),
          url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-green-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      <ChatBot currentPage="onboarding" />
    </div>
  );
}