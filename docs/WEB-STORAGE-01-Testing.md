# WEB-STORAGE-01 — Testing Checklist

## Upload
- [ ] Upload single file
- [ ] File stored in storage
- [ ] File record created in DB
- [ ] Quota updated
- [ ] MIME type validated

## Download
- [ ] Download file returns buffer
- [ ] Download URL generated

## Quota
- [ ] Quota check before upload
- [ ] Upload blocked when quota exceeded
- [ ] Quota displayed correctly
- [ ] Usage updates on upload/delete

## Folders
- [ ] Create folder
- [ ] List folders
- [ ] Delete folder
- [ ] File assigned to folder

## Delete
- [ ] Soft delete works
- [ ] Restore works
- [ ] Permanent delete works
- [ ] Quota updated on delete

## Admin
- [ ] Provider health shows
- [ ] Total usage across users
- [ ] Quota management works
- [ ] Cleanup jobs display

## Build
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] No runtime errors
