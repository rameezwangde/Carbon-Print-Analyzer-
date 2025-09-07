import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  currentPage?: string;
}

export const ChatBot = ({ currentPage = 'general' }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextualGreetings = {
    landing: "Hi! 👋 Welcome to CarbonFootprint! I'm here to help you start your journey to reduce your carbon emissions. Would you like to know how the app works?",
    onboarding: "Great to see you're getting started! 🌱 I can help explain our privacy policy or guide you through location setup. What would you like to know?",
    survey: "Ready to calculate your carbon footprint? 📊 I can explain what each category means or help you understand the CO₂ calculations. Ask me anything!",
    dashboard: "Awesome! You've completed your carbon assessment! 📈 I can help you understand your results, explain the community comparison, or discuss the AI recommendations.",
    map: "Exploring the community data? 🗺️ I can explain how the heatmap works, what the different emission levels mean, or help you understand the geographic insights.",
    powerbi: "Interested in advanced analytics? 📊 I can tell you about the upcoming Power BI features and how they'll help you track your progress over time."
  };

  const botResponses = {
    // General responses
    hello: "Hello! I'm your carbon footprint assistant. How can I help you reduce your environmental impact today?",
    help: "I can help you with:\n• Understanding carbon categories\n• Explaining your results\n• Providing reduction tips\n• Navigating the app\n• Answering questions about climate impact",
    
    // Carbon footprint related
    transport: "Transportation is often the biggest contributor to personal carbon footprints. In Mumbai, consider using local trains, metro, or buses instead of private vehicles. Even carpooling can reduce your impact by 50%!",
    electricity: "Electricity usage varies greatly in Mumbai. Simple changes like using LED bulbs, setting AC to 24°C, and unplugging devices can reduce your emissions by 15-20%.",
    food: "Food choices matter! Reducing meat consumption by just 2 days per week can save 15kg CO₂ monthly. Try more plant-based meals with dal, vegetables, and grains.",
    waste: "Waste management is crucial. Composting organic waste and proper recycling can reduce your waste footprint by 40%. Mumbai has several waste segregation programs you can join.",
    
    // App navigation
    survey: "The carbon survey asks about 8 key areas of your lifestyle. Each slider shows real-time CO₂ calculations. Take your time and be as accurate as possible for better recommendations.",
    dashboard: "Your dashboard shows your personal breakdown, compares you with the community, and provides AI-powered recommendations. The pie chart shows which areas to focus on first.",
    recommendations: "Our AI analyzes your footprint and compares it with similar users to suggest the most effective reduction strategies for your specific situation.",
    
    // Default responses
    default: [
      "That's a great question! Could you be more specific about what you'd like to know?",
      "I'm here to help with carbon footprint questions. What would you like to learn about?",
      "Interesting! Can you tell me more about what you're looking for?",
      "I'd love to help! Could you rephrase that or ask about a specific carbon category?"
    ]
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = contextualGreetings[currentPage as keyof typeof contextualGreetings] || contextualGreetings.landing;
      addBotMessage(greeting);
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(chatRef.current, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return botResponses.hello;
    }
    if (message.includes('help') || message.includes('guide')) {
      return botResponses.help;
    }
    if (message.includes('transport') || message.includes('car') || message.includes('travel')) {
      return botResponses.transport;
    }
    if (message.includes('electricity') || message.includes('power') || message.includes('energy')) {
      return botResponses.electricity;
    }
    if (message.includes('food') || message.includes('meat') || message.includes('diet')) {
      return botResponses.food;
    }
    if (message.includes('waste') || message.includes('garbage') || message.includes('recycl')) {
      return botResponses.waste;
    }
    if (message.includes('survey') || message.includes('questionnaire')) {
      return botResponses.survey;
    }
    if (message.includes('dashboard') || message.includes('results')) {
      return botResponses.dashboard;
    }
    if (message.includes('recommendation') || message.includes('suggest') || message.includes('tip')) {
      return botResponses.recommendations;
    }
    
    // Return random default response
    const defaults = botResponses.default;
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(userMessage);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card 
      ref={chatRef}
      className="fixed bottom-6 right-6 z-50 w-80 h-96 shadow-2xl border-0 bg-white/95 backdrop-blur-sm"
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Carbon Assistant
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.isBot && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {!message.isBot && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about carbon footprint..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};