'use client';

import React from 'react';
import { User, Shirt, FileText, CreditCard, Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

const STEPS: Step[] = [
  { id: 'info', label: 'ข้อมูลผู้รับ', icon: User },
  { id: 'items', label: 'รายละเอียดเสื้อ', icon: Shirt },
  { id: 'review', label: 'ตรวจสอบรายการ', icon: FileText },
  { id: 'payment', label: 'ชำระเงิน', icon: CreditCard },
];

interface StepProgressProps {
  currentStep: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const getStepIndex = (stepId: string) => STEPS.findIndex((s) => s.id === stepId);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full py-4 px-3 md:py-6 md:px-8 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200/30 dark:border-slate-850 shadow-lg rounded-2xl md:rounded-3xl mb-6 md:mb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isActive
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-50 dark:ring-blue-950'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 md:w-6 h-6 stroke-[3]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 md:w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs md:text-sm font-bold transition-colors duration-300 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  } text-center hidden sm:block`}
                >
                  {step.label}
                </span>
                {/* Mobile label - only show active to save space */}
                <span
                  className={`mt-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 text-center sm:hidden ${
                    isActive ? 'block' : 'hidden'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 md:mx-4 bg-slate-200 dark:bg-slate-800 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
