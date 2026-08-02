# SEC-01: AI Runtime Security

## Scope

Security controls for AI provider integrations, prompt injection prevention, and output safety.

## Architecture

### Threat Vectors

- **Prompt Injection**: Malicious user input attempting to override system prompts
- **Data Exfiltration**: Using AI to extract training data or system configuration
- **Abuse**: Generating harmful, illegal, or policy-violating content
- **Cost Abuse**: Excessive API calls draining credits

### Mitigations

- Input sanitization before AI provider calls
- System prompt isolation with delimiter tokens
- Output content moderation via safety policies
- Per-user credit limits and budget enforcement
- Request logging for forensic analysis
- Provider key isolation per workspace

### Safety Pipeline

1. User input sanitized (control characters, delimiter injection)
2. System prompt prepended with isolation markers
3. AI provider called with workspace-scoped credentials
4. Output screened against content safety policies
5. Response logged with full context for audit
6. Credits deducted from workspace budget

## Configuration

```
AI_INPUT_SANITIZATION=true
AI_OUTPUT_MODERATION=true
AI_PROMPT_ISOLATION=true
AI_MAX_INPUT_LENGTH=32000
AI_CREDIT_LIMIT_DAILY=10000
AI_REQUEST_LOGGING=true
```

## Commands

```bash
# Audit AI runtime security
pnpm security:ai-runtime-audit

# Test prompt injection defenses
pnpm security:prompt-injection-test

# Validate output moderation
pnpm security:output-moderation-test

# Check credit enforcement
pnpm security:credit-enforcement-check
```

## Verification

1. Confirm prompt injection attempts are blocked or sanitized
2. Test output moderation catches policy-violating content
3. Verify credit limits prevent excessive API usage
4. Validate provider keys are isolated per workspace
5. Confirm AI request logs contain full audit context