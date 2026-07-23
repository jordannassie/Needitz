"use client";

import { useEffect } from "react";
import { FormProvider, useFormContext } from "./FormContext";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import { Step5 } from "./Step5";
import { Step6 } from "./Step6";
import { trackEvent } from "@/components/Analytics";

const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6];

function FormInner() {
  const { currentStep } = useFormContext();
  const StepComponent = STEPS[currentStep - 1];

  useEffect(() => {
    if (currentStep === 1) {
      trackEvent("request_started");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-2xl mx-auto px-5 py-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={6} />
      <StepComponent />
    </div>
  );
}

export function RequestForm() {
  return (
    <FormProvider>
      <FormInner />
    </FormProvider>
  );
}
