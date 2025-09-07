import { useState, useEffect } from 'react';
import { Location } from '../types';
import { LocationService } from '../services/locationService';

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      } else {
        setError('Unable to get your location. Please select manually.');
      }
    } catch (err) {
      setError('Location access denied or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const setManualLocation = (manualLocation: Location) => {
    setLocation(manualLocation);
    setError(null);
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setManualLocation,
  };
};