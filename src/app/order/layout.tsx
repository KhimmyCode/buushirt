'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { StepProgress } from '@/components/StepProgress';

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  const { userEmail, currentStep, isMounted, setStep } = useOrder();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (isMounted && !userEmail) {
      router.push('/login');
    }
  }, [userEmail, isMounted, router]);

  // Sync step from pathname to context
  useEffect(() => {
    if (pathname.includes('/order/info')) {
      setStep('info');
    } else if (pathname.includes('/order/items')) {
      setStep('items');
    } else if (pathname.includes('/order/review')) {
      setStep('review');
    } else if (pathname.includes('/order/payment')) {
      setStep('payment');
    }
  }, [pathname, setStep]);

  if (!isMounted || !userEmail) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      {/* Checkout step progress */}
      <StepProgress currentStep={currentStep} />

      {/* Main step container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-xl overflow-hidden p-6 md:p-10 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
