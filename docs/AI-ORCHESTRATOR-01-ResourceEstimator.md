# AI Orchestrator - Resource Estimator

## Overview

The Resource Estimator provides pre-execution cost and duration analysis for pipelines. Before executing a pipeline, the system calculates estimated credits and time requirements based on the module types involved. This enables users to make informed decisions and allows the system to validate resource availability.

- Source: `src/core/orchestrator/resource-estimator.service.ts`
- API: `POST /api/orchestrator/estimate`

## Cost Estimation Model

The estimator uses a lookup-table model based on module type. Each module type has a fixed credit cost and estimated duration.

### Estimation Algorithm

```
function estimatePipeline(pipelineId):
    steps = DB.select(pipelineStep).where(pipelineId)
              .orderBy(order)

    totalCredits = 0
    totalDurationMs = 0

    for each step in steps:
        credits = creditEstimates[step.moduleType] || 2
        duration = durationEstimates[step.moduleType] || 10000
        totalCredits += credits
        totalDurationMs += duration

    return {
        totalCredits,
        totalDurationMs,
        stepCount: steps.length,
        steps: [...]  // per-step estimates
    }
```

## Module Cost Table

### Credit Costs

| Module Type           | Credits | Description                          |
|-----------------------|---------|--------------------------------------|
| `image_generation`    | 5       | Image generation and manipulation    |
| `video_generation`    | 25      | Video creation and editing           |
| `text_generation`     | 2       | Text content creation                |
| `audio_generation`    | 10      | Audio/speech synthesis               |
| `trend_analysis`      | 3       | Market trend data collection         |
| `content_optimization`| 4       | SEO and conversion optimization      |
| `publishing`          | 1       | Content distribution to platforms    |
| `data_collection`     | 2       | External data gathering              |
| `analytics`           | 2       | Performance metrics and reporting    |
| **Default**           | **2**   | Fallback for unknown module types    |

### Duration Estimates

| Module Type           | Duration (ms) | Duration (approx.) |
|-----------------------|---------------|---------------------|
| `image_generation`    | 30,000        | 30 seconds          |
| `video_generation`    | 120,000       | 2 minutes           |
| `text_generation`     | 10,000        | 10 seconds          |
| `audio_generation`    | 60,000        | 1 minute            |
| `trend_analysis`      | 15,000        | 15 seconds          |
| `content_optimization`| 20,000        | 20 seconds          |
| `publishing`          | 5,000         | 5 seconds           |
| `data_collection`     | 10,000        | 10 seconds          |
| `analytics`           | 8,000         | 8 seconds           |
| **Default**           | **10,000**    | **10 seconds**      |

### Cost Multipliers (Future)

The current model uses flat rates. Future enhancements may introduce multipliers based on:

- Content complexity (e.g., video resolution, image size)
- Model version (e.g., DALL-E 3 vs. SDXL)
- Batch size (e.g., generating 10 images at once)
- Time of day (peak vs. off-peak pricing)

## Warning System

The Resource Estimator integrates with the user's `creditWarningThreshold` setting:

```
If estimatedCredits > settings.creditWarningThreshold:
    Return warning in response
    Block execution until user confirms
```

### Warning Response

```json
{
  "data": {
    "totalCredits": 150,
    "totalDurationMs": 180000,
    "stepCount": 5,
    "warning": "Estimated credits (150) exceed your warning threshold (100)"
  }
}
```

## Pre-Execution Validation

Before creating an execution, the system validates:

1. **Pipeline exists**: Confirmed by `getPipeline()` call
2. **Steps exist**: Pipeline has at least one step
3. **Credit estimate calculated**: Resource estimation completes successfully
4. **User credit balance**: (Future) Verify user has sufficient credits

### Execution Creation with Estimation

```typescript
// In POST /api/orchestrator/[id]/execute
const estimate = await resourceEstimatorService.estimatePipeline(id);

const execution = await pipelineBuilderService.createExecution(userId, id, {
  triggerType: body.triggerType,
  input: body.input,
  estimatedCredits: estimate.totalCredits,
  estimatedDurationMs: estimate.totalDurationMs,
});
```

The estimate is stored on the execution record for later comparison with actual resource usage.

## Individual Module Methods

### Single Module Credit Estimate

```typescript
estimateModuleCredits(moduleType: string): number {
  return this.creditEstimates[moduleType] || 2;
}
```

### Single Module Duration Estimate

```typescript
estimateModuleDuration(moduleType: string): number {
  return this.durationEstimates[moduleType] || 10000;
}
```

These utility methods can be used for ad-hoc cost calculations outside of full pipeline estimation.
