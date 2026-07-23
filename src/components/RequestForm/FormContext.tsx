"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface FormData {
  item_request: string;
  budget: string;
  deadline: string;
  deadline_is_flexible: boolean;
  delivery_location: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  additional_details: string;
}

const DEFAULT_FORM_DATA: FormData = {
  item_request: "",
  budget: "",
  deadline: "",
  deadline_is_flexible: false,
  delivery_location: "",
  full_name: "",
  email: "",
  phone: "",
  company_name: "",
  additional_details: "",
};

const STORAGE_KEY = "needitz_form_draft";

interface FormContextValue {
  formData: FormData;
  updateFormData: (partial: Partial<FormData>) => void;
  currentStep: number;
  setStep: (step: number) => void;
  clearForm: () => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [currentStep, setCurrentStepState] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormData & { _step: number }>;
        const { _step, ...data } = parsed;
        setFormData({ ...DEFAULT_FORM_DATA, ...data });
        if (_step && _step >= 1 && _step <= 6) setCurrentStepState(_step);
      }
    } catch {
      // Ignore storage errors
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((data: FormData, step: number) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, _step: step }));
    } catch {
      // Ignore
    }
  }, []);

  const updateFormData = useCallback(
    (partial: Partial<FormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...partial };
        persist(next, currentStep);
        return next;
      });
    },
    [currentStep, persist]
  );

  const setStep = useCallback(
    (step: number) => {
      setCurrentStepState(step);
      persist(formData, step);
    },
    [formData, persist]
  );

  const clearForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStepState(1);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  if (!hydrated) return null;

  return (
    <FormContext.Provider value={{ formData, updateFormData, currentStep, setStep, clearForm }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used inside FormProvider");
  return ctx;
}
