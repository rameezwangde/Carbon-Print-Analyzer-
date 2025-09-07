import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { CarbonCategories } from '../types';
import { SLIDER_CONFIGS, CATEGORY_NAMES, CO2_FACTORS } from '../config/constants';

interface CarbonSliderProps {
  category: keyof CarbonCategories;
  value: number;
  onChange: (value: number) => void;
}

export const CarbonSlider = ({ category, value, onChange }: CarbonSliderProps) => {
  const config = SLIDER_CONFIGS[category];
  const displayName = CATEGORY_NAMES[category];
  const co2Impact = (value * CO2_FACTORS[category]).toFixed(1);

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">{displayName}</h3>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {value} {config.unit}
              </div>
              <div className="text-sm font-medium text-green-600">
                {co2Impact} kg CO₂
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[value]}
              onValueChange={(values) => onChange(values[0])}
              max={config.max}
              min={config.min}
              step={config.step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{config.min}</span>
              <span>{config.max} {config.unit}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};