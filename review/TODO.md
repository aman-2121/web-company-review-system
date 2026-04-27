# TODO: Add Comment Notification & Report Notification

## Backend
- [x] 1. Create `review/server/src/notifications/notification.model.js`
- [x] 2. Create `review/server/src/notifications/notification.controller.js`
- [x] 3. Create `review/server/src/notifications/notification.routes.js`
- [x] 4. Update `review/server/src/models/index.js` (import Notification model + associations)
- [x] 5. Update `review/server/src/index.js` (add notification routes)
- [x] 6. Update `review/server/src/reviews/review.controller.js` (trigger notifications on reply & report)

## Frontend
- [x] 7. Update `review/client/src/components/Navbar.tsx` (notification bell + dropdown + polling)
- [x] 8. Update `review/client/src/context/AuthContext.tsx` (unreadCount state)

## Testing
- [x] 9. Run server and verify DB sync
- [x] 10. Test admin reply notification
- [x] 11. Test report notification

