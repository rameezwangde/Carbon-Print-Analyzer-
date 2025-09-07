import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, BarChart3, MapPin, Lightbulb } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(heroRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );

      // Features stagger animation
      gsap.fromTo(".feature-card", 
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.2, 
          delay: 0.5,
          ease: "back.out(1.7)"
        }
      );

      // Floating animation for icons
      gsap.to(".floating-icon", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        stagger: 0.3
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => navigate('/onboarding')
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center py-16">
          <div className="floating-icon inline-block mb-6">
            <Leaf className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
            CarbonFootprint
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track, analyze, and reduce your carbon emissions with personalized insights and AI-powered recommendations
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Your Journey
          </Button>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600 text-sm">
                Detailed breakdown of your carbon footprint with interactive charts and comparisons
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4">
                <MapPin className="w-12 h-12 text-green-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Insights</h3>
              <p className="text-gray-600 text-sm">
                See how your emissions compare to others in your area with geographic heatmaps
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4">
                <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
              <p className="text-gray-600 text-sm">
                Get personalized suggestions to reduce your carbon footprint effectively
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4">
                <Leaf className="w-12 h-12 text-emerald-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                Monitor your improvement over time and celebrate your environmental impact
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}