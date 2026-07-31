# WEB-AI-01 — Testing Checklist

## Provider Abstraction
- [ ] Provider registry lists all adapters
- [ ] Provider router selects healthy provider
- [ ] Auto-fallback works when primary is offline
- [ ] Health tracking records success/failure

## Job Queue
- [ ] Submit job via API
- [ ] Job status tracking
- [ ] Cancel job
- [ ] Retry job

## Credits
- [ ] Credits validated before execution
- [ ] Credits reserved on submission
- [ ] Credits refunded on failure

## Prompts
- [ ] Create prompt template
- [ ] List templates
- [ ] Update template
- [ ] Delete template
- [ ] Use count increments

## History
- [ ] Generation recorded after completion
- [ ] History list with filters
- [ ] Stats computation

## Admin
- [ ] AI Runtime dashboard loads
- [ ] Provider status shows correctly
- [ ] Model list shows correctly
- [ ] Queue status shows

## Build
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] No runtime errors
