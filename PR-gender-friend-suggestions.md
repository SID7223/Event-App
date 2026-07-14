# PR: Gender-Based Friend Suggestions + Google UserInfo Gender Fetch

## Summary
**17 files changed**

Adds gender collection (signup + profile edit), fetches gender from Google
UserInfo during OAuth login, adds the missing `/friends/suggestions` and
`/friends/search` endpoints with same-city + opposite-gender filtering, and
displays gender on profile/friend suggestion cards.

---

## Motivation

Friend suggestions didn't exist on the backend (frontend called endpoints that
returned 404). Gender data is needed to show relevant opposite-gender
suggestions from the same city. Google OAuth already used authorization code
flow (PKCE) but only sent the `idToken` — the `accessToken` was available but
not forwarded, so the backend couldn't call the UserInfo endpoint.

---

## File-by-File Breakdown

### 1. `migrations/0013_add_gender_column.sql` (NEW)
```sql
ALTER TABLE users ADD COLUMN gender TEXT;
```
Nullable `gender` column — no breaking changes.

**To run:**
```bash
# Remote
wrangler d1 execute chillingz-db --file=migrations/0013_add_gender_column.sql --remote

# Local dev
wrangler d1 execute chillingz-db --file=migrations/0013_add_gender_column.sql
```

---

### 2. `workers/auth-api/src/index.ts`
- Added `GOOGLE_CLIENT_SECRET` to `Env` interface
- Added `gender` to `UserRow` interface
- Added `GoogleUserInfo` interface + `getGoogleUserInfo(accessToken)`
  — calls `https://www.googleapis.com/oauth2/v3/userinfo` to fetch `gender`
- **`handleGoogleLogin()`**: Now accepts `{ idToken, accessToken }` (was just
  `{ idToken }`). Calls `getGoogleUserInfo()` with the access token to fetch
  gender. Stores gender on INSERT (new users) and fills it on existing users
  only if their gender was null. Returns `gender` in the JSON response body.
- **`handleGetMe()`**: Returns `gender` in user response.
- Both queries now `SELECT gender` from `users`.

---

### 3. `workers/api/src/routes/social.ts`

**`GET /friends`** — Now also returns `city` and `gender` fields per friend.

**`GET /friends/suggestions` (NEW)** — Same-city + opposite-gender suggestions:
1. Fetches current user's `city` and `gender`
2. Returns empty if user has no city set
3. Excludes existing friends and self
4. Filters by: same city AND (opposite gender OR unknown gender)
5. Orders: known gender first
6. Returns city + gender on each suggestion

**`GET /friends/search` (NEW)** — Searches users by name/email, excludes self,
returns city + gender.

---

### 4. `workers/api/src/routes/users.ts`
- Added `gender` to `UserProfileRow` interface
- **`GET /users/me`**: Returns `gender` in response
- **`PUT /users/me`**: Accepts `gender` in Zod validation, adds it to the
  dynamic UPDATE builder, returns it in response

---

### 5. `workers/api/src/schemas/user.ts`
- Added `gender: z.enum(['male', 'female', 'other']).optional()` to
  `updateProfileSchema`

---

### 6. `src/types/index.ts`
- Added `gender?: 'male' | 'female' | 'other' | null` to `User` interface
- Added `city?: string` and `gender?: ...` to `Friend` interface

---

### 7. `src/hooks/useGoogleAuth.ts`
- Now extracts `{ idToken, accessToken }` from `result.params` (was just
  `{ idToken }`)
- Sends `{ idToken, accessToken }` to the backend so it can call Google
  UserInfo

---

### 8. `src/services/api.ts`
- **`signup()`**: Added optional `gender` to the input type
- **`updateProfile()`**: Added optional `gender` to the input type

---

### 9. `src/store/index.ts`
- **`loginWithToken()`**: Maps `gender` from userData into user object
- **`loginWithTokens()`**: Maps `gender` from userData into user object

---

### 10. `src/screens/auth/SignupScreen.tsx`
- Added `gender` state
- Added gender selector (3 chips: ♂ Male, ♀ Female, ⚧ Other) after phone input
- Passes `gender` to `apiSignup()`
- Added styles: `fieldGroup`, `fieldLabel`, `genderRow`, `genderChip*`

---

### 11. `src/screens/main/ProfileScreen.tsx`
- Added gender display row in the menu card (♂/♀/⚧ icon + "Gender: Male / Set
  gender")
- Added `genderIcon` style

---

### 12. `src/screens/events/EditProfileScreen.tsx`
- Added `gender` state (initialized from `user?.gender`)
- Added gender selector after city input
- Included `gender` in `updatedUser` on save
- Added styles: `genderRow`, `genderChip*`

---

### 13. `src/screens/social/FriendsScreen.tsx`
- **Suggestion cards**: Shows city below handle and gender icon (♂/♀/⚧)
- **Friend list rows**: Shows city below handle
- Added `suggestedGender` style

---

## Deployment Steps

### 1. Apply the migration
```bash
cd E:\EVENT\APP\Event-App
npx wrangler d1 execute chillingz-db --file=migrations/0013_add_gender_column.sql --remote
```

### 2. Set `GOOGLE_CLIENT_SECRET` (if not already set)
```bash
cd workers/auth-api
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

### 3. Deploy workers
```bash
# Auth API (handles Google OAuth)
cd workers/auth-api && npx wrangler deploy

# Main API (handles users, friends, suggestions)
cd workers/api && npx wrangler deploy
```

### 4. Rebuild & deploy the frontend
```bash
npx eas build --platform all  # or expo publish
```

---

## Relevant Files

| File | What changed |
|------|-------------|
| `migrations/0013_add_gender_column.sql` | New migration: add gender column |
| `workers/auth-api/src/index.ts` | Google UserInfo gender fetch, gender in response |
| `workers/api/src/routes/social.ts` | Friend suggestions + search + gender in responses |
| `workers/api/src/routes/users.ts` | Profile accepts/returns gender |
| `workers/api/src/schemas/user.ts` | `gender` in updateProfileSchema |
| `src/types/index.ts` | `gender` on User and Friend interfaces |
| `src/hooks/useGoogleAuth.ts` | Sends accessToken for UserInfo |
| `src/services/api.ts` | `signup()` and `updateProfile()` gender param |
| `src/store/index.ts` | Maps gender on login |
| `src/screens/auth/SignupScreen.tsx` | Gender selector |
| `src/screens/main/ProfileScreen.tsx` | Gender display row |
| `src/screens/events/EditProfileScreen.tsx` | Gender selector |
| `src/screens/social/FriendsScreen.tsx` | Gender + city on suggestions/friends |
