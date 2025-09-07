import { CarbonCategories } from '../types';
import { CO2_FACTORS } from '../config/constants';

export class CarbonCalculator {
  static calculateCategoryCO2(category: keyof CarbonCategories, value: number): number {
    const factor = CO2_FACTORS[category];
    return value * factor;
  }

  static calculateTotalCO2(categories: CarbonCategories): number {
    return Object.entries(categories).reduce((total, [category, value]) => {
      return total + this.calculateCategoryCO2(category as keyof CarbonCategories, value);
    }, 0);
  }

  static getTopCategory(categories: CarbonCategories): { category: keyof CarbonCategories; percentage: number } {
    const total = this.calculateTotalCO2(categories);
    let maxCO2 = 0;
    let topCategory: keyof CarbonCategories = 'transport_km';

    Object.entries(categories).forEach(([category, value]) => {
      const co2 = this.calculateCategoryCO2(category as keyof CarbonCategories, value);
      if (co2 > maxCO2) {
        maxCO2 = co2;
        topCategory = category as keyof CarbonCategories;
      }
    });

    return {
      category: topCategory,
      percentage: total > 0 ? (maxCO2 / total) * 100 : 0,
    };
  }

  static getCategoryBreakdown(categories: CarbonCategories) {
    const total = this.calculateTotalCO2(categories);
    return Object.entries(categories).map(([category, value]) => {
      const co2 = this.calculateCategoryCO2(category as keyof CarbonCategories, value);
      return {
        category: category as keyof CarbonCategories,
        value,
        co2,
        percentage: total > 0 ? (co2 / total) * 100 : 0,
      };
    });
  }
}