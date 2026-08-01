# AI-RUNTIME-02 — Model Registry

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Model Registry maintains comprehensive metadata for all known AI models across all providers. It serves as the authoritative source for model capabilities, cost profiles, performance benchmarks, and scoring data used by the routing engine.

---

## Model Metadata

Each model entry in `ai_model_registry` contains:

### Identity

| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Primary key (format: `mdl_{hash}`) |
| `providerId` | text | Associated provider identifier |
| `modelId` | varchar(200) | Provider-specific model ID |
| `displayName` | varchar(200) | Human-readable model name |
| `version` | varchar(50) | Model version string |

### Cost Profile

| Field | Type | Description |
|-------|------|-------------|
| `costPer1kInput` | real | Cost per 1,000 input tokens (USD) |
| `costPer1kOutput` | real | Cost per 1,000 output tokens (USD) |

### Performance

| Field | Type | Description |
|-------|------|-------------|
| `avgLatencyMs` | integer | Average response latency in milliseconds |
| `contextWindow` | integer | Maximum context window in tokens |
| `maxOutput` | integer | Maximum output tokens per request |

### Capability Flags

| Field | Type | Description |
|-------|------|-------------|
| `capability` | varchar(100) | Primary capability category |
| `supportsStreaming` | boolean | Supports streaming responses |
| `supportsVision` | boolean | Supports vision/image understanding |
| `supportsJson` | boolean | Supports JSON mode output |
| `supportsToolCalling` | boolean | Supports function/tool calling |
| `supportsImageInput` | boolean | Accepts image input |
| `supportsVideo` | boolean | Supports video input |
| `supportsAudio` | boolean | Supports audio input |
| `supportsBatch` | boolean | Supports batch processing |
| `supportsStructuredOutput` | boolean | Supports structured output schemas |

### Scoring

| Field | Type | Description |
|-------|------|-------------|
| `qualityScore` | integer | Quality rating (0-100, default 50) |
| `speedScore` | integer | Speed rating (0-100, default 50) |
| `reliabilityScore` | integer | Reliability rating (0-100, default 50) |

### Status

| Field | Type | Description |
|-------|------|-------------|
| `status` | varchar(50) | Model status (active, inactive, deprecated) |
| `deprecationStatus` | varchar(50) | Deprecation status |
| `replacementModel` | varchar(200) | Recommended replacement model |

---

## Capability Registry

The `ai_capability_registry` defines 13 supported AI capabilities:

| Capability | Display Name | Description |
|------------|-------------|-------------|
| `chat` | Chat Completion | Conversational AI text generation |
| `image_generation` | Image Generation | Create images from text prompts |
| `video_generation` | Video Generation | Create video content |
| `embeddings` | Text Embeddings | Generate vector embeddings |
| `code_generation` | Code Generation | Generate or review code |
| `text_to_speech` | Text to Speech | Convert text to audio |
| `speech_to_text` | Speech to Text | Transcribe audio to text |
| `translation` | Translation | Translate between languages |
| `summarization` | Summarization | Condense text content |
| `analysis` | Text Analysis | Analyze and extract insights |
| `creative_writing` | Creative Writing | Generate creative content |
| `data_processing` | Data Processing | Process and transform data |
| `multimodal` | Multimodal | Multi-modal input/output |

Each capability has:
- `name`: Unique identifier
- `displayName`: Human-readable name
- `description`: Capability description
- `category`: Capability category
- `isEnabled`: Whether the capability is active

---

## Model Scoring

### Quality Score (0-100)

Measures output quality based on:
- Benchmark performance (MMLU, HumanEval, etc.)
- User feedback ratings
- Output coherence and accuracy
- Task completion rate

Default: 50 (midpoint for new/unrated models)

### Speed Score (0-100)

Measures response speed based on:
- Average latency measurements
- Time to first token (TTFT)
- Throughput (tokens per second)

Default: 50 (midpoint for new/unmeasured models)

### Reliability Score (0-100)

Measures operational reliability based on:
- Success rate over time
- Error frequency
- Consistency of response quality
- Uptime percentage

Default: 50 (midpoint for new/untracked models)

### Score Usage

The routing engine uses these scores as follows:

| Strategy | Quality Weight | Speed Weight | Cost Weight |
|----------|---------------|-------------|-------------|
| balanced | 33% | 34% | 33% |
| fastest | 10% | 80% | 10% |
| cheapest | 10% | 10% | 80% |
| highest_quality | 80% | 10% | 10% |

---

## Deprecation Management

Models can be marked as deprecated with:

| Field | Purpose |
|-------|---------|
| `status` | Set to `deprecated` to exclude from routing |
| `deprecationStatus` | Status string (e.g., "deprecated", "sunset") |
| `replacementModel` | Model ID of the recommended replacement |

When a model is deprecated:
- It is excluded from new routing decisions
- Existing in-flight requests complete normally
- Users see a deprecation notice in the model list
- The routing engine automatically redirects to the replacement model

---

## Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `ai_model_registry_provider_model_unique` | (providerId, modelId) | Unique constraint per provider |
| `ai_model_registry_provider_idx` | (providerId) | Provider lookup |
| `ai_model_registry_capability_idx` | (capability) | Capability filtering |
| `ai_model_registry_status_idx` | (status) | Status filtering |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/models` | GET | List all models with metadata |
| `/api/ai-gateway/models/[id]` | GET | Get model details |
| `/api/ai-gateway/models/[id]` | PUT | Update model metadata |
| `/api/ai-gateway/models/[id]/scores` | GET | Get model quality scores |
| `/api/ai-gateway/capabilities` | GET | List all capabilities |
| `/api/ai-gateway/capabilities/[id]` | GET | Get capability details |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/lib/db/schema/ai-gateway.ts` | aiModelRegistry, aiCapabilityRegistry tables |
| `src/core/ai/provider-registry.ts` | Model listing and cost estimation |
| `src/app/api/ai-gateway/models/route.ts` | Models API endpoint |
| `src/app/api/ai-gateway/capabilities/route.ts` | Capabilities API endpoint |
