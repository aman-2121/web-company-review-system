# Fix Critical Authentication Flow Bugs

## Tasks to Complete

### 1. Password Recovery Broken
- [ ] Update ForgotPassword.tsx: Change API URL from `/auth/forgot-password` to `/api/users/forgot-password`
- [ ] Update ChangePassword.tsx: Change API URL from `/auth/change-password` to `/api/users/change-password`

### 2. Admin Management Issue
- [ ] Update AddAdmin.tsx: Change API URL from `/api/admin/add-admin` to `/api/users/admin/add-admin`
- [ ] Add functionality to fetch and display list of existing admins in AddAdmin.tsx

### 3. Social Authentication Failure
- [ ] Update Login.tsx: Change Google auth URL from `/api/auth/google` to `/api/users/google`
