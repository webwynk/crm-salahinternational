import React from 'react';
import { Check } from 'lucide-react';

export default function Stepper({ steps = [], currentStep = 1, onStepClick }) {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Connecting track line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-200 z-0" />
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-600 transition-all duration-300 z-0"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div
                            key={step.title || index}
                            onClick={() => onStepClick && isCompleted && onStepClick(stepNumber)}
                            className={`relative z-10 flex flex-col items-center group ${
                                isCompleted ? 'cursor-pointer' : 'cursor-default'
                            }`}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-xs ${
                                    isCompleted
                                        ? 'bg-brand-600 text-white border-2 border-brand-600'
                                        : isCurrent
                                        ? 'bg-white text-brand-600 border-2 border-brand-600 ring-4 ring-brand-100'
                                        : 'bg-white text-neutral-400 border-2 border-neutral-300'
                                }`}
                            >
                                {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : stepNumber}
                            </div>
                            <div className="mt-2 text-center">
                                <span
                                    className={`block text-xs font-semibold tracking-tight ${
                                        isCurrent
                                            ? 'text-brand-700'
                                            : isCompleted
                                            ? 'text-neutral-900'
                                            : 'text-neutral-400'
                                    }`}
                                >
                                    {step.title}
                                </span>
                                {step.description && (
                                    <span className="hidden sm:block text-[11px] text-neutral-400 max-w-[120px] truncate">
                                        {step.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
