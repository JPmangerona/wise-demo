'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface text-on-surface">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}>
        <Header />
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
