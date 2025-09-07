import * as ngeohash from 'ngeohash';
import { Location } from '../types';

export class LocationService {
  static async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mock reverse geocoding (in real app, use Google Maps Geocoding API)
          const location: Location = {
            lat: latitude,
            lng: longitude,
            city: 'Mumbai', // Mock city
            country: 'India', // Mock country
          };
          
          resolve(location);
        },
        () => {
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }

  static generateGeohash(lat: number, lng: number, precision: number = 5): string {
    return ngeohash.encode(lat, lng, precision);
  }

  static getLocationFromGeohash(geohash: string): { lat: number; lng: number } {
    return ngeohash.decode(geohash);
  }

  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static getMockCities(): Location[] {
    return [
      { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India' },
      { lat: 19.0330, lng: 73.0297, city: 'Navi Mumbai', country: 'India' },
      { lat: 18.5204, lng: 73.8567, city: 'Pune', country: 'India' },
      { lat: 28.7041, lng: 77.1025, city: 'Delhi', country: 'India' },
      { lat: 12.9716, lng: 77.5946, city: 'Bangalore', country: 'India' },
    ];
  }
}