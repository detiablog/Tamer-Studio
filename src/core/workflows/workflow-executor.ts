import type { Event } from "@/core/events/event";
import { eventBus } from "@/core/events/event-bus";
import { logger } from "@/core/logger/logger";
import type {
  StepId,
  StepResult,
  WorkflowContext,
  WorkflowDefinition,
  WorkflowResult,
  WorkflowStep,
} from "./workflow.types";

interface PendingExecution {
  definition: WorkflowDefinition;
  variables: Record<string, unknown>;
  context: WorkflowContext;
  state: Map<StepId, StepState>;
  paused?: Promise<void>;
  resolvePause?: () => void;
  cancelled: boolean;
  resolve: (result: WorkflowResult) => void;
  reject: (error: Error) => void;
}

interface StepState {
  result: StepResult;
  attempts: number;
  timeoutHandle?: ReturnType<typeof setTimeout>;
  retryHandle?: ReturnType<typeof setTimeout>;
}

const EVENT_TYPES = {
  STEP_STARTED: "workflow.step.started",
  STEP_COMPLETED: "workflow.step.completed",
  STEP_FAILED: "workflow.step.failed",
  COMPLETED: "workflow.completed",
  FAILED: "workflow.failed",
} as const;

export class WorkflowExecutor {
  private executions: Map<string, PendingExecution> = new Map();
  private handlerRegistry: Map<
    string,
    (step: WorkflowStep, context: WorkflowContext, variables: Record<string, unknown>) => Promise<Record<string, unknown>>
  > = new Map();

  registerHandler(
    name: string,
    handler: (step: WorkflowStep, context: WorkflowContext, variables: Record<string, unknown>) => Promise<Record<string, unknown>>
  ): void {
    this.handlerRegistry.set(name, handler);
  }

  async execute(definition: WorkflowDefinition, variables: Record<string, unknown>): Promise<WorkflowResult> {
    const executionId = crypto.randomUUID();
    const context: WorkflowContext = { variables, artifacts: new Map() };
    const state = new Map<StepId, StepState>();

    for (const step of definition.steps) {
      state.set(step.id, {
        result: {
          stepId: step.id,
          status: "pending",
          durationMs: 0,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        attempts: 0,
      });
    }

    const execution: PendingExecution = {
      definition,
      variables,
      context,
      state,
      cancelled: false,
      resolve: () => {},
      reject: () => {},
    };

    const result = await new Promise<WorkflowResult>((resolve, reject) => {
      execution.resolve = resolve;
      execution.reject = reject;
      this.run(executionId, execution).catch((err) => {
        reject(err instanceof Error ? err : new Error(String(err)));
      });
    });

    return result;
  }

  private async run(executionId: string, execution: PendingExecution): Promise<WorkflowResult> {
    this.executions.set(executionId, execution);

    const result: WorkflowResult = {
      executionId,
      workflowId: execution.definition.id,
      status: "running",
      steps: new Map(),
      context: execution.context,
      startedAt: new Date().toISOString(),
    };

    const finalize = async () => {
      for (const step of execution.definition.steps) {
        const stepState = execution.state.get(step.id);
        if (stepState) {
          result.steps.set(step.id, stepState.result);
        }
      }

      if (result.status === "running") {
        result.status = "completed";
      }
      result.completedAt = new Date().toISOString();
      execution.resolve(result);
      this.executions.delete(executionId);
    };

    const completedSteps = new Set<StepId>();
    const runningSteps = new Set<StepId>();

    try {
      while (completedSteps.size < execution.definition.steps.length) {
        if (execution.cancelled) {
          result.status = "cancelled";
          await finalize();
          return result;
        }

        if (execution.paused) {
          await execution.paused;
          execution.paused = undefined;
          execution.resolvePause = undefined;
        }

        let nextStep: WorkflowStep | undefined;
        for (const step of execution.definition.steps) {
          if (completedSteps.has(step.id) || runningSteps.has(step.id)) continue;
          const depsMet = step.dependsOn.every((depId) => completedSteps.has(depId));
          if (depsMet) {
            nextStep = step;
            break;
          }
        }

        if (!nextStep) {
          break;
        }

        runningSteps.add(nextStep.id);
        await this.runStep(executionId, nextStep, execution);
        runningSteps.delete(nextStep.id);
        completedSteps.add(nextStep.id);
      }

      result.status = "completed";
      this.emitEvent(executionId, EVENT_TYPES.COMPLETED);
      await finalize();
      return result;
    } catch (error) {
      result.status = "failed";
      result.error = error instanceof Error ? error.message : "Unknown error";
      result.completedAt = new Date().toISOString();
      this.emitEvent(executionId, EVENT_TYPES.FAILED, undefined, { error: result.error });
      await finalize();
      return result;
    }
  }

  private async runStep(executionId: string, step: WorkflowStep, execution: PendingExecution): Promise<void> {
    const stepState = execution.state.get(step.id)!;
    const maxAttempts = step.retryPolicy?.maxAttempts ?? 1;

    while (stepState.attempts < maxAttempts) {
      stepState.attempts += 1;
      stepState.result.status = "running";
      stepState.result.startedAt = new Date().toISOString();
      const startedAt = Date.now();

      this.emitEvent(executionId, EVENT_TYPES.STEP_STARTED, step.id, { attempt: stepState.attempts });

      try {
        const handler = this.handlerRegistry.get(step.handler);
        if (!handler) {
          throw new Error(`Handler not found: ${step.handler}`);
        }

        const taskPromise = handler(step, execution.context, execution.variables);

        const output = await (step.timeoutMs && step.timeoutMs > 0
          ? Promise.race([
              taskPromise,
              new Promise<never>((_, reject) => {
                const handle = setTimeout(() => reject(new Error("Step timeout")), step.timeoutMs);
                stepState.timeoutHandle = handle;
              }),
            ])
          : taskPromise);

        if (stepState.timeoutHandle) {
          clearTimeout(stepState.timeoutHandle);
          stepState.timeoutHandle = undefined;
        }

        stepState.result.status = "completed";
        stepState.result.output = output;
        stepState.result.error = undefined;
        stepState.result.completedAt = new Date().toISOString();
        stepState.result.durationMs = Date.now() - startedAt;

        this.emitEvent(executionId, EVENT_TYPES.STEP_COMPLETED, step.id, output);
        return;
      } catch (error) {
        if (stepState.timeoutHandle) {
          clearTimeout(stepState.timeoutHandle);
          stepState.timeoutHandle = undefined;
        }

        stepState.result.status = "failed";
        stepState.result.error = error instanceof Error ? error.message : "Unknown error";
        stepState.result.completedAt = new Date().toISOString();
        stepState.result.durationMs = Date.now() - startedAt;

        this.emitEvent(executionId, EVENT_TYPES.STEP_FAILED, step.id, { error: stepState.result.error, attempt: stepState.attempts });

        if (stepState.attempts < maxAttempts) {
          await new Promise((resolve) => {
            const handle = setTimeout(resolve, step.retryPolicy?.backoffMs ?? 1000);
            stepState.retryHandle = handle;
          });
        }
      }
    }

    const errorMessage = stepState.result.error ?? "Unknown error";
    throw new Error(`Step ${step.id} failed: ${errorMessage}`);
  }

  pause(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      return Promise.resolve();
    }

    execution.paused = new Promise<void>((resolve) => {
      execution.resolvePause = resolve;
    });

    logger.info("Workflow paused", { executionId });
    return execution.paused;
  }

  resume(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.resolvePause) {
      execution.resolvePause();
      logger.info("Workflow resumed", { executionId });
    }
    return Promise.resolve();
  }

  cancel(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.cancelled = true;
      if (execution.paused) {
        execution.resolvePause?.();
      }
      logger.info("Workflow cancelled", { executionId });
    }
    return Promise.resolve();
  }

  private emitEvent(executionId: string, type: string, stepId?: string, payload: Record<string, unknown> = {}): void {
    const event: Event = {
      id: crypto.randomUUID(),
      type: type as Event["type"],
      source: "workflow",
      payload: { executionId, stepId, ...payload },
      timestamp: new Date(),
    };
    eventBus.emit(event);
  }
}