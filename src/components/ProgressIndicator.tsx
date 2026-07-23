import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["What you need", "", "", "", "", ""];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    // Extra bottom margin gives space for the absolutely-positioned step label
    <div className="mb-10">
      <div
        className="flex items-center"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const label = STEP_LABELS[i];

          return (
            <div key={step} className="flex items-center">
              {/* Circle wrapper — fixed 34×34px; label floats below via absolute */}
              <div className="relative w-[34px] h-[34px] flex items-center justify-center">

                {/* Pulsing ring — absolute so it never shifts layout */}
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[#FFC400] step-pulse-ring"
                  />
                )}

                {/* Inner circle */}
                <div
                  className={`relative z-10 flex items-center justify-center rounded-full w-[34px] h-[34px] transition-all ${
                    isCurrent || isCompleted
                      ? "bg-[#FFC400] text-[#050505]"
                      : "border-2 border-[#D8D8D8] text-[#9A9DA5]"
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <Check size={15} strokeWidth={3} />
                  ) : (
                    <span className="text-[12px] font-bold">{step}</span>
                  )}
                </div>

                {/* Step label — absolutely positioned below, zero effect on layout */}
                {isCurrent && label && (
                  <span
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-[10px] font-semibold text-[#050505] whitespace-nowrap hidden sm:block"
                    aria-hidden="true"
                  >
                    {label}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={`h-[2px] w-6 mx-1 flex-shrink-0 transition-all ${
                    step < currentStep ? "bg-[#FFC400]" : "bg-[#D8D8D8]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}

        <span className="sr-only">Step {currentStep} of {totalSteps}</span>
      </div>
    </div>
  );
}
