import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CarbonSlider } from '../components/CarbonSlider';
import { CarbonCategories } from '../types';
import { CarbonCalculator } from '../services/carbonCalculator';
import { Leaf } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type Factors = Record<string, Record<string, number>>;

export default function Survey() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);

  // === your original numeric sliders ===
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

  // === new categorical selects (kept in component state) ===
  const [categoricals, setCategoricals] = useState({
    Diet: 'Omnivore',
    'Heating Energy Source': 'Electricity',
    Recycling: 'Sometimes',
    Cooking_With: 'LPG',
    'Social Activity': 'Medium',
  });

  // emission factors loaded from /public/data/emission_factors.json
  const [factors, setFactors] = useState<Factors>({});

  useEffect(() => {
    // IMPORTANT: make sure a copy of emission_factors.json is in /public/data/
    fetch('/data/emission_factors.json')
      .then(r => r.json())
      .then(setFactors)
      .catch(() => setFactors({}));
  }, []);

  // your original numeric total
  const numericTotal = useMemo(
    () => CarbonCalculator.calculateTotalCO2(categories),
    [categories]
  );

  // added categorical contribution
  const categoricalTotal = useMemo(() => {
    let sum = 0;
    for (const [k, v] of Object.entries(categoricals)) {
      const f = (factors as any)?.[k]?.[v];
      if (typeof f === 'number') sum += f;
    }
    return sum;
  }, [categoricals, factors]);

  // new final total = numeric + categorical factors
  const totalCO2 = numericTotal + categoricalTotal;

  const progress = Math.min((totalCO2 / 500) * 100, 100); // same scale as before

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".survey-header", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
      gsap.fromTo(".slider-container", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" });
      gsap.fromTo(".total-card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: "back.out(1.7)" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.to(totalRef.current, { scale: 1.05, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
  }, [totalCO2]);

  const handleCategoryChange = (category: keyof CarbonCategories, value: number) => {
    setCategories(prev => ({ ...prev, [category]: value }));
  };

  const handleSelectChange = (id: keyof typeof categoricals, value: string) => {
    setCategoricals(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const surveyData = {
      categories,            // numeric
      categoricals,          // categorical
      totalCO2,
      numericTotal,
      categoricalTotal,
      timestamp: new Date().toISOString(),
      location: JSON.parse(localStorage.getItem('userLocation') || '{}')
    };
    localStorage.setItem('carbonSurvey', JSON.stringify(surveyData));
    gsap.to(containerRef.current, {
      opacity: 0, y: -20, duration: 0.5, onComplete: () => navigate('/dashboard')
    });
  };

  const getCO2Color = (co2: number) => {
    if (co2 < 200) return 'text-green-600';
    if (co2 < 400) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="survey-header text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Carbon Footprint Survey</h1>
          <p className="text-gray-600">Adjust the sliders and selects to reflect your monthly lifestyle</p>
        </div>

        {/* Total */}
        <Card className="total-card mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Monthly CO₂ Emissions</h3>
                <p className="text-sm text-gray-600">Live calculation based on your inputs</p>
              </div>
              <div ref={totalRef} className={`text-3xl font-bold ${getCO2Color(totalCO2)}`}>
                {totalCO2.toFixed(1)} kg
              </div>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low Impact</span><span>High Impact</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span>Numeric: {numericTotal.toFixed(1)} kg</span>
              <span className="mx-2">•</span>
              <span>Categorical: {categoricalTotal.toFixed(1)} kg</span>
            </div>
          </CardContent>
        </Card>

        {/* Sliders (unchanged API) */}
        <div className="space-y-4 mb-8">
          {Object.entries(categories).map(([category, value]) => (
            <div key={category} className="slider-container">
              <CarbonSlider
                category={category as keyof CarbonCategories}
                value={value as number}
                onChange={(newValue) => handleCategoryChange(category as keyof CarbonCategories, newValue)}
              />
            </div>
          ))}
        </div>

        {/* Categorical selects */}
        <div className="space-y-4 mb-8">
          {/* Diet */}
          <div className="slider-container">
            <div className="mb-2 text-sm font-medium text-gray-700">Diet</div>
            <Select value={categoricals['Diet']} onValueChange={(v) => handleSelectChange('Diet', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select diet" /></SelectTrigger>
              <SelectContent>
                {['Vegan','Vegetarian','Pescatarian','Omnivore','Meat-Heavy'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Cooking energy */}
          <div className="slider-container">
            <div className="mb-2 text-sm font-medium text-gray-700">Cooking energy</div>
            <Select value={categoricals['Cooking_With']} onValueChange={(v) => handleSelectChange('Cooking_With', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select energy" /></SelectTrigger>
              <SelectContent>
                {['Electricity','LPG','Wood','Coal'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Heating energy source */}
          <div className="slider-container">
            <div className="mb-2 text-sm font-medium text-gray-700">Heating energy source</div>
            <Select value={categoricals['Heating Energy Source']} onValueChange={(v) => handleSelectChange('Heating Energy Source', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {['Electricity','Natural Gas','Coal','Renewable','None'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Recycling */}
          <div className="slider-container">
            <div className="mb-2 text-sm font-medium text-gray-700">Recycling habit</div>
            <Select value={categoricals['Recycling']} onValueChange={(v) => handleSelectChange('Recycling', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select habit" /></SelectTrigger>
              <SelectContent>
                {['Always','Sometimes','Never'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Social activity */}
          <div className="slider-container">
            <div className="mb-2 text-sm font-medium text-gray-700">Social activity level</div>
            <Select value={categoricals['Social Activity']} onValueChange={(v) => handleSelectChange('Social Activity', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                {['Low','Medium','High'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Analyze My Footprint
          </Button>
        </div>
      </div>
    </div>
  );
}

