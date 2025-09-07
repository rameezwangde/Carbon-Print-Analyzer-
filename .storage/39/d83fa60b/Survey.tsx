import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CarbonSlider } from '../components/CarbonSlider';
import { CarbonCategories } from '../types';
import { CarbonCalculator } from '../services/carbonCalculator';
import { Leaf } from 'lucide-react';
import { ChatBot } from '../components/ChatBot';

export default function Survey() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);
  
  const [categories, setCategories] = useState<CarbonCategories>({
    transport_km: 100,
    electricity_kWh: 300,
    lpg_kg: 15,
    flights_hours: 5,
    meat_meals: 30,
    dining_out: 10,
    shopping_spend: 500,
    waste_kg: 50,
  });

  const totalCO2 = CarbonCalculator.calculateTotalCO2(categories);
  const progress = Math.min((totalCO2 / 500) * 100, 100); // Assume 500kg is high

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".survey-header", 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(".slider-container", 
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.6, 
          stagger: 0.1, 
          delay: 0.3,
          ease: "power2.out"
        }
      );

      gsap.fromTo(".total-card", 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: "back.out(1.7)" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Animate total CO2 changes
    gsap.to(totalRef.current, {
      scale: 1.05,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  }, [totalCO2]);

  const handleCategoryChange = (category: keyof CarbonCategories, value: number) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = () => {
    // Store survey data in localStorage (mock Firebase)
    const surveyData = {
      categories,
      totalCO2,
      timestamp: new Date().toISOString(),
      location: JSON.parse(localStorage.getItem('userLocation') || '{}')
    };
    
    localStorage.setItem('carbonSurvey', JSON.stringify(surveyData));
    
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      onComplete: () => navigate('/dashboard')
    });
  };

  const getCO2Color = (co2: number) => {
    if (co2 < 200) return 'text-green-600';
    if (co2 < 400) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen py-8 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%),
          url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.02'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' fill-rule='nonzero'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-green-200/15 to-blue-200/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-tr from-blue-200/15 to-emerald-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-100/10 to-blue-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="survey-header text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Carbon Footprint Survey</h1>
          <p className="text-gray-600 leading-relaxed">
            Adjust the sliders below to reflect your monthly consumption and lifestyle in Mumbai
          </p>
        </div>

        {/* Progress and Total */}
        <Card className="total-card mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Monthly CO₂ Emissions</h3>
                <p className="text-sm text-gray-600">Live calculation based on your inputs</p>
              </div>
              <div ref={totalRef} className={`text-3xl font-bold ${getCO2Color(totalCO2)} drop-shadow-sm`}>
                {totalCO2.toFixed(1)} kg
              </div>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low Impact</span>
              <span>High Impact</span>
            </div>
          </CardContent>
        </Card>

        {/* Sliders */}
        <div className="space-y-4 mb-8">
          {Object.entries(categories).map(([category, value]) => (
            <div key={category} className="slider-container">
              <CarbonSlider
                category={category as keyof CarbonCategories}
                value={value}
                onChange={(newValue) => handleCategoryChange(category as keyof CarbonCategories, newValue)}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            size="lg"
            className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white px-12 py-3 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
          >
            Analyze My Footprint
          </Button>
        </div>
      </div>

      <ChatBot currentPage="survey" />
    </div>
  );
}