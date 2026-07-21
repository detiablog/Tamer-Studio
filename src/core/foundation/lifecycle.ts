export type LifecyclePhase = "bootstrap" | "configure" | "initialize" | "ready" | "shutdown";

export type LifecycleHook = (phase: LifecyclePhase) => void | Promise<void>;

export class ApplicationLifecycle {
  private static instance: ApplicationLifecycle;
  private hooks: LifecycleHook[] = [];
  private currentPhase: LifecyclePhase = "bootstrap";

  private constructor() {}

  static getInstance(): ApplicationLifecycle {
    if (!ApplicationLifecycle.instance) {
      ApplicationLifecycle.instance = new ApplicationLifecycle();
    }
    return ApplicationLifecycle.instance;
  }

  addHook(hook: LifecycleHook): void {
    this.hooks.push(hook);
  }

  async transition(phase: LifecyclePhase): Promise<void> {
    this.currentPhase = phase;
    for (const hook of this.hooks) {
      await hook(phase);
    }
  }

  getCurrentPhase(): LifecyclePhase {
    return this.currentPhase;
  }
}

export const lifecycle = ApplicationLifecycle.getInstance();
