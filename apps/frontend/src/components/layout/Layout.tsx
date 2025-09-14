import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  roomId?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, roomId }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header roomId={roomId} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
