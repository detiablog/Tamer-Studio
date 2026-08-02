# UI-01 Onboarding

## Overview

This document details the onboarding system designed for Tamer Studio, covering the onboarding flow, product tour, first-time user detection, skip/resume functionality, and localStorage persistence.

---

## 1. Onboarding Flow

### 8-Step Onboarding Sequence

| Step | Title | Description | Target Route |
|------|-------|-------------|--------------|
| 1 | Welcome | Introduction to Tamer Studio | /dashboard |
| 2 | Workspace | Create or select a workspace | /workspace |
| 3 | Projects | Understand project management | /projects |
| 4 | AI Platform | Explore AI generation tools | /ai |
| 5 | Media Library | Learn media upload and management | /media |
| 6 | Production | Understand production pipeline | /production |
| 7 | Publishing | Learn publishing workflow | /publishing |
| 8 | Settings | Configure account preferences | /settings |

### Flow Diagram

```
First Login
    |
    v
[Welcome] --> [Workspace] --> [Projects] --> [AI Platform]
                                                     |
                                                     v
                                          [Media Library]
                                                     |
                                                     v
                                          [Production] --> [Publishing] --> [Settings]
                                                     |
                                                     v
                                              Dashboard
```

---

## 2. Product Tour

### Tour Overlay

The product tour uses a guided overlay system:

- Semi-transparent backdrop covering the entire viewport
- Highlighted target element with increased z-index
- Tooltip/popover with step description
- Navigation buttons: Previous, Next, Skip
- Progress indicator (step X of 8)

### Tour Steps Detail

**Step 1: Welcome**
- Title: "Welcome to Tamer Studio"
- Description: "Your AI-powered production platform"
- Highlight: Dashboard overview
- Action: "Get Started" button

**Step 2: Workspace**
- Title: "Your Workspace"
- Description: "Create a workspace to organize your projects"
- Highlight: Workspace switcher in topbar
- Action: "Create Workspace" or "Skip"

**Step 3: Projects**
- Title: "Project Management"
- Description: "Create and manage your creative projects"
- Highlight: Projects navigation item
- Action: "Explore Projects"

**Step 4: AI Platform**
- Title: "AI Generation"
- Description: "Generate images, videos, and content with AI"
- Highlight: AI Platform navigation
- Action: "Try AI"

**Step 5: Media Library**
- Title: "Media Library"
- Description: "Upload and organize your media assets"
- Highlight: Media navigation
- Action: "Upload Media"

**Step 6: Production**
- Title: "Production Pipeline"
- Description: "Track and manage your production jobs"
- Highlight: Production navigation
- Action: "View Pipeline"

**Step 7: Publishing**
- Title: "Publishing"
- Description: "Publish your content to multiple channels"
- Highlight: Publishing navigation
- Action: "Start Publishing"

**Step 8: Settings**
- Title: "Settings"
- Description: "Customize your experience"
- Highlight: Settings navigation
- Action: "Go to Settings"

---

## 3. First-Time User Detection

### Detection Strategy

```typescript
// localStorage key
const ONBOARDING_KEY = "tamer:onboarding:completed";
const ONBOARDING_STEP_KEY = "tamer:onboarding:step";

// Detection logic
function isFirstTimeUser(): boolean {
  try {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    return completed !== "true";
  } catch {
    return true; // Default to first-time on error
  }
}

function getOnboardingStep(): number {
  try {
    const step = localStorage.getItem(ONBOARDING_STEP_KEY);
    return step ? parseInt(step, 10) : 0;
  } catch {
    return 0;
  }
}
```

### Triggers

| Trigger | Behavior |
|---------|----------|
| First login | Start onboarding from step 1 |
| New workspace | Show workspace-specific tips |
| Return after skip | Resume from last completed step |
| Manual restart | Reset to step 1 |

### User State

```typescript
type OnboardingState = {
  isFirstTime: boolean;
  currentStep: number;
  completedSteps: number[];
  skipped: boolean;
  completedAt: string | null;
};
```

---

## 4. Skip/Resume Functionality

### Skip Onboarding

- "Skip Tour" button available at every step
- Sets `localStorage` key `tamer:onboarding:skipped:true`
- User can resume later from profile settings
- Skipped users see contextual tooltips instead

### Resume Onboarding

- Detected via localStorage check
- Resumes from last non-completed step
- Progress preserved across sessions
- "Resume Tour" option in settings

### Skip vs Complete

| Action | localStorage | Behavior |
|--------|-------------|----------|
| Skip | `skipped: true` | Can resume later |
| Complete | `completed: true` | Never shows again |
| Partial | `step: N` | Resumes from step N |

---

## 5. localStorage Persistence

### Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `tamer:onboarding:completed` | `"true"` | Onboarding completed |
| `tamer:onboarding:step` | `number` | Current step (0-7) |
| `tamer:onboarding:skipped` | `"true"` | User skipped tour |
| `tamer:onboarding:completedAt` | ISO string | Completion timestamp |
| `tamer:onboarding:completedSteps` | JSON array | Array of completed step indices |

### Persistence Pattern

```typescript
// Save progress
function saveOnboardingProgress(step: number) {
  try {
    localStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
    const completed = getCompletedSteps();
    if (!completed.includes(step)) {
      completed.push(step);
      localStorage.setItem(ONBOARDING_COMPLETED_STEPS_KEY, JSON.stringify(completed));
    }
  } catch (e) {
    // Silent fail - localStorage not available
  }
}

// Mark complete
function completeOnboarding() {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(ONBOARDING_COMPLETED_AT_KEY, new Date().toISOString());
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    localStorage.removeItem(ONBOARDING_SKIPPED_KEY);
  } catch (e) {
    // Silent fail
  }
}
```

### Error Handling

- All localStorage access wrapped in try/catch
- Silent failure on quota exceeded
- Silent failure on private browsing mode
- Graceful degradation: assume first-time user on error

---

## 6. Contextual Tooltips

### Post-Onboarding Guidance

After completing or skipping the onboarding, contextual tooltips appear:

| Context | Tooltip | Trigger |
|---------|---------|---------|
| Empty workspace | "Create your first workspace" | Page load with no workspaces |
| Empty projects | "Start a new project" | Projects page with 0 items |
| First AI generation | "Try AI generation" | AI page first visit |
| Unused features | "Explore this feature" | Feature not used after 7 days |

### Tooltip Pattern

```tsx
<Tooltip content="Create your first project to get started" side="bottom">
  <Button>New Project</Button>
</Tooltip>
```

---

## 7. Tour UI Components

### Tour Overlay

```tsx
<div className="fixed inset-0 z-[9999]">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
  
  {/* Highlighted element */}
  <div className="absolute z-[10000] ring-4 ring-primary/50 rounded-lg" />
  
  {/* Tooltip */}
  <div className="absolute z-[10001] bg-card rounded-xl shadow-2xl p-6 max-w-sm">
    <h3 className="text-lg font-semibold">{step.title}</h3>
    <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
    
    {/* Progress */}
    <div className="flex gap-1 mt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full", i <= currentStep ? "bg-primary" : "bg-muted")} />
      ))}
    </div>
    
    {/* Actions */}
    <div className="flex justify-between mt-4">
      <Button variant="ghost" onClick={skip}>Skip Tour</Button>
      <div className="flex gap-2">
        {currentStep > 0 && <Button variant="outline" onClick={prev}>Previous</Button>}
        <Button onClick={next}>{currentStep === 7 ? "Finish" : "Next"}</Button>
      </div>
    </div>
  </div>
</div>
```

### Progress Indicator

- 8 dots/bars representing each step
- Filled bars for completed steps
- Current step highlighted with primary color
- Smooth transition between steps

---

## 8. Integration Points

### AppShell Integration

```tsx
// In AppShell.tsx
React.useEffect(() => {
  if (isFirstTimeUser() && !isOnboardingActive) {
    startOnboarding();
  }
}, []);
```

### Dashboard Integration

```tsx
// In DashboardHero.tsx
{isFirstTime && (
  <div className="mb-6">
    <Alert>
      <AlertTitle>Welcome to Tamer Studio!</AlertTitle>
      <AlertDescription>
        Take a quick tour to get started.
        <Button variant="link" onClick={startTour}>Start Tour</Button>
      </AlertDescription>
    </Alert>
  </div>
)}
```

### Settings Integration

```tsx
// In Settings page
<Button variant="outline" onClick={restartOnboarding}>
  Restart Product Tour
</Button>
```

---

## 9. Analytics Events

| Event | Properties |
|-------|-----------|
| `onboarding_started` | `{ step: 0, userId }` |
| `onboarding_step_completed` | `{ step, duration }` |
| `onboarding_step_skipped` | `{ step, fromStep }` |
| `onboarding_completed` | `{ totalDuration, stepsCompleted }` |
| `onboarding_skipped` | `{ lastStep, totalDuration }` |
| `onboarding_resumed` | `{ fromStep }` |

---

## 10. Future Enhancements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Interactive tutorials | High | Click-through guided actions |
| Video walkthroughs | Medium | Embedded video for complex features |
| Role-based tours | Medium | Different tours for admin vs user |
| Feature announcements | Low | New feature highlights post-onboarding |
| A/B testing | Low | Test different onboarding flows |
| Completion rewards | Low | Badge or credit for completing tour |
