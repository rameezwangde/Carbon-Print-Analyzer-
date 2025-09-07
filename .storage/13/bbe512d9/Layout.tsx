import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className = '' }: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};