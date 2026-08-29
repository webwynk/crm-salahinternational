import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Stepper — Enterprise SaaS Wizard Tab Bar (Linear / Stripe Dashboard Grade)
 *
 * Props:
 *   steps       — array of { title: string, description?: string }
 *   currentStep — active step index (1-indexed)
 *   onStepClick — (stepNumber: number) => void
 */
export default function Stepper({ steps = [], currentStep = 1, onStepClick }) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-neutral-100/90 rounded-2xl border border-neutral-200/80 shadow-xs">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div
                            key={step.title || index}
                            onClick={() => onStepClick && isCompleted && onStepClick(stepNumber)}
                            className={`relative group rounded-xl p-3 sm:p-3.5 transition-all duration-200 flex items-start gap-3 select-none ${
                                isCurrent
                                    ? 'bg-neutral-0 border border-neutral-200/90 shadow-sm ring-1 ring-neutral-950/5'
                                    : isCompleted
                                    ? 'bg-success-50/50 hover:bg-success-50 border border-success-200/60 cursor-pointer'
                                    : 'bg-transparent border border-transparent opacity-60 cursor-default'
                            }`}
                        >
                            {/* Step Badge */}
                            <div className="shrink-0 mt-0.5">
                                {isCompleted ? (
                                    <div className="w-7 h-7 rounded-lg bg-success-500 text-white flex items-center justify-center shadow-xs">
                                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                ) : isCurrent ? (
                                    <div className="w-7 h-7 rounded-lg bg-brand-500 text-white font-sans font-bold text-xs flex items-center justify-center shadow-xs">
                                        {stepNumber}
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 rounded-lg bg-neutral-200/80 text-neutral-600 font-sans font-semibold text-xs flex items-center justify-center">
                                        {stepNumber}
                                    </div>
                                )}
                            </div>

                            {/* Step Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <span
                                        className={`block text-xs font-bold tracking-tight truncate ${
                                            isCurrent
                                                ? 'text-neutral-900'
                                                : isCompleted
                                                ? 'text-neutral-800'
                                                : 'text-neutral-500'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                    {isCompleted && (
                                        <span className="text-2xs font-bold text-success-700 bg-success-100 px-1.5 py-0.5 rounded shrink-0 hidden md:inline-block">
                                            Done
                                        </span>
                                    )}
                                </div>

                                {step.description && (
                                    <p
                                        className={`text-2xs truncate mt-0.5 ${
                                            isCurrent
                                                ? 'text-neutral-500 font-medium'
                                                : isCompleted
                                                ? 'text-neutral-600'
                                                : 'text-neutral-400'
                                        }`}
                                    >
                                        {step.description}
                                    </p>
                                )}

                                {/* Bottom Accent Indicator Bar for Active Step */}
                                {isCurrent && (
                                    <motion.div
                                        layoutId="activeStepperIndicator"
                                        className="h-0.5 w-full bg-brand-500 rounded-full mt-2"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

