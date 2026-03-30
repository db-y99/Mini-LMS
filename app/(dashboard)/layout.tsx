'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    // Customer sign-contract can be standalone; if we're in (dashboard) and role is customer, still show layout or redirect
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header userName={user.fullName} userRole={user.role} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
