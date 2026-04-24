import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStepperProps {
  currentStep: number;
  steps: string[];
}

export function WizardStepper({ currentStep, steps }: WizardStepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={label} className="flex flex-col items-center relative z-10 w-full">
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-1/2 w-full h-[2px] -z-10",
                    isCompleted ? "bg-cyan-500" : "bg-white/[0.08]"
                  )}
                />
              )}
              
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isActive
                    ? "border-cyan-400 bg-[#111820] text-cyan-400"
                    : isCompleted
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : "border-white/[0.08] bg-[#111820] text-gray-500"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{stepNumber}</span>}
              </div>
              <span
                className={cn(
                  "mt-3 text-xs md:text-sm font-medium transition-colors hidden sm:block absolute top-12 whitespace-nowrap",
                  isActive ? "text-cyan-400" : isCompleted ? "text-gray-300" : "text-gray-600"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile Current Step Label */}
      <div className="mt-4 text-center sm:hidden">
         <span className="text-sm font-semibold text-cyan-400">Etapa {currentStep}: {steps[currentStep - 1]}</span>
      </div>
    </div>
  );
}
