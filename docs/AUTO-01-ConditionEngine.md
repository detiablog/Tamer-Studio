# AUTO-01: Condition Engine

## Overview

The Condition Engine evaluates whether an automation rule's actions should execute based on the current context. It supports nested condition groups with logical operators (AND, OR) and provides 8 comparison operators for field evaluation.

## Condition Operators

| Operator | Symbol | Description | Type Support |
|---|---|---|---|
| `equals` | `===` | Exact equality | All types |
| `not_equals` | `!==` | Inequality | All types |
| `contains` | `includes` | String contains substring | String |
| `not_contains` | `!includes` | String does not contain substring | String |
| `greater_than` | `>` | Numeric greater than | Number |
| `less_than` | `<` | Numeric less than | Number |
| `in` | `includes` | Value exists in array | Array |
| `not_in` | `!includes` | Value does not exist in array | Array |

## Field Evaluation

Fields are accessed using dot-notation paths against the context object:

```typescript
// Context object
const context = {
  data: {
    project: {
      type: "video",
      credits: 150,
      tags: ["marketing", "social"]
    }
  }
};

// Field path
"data.project.type"  // Evaluates to "video"
"data.project.credits" // Evaluates to 150
```

The `getNestedValue()` method splits the path by `.` and traverses the object hierarchy. If any part of the path is undefined, the field value is `undefined`.

### Type Coercion

- `contains` / `not_contains`: Both field value and condition value are converted to strings via `String()`
- `greater_than` / `less_than`: Both values are converted to numbers via `Number()`
- `in` / `not_in`: The condition value must be an array; the field value is checked against it
- `equals` / `not_equals`: Strict equality (`===` / `!==`) with no type coercion

## Logical Operators

### AND Operator

All conditions must be satisfied:

```typescript
[
  { field: "status", operator: "equals", value: "active" },
  { field: "credits", operator: "greater_than", value: 100 }
]
// Result: true only if BOTH conditions are true
```

### OR Operator

At least one condition must be satisfied:

```typescript
[
  { field: "status", operator: "equals", value: "urgent", logicalOperator: "OR" },
  { field: "priority", operator: "equals", value: "high" }
]
// Result: true if EITHER condition is true
```

### Default Behavior

- If `logicalOperator` is not specified, defaults to `AND`
- The first condition has no logical operator (it initializes the result)
- Each subsequent condition uses the previous condition's `logicalOperator`

## Nested Groups

Conditions can be nested to create complex evaluation logic:

```typescript
[
  {
    field: "data.status",
    operator: "equals",
    value: "completed",
    logicalOperator: "AND",
    group: [
      {
        field: "data.type",
        operator: "equals",
        value: "video",
        logicalOperator: "OR"
      },
      {
        field: "data.type",
        operator: "equals",
        value: "image"
      }
    ]
  }
]
```

Evaluation:
1. Evaluate the group: `type === "video" OR type === "image"` (boolean result)
2. Combine with outer condition: `status === "completed" AND groupResult`

### Recursive Evaluation

Groups are evaluated recursively via `evaluateConditions()`:

```typescript
async evaluateConditions(conditions: Condition[], context: Record<string, unknown>): Promise<boolean> {
  // Empty conditions always pass
  if (!conditions || conditions.length === 0) return true;

  let result = true;
  let currentLogicalOp = "AND";

  for (const condition of conditions) {
    let conditionResult = false;

    if (condition.group && condition.group.length > 0) {
      // Recursively evaluate nested group
      conditionResult = await this.evaluateConditions(condition.group, context);
    } else {
      // Evaluate single condition
      const fieldValue = this.getNestedValue(context, condition.field);
      conditionResult = this.evaluateSingleCondition(fieldValue, condition.operator, condition.value);
    }

    // Combine with accumulated result
    if (currentLogicalOp === "AND") {
      result = result && conditionResult;
    } else {
      result = result || conditionResult;
    }

    currentLogicalOp = condition.logicalOperator || "AND";
  }

  return result;
}
```

## Context-Based Evaluation

The context object is the data source for condition evaluation. It typically contains:

```typescript
{
  // Event data
  event: {
    type: "image_generated",
    source: "image-ai",
    entityId: "proj_123"
  },
  // Rule data
  rule: {
    id: "arule_456",
    name: "Auto-publish images"
  },
  // Module-specific data
  data: {
    project: { type: "image", status: "completed" },
    credits: { used: 50, remaining: 500 },
    publishing: { platform: "instagram", scheduled: true }
  }
}
```

## Evaluation API

### Direct Evaluation

```typescript
const result = await ruleEngineService.evaluateConditions(conditions, context);
// Returns: boolean
```

### API Endpoint

```
POST /api/automation/evaluate
```

Request:
```json
{
  "conditions": [
    { "field": "data.status", "operator": "equals", "value": "completed" }
  ],
  "context": {
    "data": { "status": "completed" }
  }
}
```

Response:
```json
{
  "success": true,
  "data": { "result": true }
}
```

## Edge Cases

| Scenario | Behavior |
|---|---|
| Empty conditions array | Returns `true` (all rules pass) |
| Empty nested group | Returns `true` |
| Undefined field value | Comparison depends on operator (e.g., `undefined === undefined` is `true`) |
| Non-numeric value with `greater_than` | `NaN > number` is always `false` |
| Non-string value with `contains` | Converted to string first |
| Empty `in` array | `value in []` is always `false` |
