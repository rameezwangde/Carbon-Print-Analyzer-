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
    <Card className="onboarding-card max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Privacy & Data Use</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="privacy-item flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Your Data is Protected</h4>
              <p className="text-sm text-gray-600">All personal information is encrypted and stored securely</p>
            </div>
          </div>
          
          <div className="privacy-item flex items-start space-x-3">
            <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Anonymous by Default</h4>
              <p className="text-sm text-gray-600">Your identity remains private while contributing to community insights</p>
            </div>
          </div>
          
          <div className="privacy-item flex items-start space-x-3">
            <TrendingDown className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Personalized Recommendations</h4>
              <p className="text-sm text-gray-600">We use your data only to provide better carbon reduction suggestions</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setStep(2)} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          I Understand, Continue
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="onboarding-card max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Location for Community Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-center text-gray-600">
          We'll use your location to compare your carbon footprint with others in your area and provide relevant recommendations.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLocationRequest}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <LoadingSpinner /> : 'Auto-Detect My Location'}
          </Button>
          
          <div className="text-center text-sm text-gray-500">or</div>
          
          <div className="space-y-3">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
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
              className="w-full"
            >
              Use Selected City
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="onboarding-card max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Location Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {location && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="font-medium text-green-800">
              📍 {location.city}, {location.country}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Ready to analyze your carbon footprint in this area
            </p>
          </div>
        )}
        
        <p className="text-gray-600">
          Great! Now let's collect some information about your lifestyle to calculate your carbon footprint.
        </p>
        
        <Button 
          onClick={handleContinue}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Start Carbon Survey
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}