# মেত্তা বহুমুখী সমবায় সমিতি - Mobile App

## Overview
A comprehensive cooperative society management mobile app built with Expo React Native. Features dual panels: Admin Control Panel and User Panel with role-based authentication.

## Architecture
- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: Express.js (port 5000) serving APIs and landing page
- **Data Storage**: AsyncStorage for local persistence
- **State Management**: React Context (DataProvider) for shared state
- **Font**: Noto Sans Bengali (Google Fonts)
- **Theme**: Emerald green with golden accent

## App Structure
```
app/
  index.tsx              - Login screen
  _layout.tsx            - Root layout with providers
  (user-tabs)/           - User panel tabs
    index.tsx            - User home (balance, notices, transactions)
    finance.tsx          - Financial details (shares, savings, loans, dividends)
    transactions.tsx     - Transaction history with filters
    more.tsx             - Profile, notices, events, support links
  (admin-tabs)/          - Admin panel tabs
    index.tsx            - Dashboard (stats, overview, recent transactions)
    members.tsx          - Member management (search, activate/deactivate)
    finance.tsx          - Financial management (loan approval, transactions)
    more.tsx             - Notices, events, settings links
  loan-apply.tsx         - Loan application form
  add-member.tsx         - Add new member form
  member-detail.tsx      - Member detail view
  notices.tsx            - Notices list
  events.tsx             - Events & meetings list
  support.tsx            - Support & rules
  profile.tsx            - User profile
  add-notice.tsx         - Create notice (admin)
  add-event.tsx          - Create event (admin)
  admin-settings.tsx     - Interest rate & share settings
  add-transaction.tsx    - Record transactions (admin)
```

## Key Files
- `lib/data-context.tsx` - DataProvider with all CRUD operations
- `constants/colors.ts` - Theme colors

## Demo Accounts
- Admin: 01700000000 / admin123
- User: 01711111111 / 1234

## Recent Changes
- 2026-02-20: Initial build with full User and Admin panels
