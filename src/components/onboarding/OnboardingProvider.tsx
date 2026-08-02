"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  { id: "welcome", title: "Welcome to Tamer Studio", description: "Your AI-powered creative platform. Let's get you started.", icon: "🚀" },
  { id: "workspace", title: "Your Workspace", description: "This is your creative hub. Access all AI modules from the sidebar.", icon: "📁" },
  { id: "ai-studio", title: "AI Studios", description: "Generate images, videos, stories, and affiliate campaigns with AI.", icon: "✨" },
  { id: "prompts", title: "Prompt Intelligence", description: "Build, optimize, and reuse prompts across all AI modules.", icon: "💡" },
  { id: "projects", title: "Projects", description: "Organize your work into projects. Track progress and history.", icon: "📋" },
  { id: "publishing", title: "Publishing", description: "Schedule and publish content across multiple platforms.", icon: "📢" },
  { id: "analytics", title: "Analytics", description: "Track performance and optimize your content strategy.", icon: "📊" },
  { id: "complete", title: "You're All Set!", description: "Start creating amazing content with AI. We're here to help.", icon: "🎉" },
];

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  start: () => void;
  next: () => void;
  previous: () => void;
  skip: () => void;
  goToStep: (index: number) => void;
  complete: () => void;
}

const OnboardingContext = React.createContext<OnboardingContextType>({
  isActive: false, currentStep: 0, steps: DEFAULT_STEPS,
  start: () => {}, next: () => {}, previous: () => {}, skip: () => {}, goToStep: () => {}, complete: () => {},
});

export function useOnboarding() { return React.useContext(OnboardingContext); }

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completed, setCompleted] = React.useState(false);

  React.useEffect(() => {
    const done = localStorage.getItem("tamer-onboarding-done");
    if (done) setCompleted(true);
  }, []);

  const start = () => { setIsActive(true); setCurrentStep(0); };
  const next = () => { if (currentStep < DEFAULT_STEPS.length - 1) setCurrentStep(s => s + 1); else complete(); };
  const previous = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const skip = () => { setIsActive(false); localStorage.setItem("tamer-onboarding-done", "true"); };
  const goToStep = (i: number) => { setCurrentStep(i); };
  const complete = () => { setIsActive(false); setCompleted(true); localStorage.setItem("tamer-onboarding-done", "true"); };

  const shouldShow = isActive && !completed;

  return (
    <OnboardingContext.Provider value={{ isActive: shouldShow, currentStep, steps: DEFAULT_STEPS, start, next, previous, skip, goToStep, complete }}>
      {children}
      {shouldShow && <OnboardingOverlay />}
    </OnboardingContext.Provider>
  );
}

function OnboardingOverlay() {
  const { currentStep, steps, next, previous, skip, goToStep } = useOnboarding();
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border bg-background p-8 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <button onClick={skip} className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Skip tour →
        </button>

        <div className="mb-6">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <button key={s.id} onClick={() => goToStep(i)} className={cn("h-2 w-2 rounded-full transition-all duration-300", i === currentStep ? "bg-primary scale-125" : i < currentStep ? "bg-primary/50" : "bg-muted")} />
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
          <p className="text-muted-foreground">{step.description}</p>
        </div>

        <div className="flex justify-between">
          <button onClick={previous} disabled={isFirst} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", isFirst ? "text-muted-foreground cursor-not-allowed" : "text-foreground hover:bg-muted")}>
            ← Back
          </button>
          <button onClick={next} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            {isLast ? "Get Started" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
