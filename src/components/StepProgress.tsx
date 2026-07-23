'use client';

import React from 'react';
import { User, Shirt, FileText, CreditCard, Check, LucideIcon } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
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
    <div className="mb-6 md:mb-8">
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                      ? 'bg-white dark:bg-slate-950 border-blue-600 text-blue-600'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-[10px] md:text-xs font-medium text-center hidden sm:block ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1.5 md:mx-3 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Mobile active label */}
      <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 text-center sm:hidden">
        {STEPS[currentIndex]?.label}
      </p>
    </div>
  );
};
