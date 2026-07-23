import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["What you need", "", "", "", "", ""];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div
      className="flex items-center gap-0 mb-6"
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
            <div className="flex flex-col items-center gap-1">
              {/* Circle wrapper — relative so the pulse ring can be absolutely placed */}
              <div className="relative flex items-center justify-center w-7 h-7">
                {/* Pulsing ring — only on the active step */}
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[#FFC400] step-pulse-ring"
                  />
                )}

                {/* Inner circle */}
                <div
                  className={`relative z-10 flex items-center justify-center rounded-full transition-all w-7 h-7 ${
                    isCurrent
                      ? "bg-[#FFC400] text-[#050505]"
                      : isCompleted
                      ? "bg-[#FFC400] text-[#050505]"
                      : "border-2 border-[#D8D8D8] text-[#9A9DA5]"
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <Check size={13} strokeWidth={3} />
                  ) : (
                    <span className="text-[11px] font-bold">{step}</span>
                  )}
                </div>
              </div>

              {isCurrent && label && (
                <span className="text-[10px] font-semibold text-[#050505] whitespace-nowrap hidden sm:block">
                  {label}
                </span>
              )}
            </div>

            {step < totalSteps && (
              <div
                className={`h-[2px] w-6 mx-1 transition-all ${
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
  );
}
