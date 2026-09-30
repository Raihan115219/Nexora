# Phase 1 --- Web3 Compensation Platform

## Claude Code Implementation Specification

### Next.js + TypeScript + Tailwind CSS

## 1. Objective

Build Phase 1 of a production-ready, future-proof Web3 compensation
platform demo.

Required stack: - Next.js App Router - TypeScript - Tailwind CSS -
Lucide React or equivalent lightweight icon library - Recharts for
charts where useful - React Hook Form + Zod for forms where useful

Use mock/local data for the demo, but structure the application so mock
services can later be replaced by real APIs, database services,
authentication, wallet infrastructure and blockchain integrations
without rewriting the UI.

The six Phase 1 requirements are:

1.  User registration and authentication
2.  Wallet infrastructure for deposited funds and coin balances
3.  Package purchase flow for F1/F2/F3 founder tiers
4.  Referral and binary tree engine
5.  Direct referral counting logic
6.  Basic admin panel

Future limit-plan packages must be supported architecturally but do not
need full implementation in Phase 1.

------------------------------------------------------------------------

# 2. Visual Direction --- IMPORTANT

Use the attached reference image as the primary visual reference.

The UI must feel like a premium modern Web3/crypto financial dashboard,
not a generic SaaS/admin template.

Match the visual language closely:

-   Very dark green-black background
-   Slightly lighter dark green card surfaces
-   Thin low-contrast borders
-   Bright neon/lime green accents
-   Soft white primary text
-   Muted gray-green secondary text
-   Green positive values
-   Muted red negative values
-   Rounded cards
-   Compact spacing
-   Minimal shadows
-   Subtle glow only where appropriate
-   Clean outline icons
-   Thin green line charts
-   Strong financial-number hierarchy
-   Compact premium header and sidebar
-   Dense but breathable layout
-   No blue/purple SaaS theme
-   No bright white background
-   No excessive gradients
-   No excessive glassmorphism
-   No unnecessary animations

Suggested starting design tokens:

``` text
Background:
#06110C
#08150F

Surface:
#0B1812
#0D1D15
#10241A

Border:
#1A3024
#203A2A

Primary:
#39FF5A
#46FF5F

Soft Green:
#9BFFA8

Text:
#F2F7F3

Secondary:
#8B9A91

Muted:
#5E6D64

Negative:
#D85B62
```

Treat these as starting tokens and visually tune them against the
reference image.

Typography should closely match the reference's modern premium
sans-serif style. Prefer Inter; Geist Sans is acceptable if the project
already uses it.

Suggested hierarchy:

-   Page title: 28--32px / 600
-   Section title: 16--18px / 600
-   Large financial values: 28--40px / 600--700
-   Body: 14px
-   Secondary: 12--13px

Use a consistent 8px spacing system.

------------------------------------------------------------------------

# 3. Application Architecture

Use a scalable structure similar to:

``` text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── wallet/
│   │   ├── packages/
│   │   ├── referrals/
│   │   ├── binary-tree/
│   │   ├── team/
│   │   └── transactions/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── users/
│   │   ├── packages/
│   │   └── tree/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── wallet/
│   ├── packages/
│   ├── referrals/
│   ├── binary/
│   ├── admin/
│   ├── charts/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── wallet/
│   ├── packages/
│   ├── referrals/
│   ├── binary/
│   └── calculations/
├── data/
│   └── mock/
├── types/
└── config/
```

Keep business/domain logic outside React presentation components.

Do not create one giant dashboard component.

Do not hard-code business calculations inside JSX.

------------------------------------------------------------------------

# 4. Application Shell

Build a reusable authenticated dashboard shell.

Desktop:

``` text
┌─────────────────────────────────────────────────────────┐
│ Logo                    Search   Bell   Wallet   User   │
├──────────────┬──────────────────────────────────────────┤
│ Dashboard    │                                          │
│ Wallet       │              Main Content                │
│ Packages     │                                          │
│ Referrals    │                                          │
│ Binary Tree  │                                          │
│ Team         │                                          │
│ Transactions │                                          │
│              │                                          │
│ ───────────  │                                          │
│ Admin        │                                          │
│ Settings     │                                          │
│ Logout       │                                          │
└──────────────┴──────────────────────────────────────────┘
```

Mobile: - Sidebar becomes a drawer - Header remains compact - Cards
stack - Tables become responsive - Tree is horizontally
scrollable/zoomable - Do not simply shrink the desktop layout

------------------------------------------------------------------------

# 5. Authentication

Routes:

``` text
/login
/register
/forgot-password
```

Registration fields:

-   Full name
-   Email
-   Password
-   Confirm password
-   Referral code
-   Optional phone number

Example:

``` text
Create Account

Full Name
[________________]

Email
[________________]

Password
[________________]

Confirm Password
[________________]

Referral Code
[ABC123]

[ Create Account ]

Already have an account?
Sign in
```

Validation: - Required fields - Valid email - Password minimum length -
Matching passwords - Referral code validation

Phase 1 authentication is mocked.

Create an abstraction:

``` text
login()
register()
logout()
getCurrentUser()
```

It must be easy to replace later with Auth.js, custom JWT/session auth,
Supabase, Clerk, or a backend API.

Do not store plaintext passwords in a production-like structure.

------------------------------------------------------------------------

# 6. Dashboard

Route:

``` text
/dashboard
```

Make it visually close to the attached crypto dashboard.

Header: - Project logo - Search - Notifications - Wallet/address
indicator - User/avatar

Use a fictional brand name if no project name is provided.

KPI cards:

``` text
Total Balance
$12,450.50

Available Balance
$8,240.50

Total Earnings
$4,210.00

Active Package
F3 — $3,000
```

Also show: - Total Direct Referrals - Team Volume - Current Rank -
Staked Tokens

Add a premium green line chart: - 1D - 1W - 1M - 6M - 1Y

Use a dark chart area, very subtle grid and thin neon-green line. Do not
use default blue/purple chart colors.

Add: - My Assets - Recent Transactions - Referral summary -
Rank/progress summary

------------------------------------------------------------------------

# 7. Wallet Infrastructure

Route:

``` text
/dashboard/wallet
```

Wallet must support these conceptual balances:

-   USD balance
-   USDT balance
-   Platform Token
-   Earned Token
-   Deposited balance
-   Available balance
-   Locked balance

Suggested type:

``` ts
type WalletBalance = {
  asset: string
  symbol: string
  balance: number
  available: number
  locked: number
  usdValue: number
}
```

Wallet page should show: - Total portfolio value - Available balance -
Locked balance - Asset cards/table - Recent transactions

Mock assets: - USDT - Platform Token - Earned Token

------------------------------------------------------------------------

# 8. Transactions

Support mock transaction types:

``` text
Deposit
Package Purchase
Referral Reward
ROI Reward
Withdrawal
Token Credit
```

Each transaction:

``` ts
{
  id,
  type,
  asset,
  amount,
  status,
  date,
  description
}
```

Statuses:

``` text
Completed
Pending
Failed
```

Use: - Green = completed - Muted yellow/orange = pending - Muted red =
failed

------------------------------------------------------------------------

# 9. Founder Packages

Route:

``` text
/dashboard/packages
```

Initial tiers:

``` text
F3 — $3,000
F2 — $6,000
F1 — $9,000
```

Use premium package cards.

Example:

``` text
F3
Founder Tier

$3,000

Benefits
• Founder membership
• Pre-ICO eligibility
• Direct referral qualification
• Business participation

[Purchase Package]
```

Keep package data configurable:

``` ts
type Package = {
  id: string
  code: 'F1' | 'F2' | 'F3' | string
  name: string
  price: number
  currency: string
  category: 'founder' | 'limit'
  active: boolean
}
```

Do not scatter package prices throughout components.

------------------------------------------------------------------------

# 10. Package Purchase Flow

Create:

``` text
Select Package
      ↓
Review
      ↓
Confirm
      ↓
Success
```

Example:

``` text
Purchase F3

Package
F3 Founder Tier

Price
$3,000

Payment Asset
USDT

Available Balance
$8,240

Remaining Balance
$5,240

[Cancel] [Confirm Purchase]
```

On successful demo purchase: - Deduct mock wallet balance - Mark package
active - Create transaction - Update dashboard - Update package
eligibility data - Update mock state

Create a service:

``` text
purchasePackage(userId, packageId)
```

Do not perform the purchase calculation directly inside a component.

------------------------------------------------------------------------

# 11. Referral Engine

Users must support referral relationships.

Suggested type:

``` ts
type User = {
  id: string
  name: string
  email: string
  referralCode: string
  referredBy?: string
  leftChildId?: string
  rightChildId?: string
  directReferralCount: number
}
```

Core functions:

``` text
createReferralRelationship()
getDirectReferrals()
getReferralTree()
countDirectReferrals()
```

Important distinction:

``` text
Direct Referral Count
≠
Total Team Count
```

Both must be available.

Example:

``` text
User A
├── User B
├── User C
└── User D

Direct referrals = 3
```

------------------------------------------------------------------------

# 12. Referral Page

Route:

``` text
/dashboard/referrals
```

Show:

``` text
Your Referral Link

https://demo.com/register?ref=ABC123

[Copy]
```

Stats:

``` text
Direct Referrals
6

Active Directs
5

Total Team
42
```

Referral list: - Name - Status - Package - Joined date

Copy action must show a toast.

------------------------------------------------------------------------

# 13. Binary Tree Engine

The application needs a real data-driven left/right binary structure.

Example:

``` text
                    YOU
                  /                    User A   User B
               /  \                   User C User D  User E
```

Each user can have:

``` text
leftChildId
rightChildId
```

Core functions:

``` text
placeUser()
getBinaryTree()
getLeftVolume()
getRightVolume()
```

Phase 1 does not need full binary commission calculations.

But the data model must support future binary commissions.

Do not render the tree as a static image.

------------------------------------------------------------------------

# 14. Binary Tree UI

Routes:

``` text
/dashboard/binary-tree
/admin/tree
```

Node should display: - Avatar - Name - Package/rank - Active/inactive -
Direct count - Left/right position

Example:

``` text
┌───────────────┐
│    Avatar     │
│    John Doe   │
│    F3         │
│    ● Active   │
└───────────────┘
       /   ```

Use subtle green connector lines.

Features:
- Search user
- Open user tree
- View left branch
- View right branch
- Expand/collapse
- Horizontal scrolling on mobile

---

# 15. Admin Panel

Route:

```text
/admin
```

Admin overview cards:

``` text
Total Users
Active Users
Total Deposits
Active Packages
Total Team Volume
```

Admin navigation:

``` text
Overview
Users
Packages
Binary Tree
Transactions
```

Use mock role protection for Phase 1.

------------------------------------------------------------------------

# 16. Admin Users

Route:

``` text
/admin/users
```

Columns:

``` text
User
Email
Package
Directs
Team
Status
Joined
Actions
```

Initial action: - View

Keep future actions architecturally possible: - Suspend - Activate -
Edit - Reset password

------------------------------------------------------------------------

# 17. Admin Packages

Route:

``` text
/admin/packages
```

Show: - Package - Price - Status - Users - Created

Packages: - F1 - F2 - F3

Make package configuration data-driven.

------------------------------------------------------------------------

# 18. Admin Tree

Route:

``` text
/admin/tree
```

Admin can: - Search user - Open their tree - Inspect left branch -
Inspect right branch - View direct referrals - View total team

Use the same underlying referral/binary data as the user interface.

------------------------------------------------------------------------

# 19. Mock Data

Create believable mock data: - 1 admin - 1 current user - 10--20 users -
Multiple referral relationships - Left/right binary relationships -
Multiple package purchases - Wallet balances - Transactions

Do not use obvious placeholder names like "Test User 1".

The demo should look populated immediately.

------------------------------------------------------------------------

# 20. State Management

Phase 1 can use React Context, Zustand, or another lightweight solution.

State should conceptually include:

``` text
currentUser
users
wallets
packages
userPackages
transactions
referrals
binaryTree
```

If localStorage is used, isolate it behind a storage service.

Do not scatter localStorage calls through components.

------------------------------------------------------------------------

# 21. Domain Services

Create separate modules:

``` text
lib/auth/
lib/wallet/
lib/packages/
lib/referrals/
lib/binary/
```

Example functions:

``` ts
calculateDirectReferrals(userId)
getTeamMembers(userId)
getBinaryPosition(userId)
purchasePackage(userId, packageId)
getWalletBalance(userId)
createTransaction(...)
```

The UI calls these services.

The business logic should not live in JSX.

------------------------------------------------------------------------

# 22. Future-Proofing

Prepare architecture for future implementation of:

### Compensation

-   Direct commission
-   Level commission
-   Binary commission
-   Daily ROI
-   Limit plan
-   Rank salary
-   Staking rewards

### Wallet

-   Real deposits
-   Real withdrawals
-   Blockchain transactions
-   Token balances
-   Transaction verification

### Authentication

-   Real backend auth
-   JWT/session
-   Email verification
-   2FA
-   KYC

### Admin

-   User management
-   Package management
-   Commission configuration
-   Withdrawal approval
-   System configuration
-   Audit logs

Do not fully implement these in Phase 1.

Do not invent undocumented formulas.

------------------------------------------------------------------------

# 23. Compensation-Plan Boundary

The supplied blueprint contains rules for ROI, referrals, binary
commissions, levels, rank salary, staking and limit caps.

For Phase 1:

``` text
IMPLEMENT:
Registration
Authentication
Wallet
Founder packages
Referral relationship
Direct count
Binary tree
Admin

PREPARE ARCHITECTURE FOR:
ROI
Commissions
Ranks
Staking
Limit plans
```

If a compensation rule is ambiguous, represent it as configurable data
or a TODO. Never silently invent a financial calculation.

------------------------------------------------------------------------

# 24. Responsive Design

Support: - Mobile - Tablet - Desktop - Large desktop

Mobile requirements: - Drawer navigation - Compact header - Stacked KPI
cards - Responsive package cards - Responsive charts -
Horizontal/scrollable transaction tables - Usable binary tree

Do not simply scale down the desktop version.

------------------------------------------------------------------------

# 25. UX Details

Implement: - Toast notifications - Purchase confirmation modal - Loading
skeletons - Empty states - Error states - Validation messages -
Copy-to-clipboard feedback - Hover states - Active navigation states -
Keyboard-accessible buttons - Visible focus states

Animation: - 150--250ms - ease-out - subtle only

------------------------------------------------------------------------

# 26. Landing Page

Create:

``` text
/
```

Minimal dark Web3 landing page:

``` text
Build.
Connect.
Earn.

A next-generation Web3 compensation ecosystem.

[Get Started]
[Sign In]
```

Keep it consistent with the dashboard.

Avoid excessive gradients and generic crypto marketing visuals.

------------------------------------------------------------------------

# 27. Navigation

Authenticated sidebar:

``` text
Dashboard
Wallet
Packages
Referrals
Binary Tree
Team
Transactions

────────────

Admin

────────────

Settings
Logout
```

Active item: - Neon green accent - Dark green active surface - Bright
icon/text

Inactive: - Muted gray-green - Subtle hover

------------------------------------------------------------------------

# 28. Functional Demo Flow

The demo must not be a collection of static screens.

This sequence must work:

``` text
Register
    ↓
Referral code accepted
    ↓
User created
    ↓
Wallet created
    ↓
Dashboard shows user
    ↓
Select F1/F2/F3
    ↓
Purchase package
    ↓
Wallet balance decreases
    ↓
Package becomes active
    ↓
Transaction appears
    ↓
Referral relationship is visible
    ↓
Direct count updates
    ↓
Binary tree updates
    ↓
Admin sees the user
    ↓
Admin sees the same tree
```

All screens should read from the same mock state.

------------------------------------------------------------------------

# 29. Build Order

Implement in this exact order:

## Step 1 --- Foundation

-   Inspect existing repository
-   Configure Next.js/Tailwind if needed
-   Configure TypeScript
-   Configure font
-   Create color/design tokens
-   Build UI primitives
-   Build app shell

## Step 2 --- Authentication

-   Login
-   Registration
-   Referral code
-   Mock auth

## Step 3 --- Data Layer

-   Types
-   Mock users
-   Mock packages
-   Mock wallets
-   Mock transactions
-   Referral relationships
-   Binary tree

## Step 4 --- Dashboard

-   Header
-   Sidebar
-   KPI cards
-   Chart
-   Assets
-   Recent transactions

## Step 5 --- Wallet

-   Balances
-   Assets
-   Transactions

## Step 6 --- Packages

-   F1/F2/F3 cards
-   Package details
-   Purchase modal
-   Purchase success
-   Wallet update

## Step 7 --- Referrals

-   Referral link
-   Direct count
-   Referral list

## Step 8 --- Binary

-   Tree renderer
-   Left/right branches
-   User nodes
-   Search
-   Expand/collapse

## Step 9 --- Admin

-   Admin dashboard
-   Users
-   Packages
-   Tree

## Step 10 --- Polish

-   Responsive behavior
-   Loading states
-   Empty states
-   Toasts
-   Accessibility
-   Visual refinement
-   Typecheck
-   Lint
-   Production build

------------------------------------------------------------------------

# 30. Claude Code Rules

Before writing a large amount of code:

1.  Inspect the repository.
2.  Check the existing Next.js/Tailwind setup.
3.  Do not blindly overwrite configuration.
4.  Preserve useful existing work.
5.  Create a short implementation plan.
6.  Implement incrementally.
7.  Run typecheck/build after major milestones.
8.  Fix errors before proceeding.
9.  Keep components reusable.
10. Keep domain logic separate from UI.
11. Use mock data for Phase 1.
12. Do not invent compensation formulas.
13. Do not implement future commission calculations unless explicitly
    specified.
14. Use configurable services/interfaces for future business logic.
15. Prioritize polished visual consistency.

------------------------------------------------------------------------

# 31. Definition of Done

Phase 1 is complete only when:

-   [ ] App runs
-   [ ] TypeScript passes
-   [ ] ESLint passes
-   [ ] Build succeeds
-   [ ] Login works with mock data
-   [ ] Registration works
-   [ ] Referral code is processed
-   [ ] Wallet is created
-   [ ] Direct referral count updates
-   [ ] Binary left/right relationships work
-   [ ] Binary tree is rendered from data
-   [ ] F1/F2/F3 are displayed
-   [ ] Package purchase works
-   [ ] Wallet balance changes after purchase
-   [ ] Transaction is created
-   [ ] Dashboard updates
-   [ ] Admin user list works
-   [ ] Admin package list works
-   [ ] Admin tree works
-   [ ] Mobile layout works
-   [ ] UI closely matches the supplied Web3 reference
-   [ ] No generic blue/purple SaaS styling
-   [ ] Domain logic is separated from presentation
-   [ ] Future compensation modules have clean extension points

------------------------------------------------------------------------

# 32. Final Claude Code Instruction

Build this as a **high-end Web3 financial dashboard demo**, not a
generic admin dashboard.

Use the supplied reference image as the visual source of truth for: -
Color mood - Typography feel - Card styling - Border treatment -
Navigation - Chart treatment - Spacing - Overall density - Premium Web3
aesthetic

The final demo should feel like a real crypto product.

Most importantly, make the Phase 1 flow functional:

``` text
Register
→ Referral
→ Wallet
→ Founder Package
→ Purchase
→ Wallet Update
→ Transaction
→ Direct Count
→ Binary Tree
→ Admin Visibility
```

Do not stop at static UI. Build a cohesive functional demo with mock
data and clean, future-proof architecture.
