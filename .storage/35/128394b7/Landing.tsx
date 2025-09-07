import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, BarChart3, MapPin, Lightbulb } from 'lucide-react';
import { ChatBot } from '../components/ChatBot';

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
    <div 
      ref={containerRef} 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-100/20 to-blue-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center py-16">
          <div className="floating-icon inline-block mb-6">
            <div className="relative">
              <Leaf className="w-16 h-16 text-green-600 mx-auto drop-shadow-lg" />
              <div className="absolute inset-0 w-16 h-16 bg-green-400/20 rounded-full blur-xl"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6 drop-shadow-sm">
            CarbonFootprint
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track, analyze, and reduce your carbon emissions with personalized insights and AI-powered recommendations for Mumbai & Navi Mumbai
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
          >
            Start Your Journey
          </Button>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="feature-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white/95 group">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4 relative">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 w-12 h-12 bg-blue-400/20 rounded-full blur-lg mx-auto"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Smart Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Detailed breakdown of your carbon footprint with interactive charts and community comparisons
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white/95 group">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4 relative">
                <MapPin className="w-12 h-12 text-green-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 w-12 h-12 bg-green-400/20 rounded-full blur-lg mx-auto"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Mumbai Insights</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                See how your emissions compare with others in Mumbai and Navi Mumbai with geographic heatmaps
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white/95 group">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4 relative">
                <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 w-12 h-12 bg-yellow-400/20 rounded-full blur-lg mx-auto"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">AI Recommendations</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get personalized suggestions using Mumbai local transport and lifestyle options
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white/95 group">
            <CardContent className="p-6 text-center">
              <div className="floating-icon mb-4 relative">
                <Leaf className="w-12 h-12 text-emerald-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 w-12 h-12 bg-emerald-400/20 rounded-full blur-lg mx-auto"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Track Progress</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Monitor your improvement over time and celebrate your positive environmental impact
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatBot currentPage="landing" />
    </div>
  );
}