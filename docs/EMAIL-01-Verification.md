# EMAIL-01: Verification Checklist

## Settings Page
- [ ] SMTP settings load from database
- [ ] SMTP settings save to database
- [ ] SMTP password encrypted before storage
- [ ] SMTP password masked in API response
- [ ] Enable/Disable SMTP toggle works
- [ ] Enable/Disable Email Queue toggle works
- [ ] All limit fields save correctly

## SMTP Test
- [ ] Test SMTP connection works
- [ ] Returns detailed results (host, port, encryption, response time)
- [ ] Error types detected correctly
- [ ] Connection success/failure reflected in health check

## Send Test Email
- [ ] Sends real email via configured SMTP
- [ ] Returns delivery status
- [ ] Shows sending state
- [ ] Error handling for failed sends

## Email Queue
- [ ] Queue items created in database
- [ ] Worker processes queue items
- [ ] Status transitions: queued → processing → sent/failed
- [ ] Retry mechanism works for failed items

## Email Templates
- [ ] 7 template types available
- [ ] Template preview renders with sample values
- [ ] Templates editable
- [ ] Template toggle (active/inactive) works

## Email Logs
- [ ] Logs display correctly
- [ ] Search by recipient works
- [ ] Status filter works
- [ ] Type filter works
- [ ] Date range filter works
- [ ] Retry button for failed emails works
- [ ] CSV export works

## Health Check
- [ ] SMTP enabled status displays
- [ ] Connection status displays
- [ ] Last success/failure times display

## Localization
- [ ] All English labels present
- [ ] All Indonesian translations present
- [ ] No broken translation keys

## Security
- [ ] SMTP password never exposed in API
- [ ] SMTP password never logged
- [ ] Admin authentication required for all endpoints
- [ ] Input validation on all endpoints
