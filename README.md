# RecycLinkSL_FrontendDev - Routing Structure

## Overview
This project now has a structured routing system organized by user roles: citizen, Admin, and collector. Each role has its own dedicated routes, layouts, and components.

## Routing Structure

### 📁 Project Structure
```
src/
├── routes/                     # Route definitions organized by role
│   ├── citizen/              
│   │   └── citizen-routes.tsx # citizen-specific routes
│   ├── admin/                 
│   │   └── admin-routes.tsx   # Admin-specific routes
│   ├── collector/                 
│   │   └── collector-routes.tsx   # collector-specific routes
│   └── index.ts               # Route exports
├── components/
│   └── layout/                # Layout components for each role
│       ├── citizenLayout.tsx # citizen portal layout
│       ├── citizenSidebar.tsx
│       ├── AdminLayout.tsx    # Admin portal layout
│       ├── AdminSidebar.tsx
│       ├── collectorLayout.tsx    # collector portal layout
│       ├── collectorSidebar.tsx
│       ├── Header.tsx         # Shared header component
│       └── Layout.tsx         # Legacy layout (for backward compatibility)
└── pages/
    └── features/              # Feature-specific pages
        ├── citizenDashboard/
        ├── admin/             # Admin-specific pages
        └── collector/             # collector-specific pages
```

## Route URLs

### 🔐 Authentication Routes
- `/login` - Login page
- `/forgot-password` - Password reset options
- `/forgot-password/sms` - SMS password reset
- `/forgot-password/email` - Email password reset
- `/verify-otp` - OTP verification
- `/verify-otp-email` - Email OTP verification

### 👤 citizen Routes (`/citizen/*`)
- `/citizen/dashboard` - citizen dashboard overview
- `/citizen/profile` - User profile management
- `/citizen/add-rental` - Create new rental booking
- `/citizen/booking-history` - View past and current bookings
- `/citizen/incident-reporting` - Report incidents
- `/citizen/change-requests` - Modify existing bookings
- `/citizen/invoices` - View invoices and billing
- `/citizen/fines` - View fines and penalties
- `/citizen/notifications` - Notification center
- `/citizen/activity-log` - Account activity history
- `/citizen/settings` - Account settings

### 👨‍💼 Admin Routes (`/admin/*`)
- `/admin/dashboard` - Admin dashboard with system overview
- `/admin/users` - User management (citizens & collector)
- `/admin/vehicles` - Vehicle fleet management
- `/admin/bookings` - Booking management and oversight
- `/admin/collector` - collector management
- `/admin/reports` - Reports and analytics
- `/admin/financial-reports` - Financial reporting
- `/admin/audit-log` - System audit logs
- `/admin/settings` - System configuration

### 👨‍🔧 collector Routes (`/collector/*`)
- `/collector/dashboard` - collector dashboard with daily tasks
- `/collector/vehicle-inspection` - Vehicle inspection tools
- `/collector/citizen-support` - citizen support interface
- `/collector/booking-assistance` - Help citizens with bookings
- `/collector/incident-management` - Handle incident reports
- `/collector/maintenance` - Vehicle maintenance scheduling
- `/collector/tasks` - Task management system
- `/collector/reports` - collector performance reports

## Layout Features

### 🎨 citizen Layout
- **Color Scheme**: Earth tones (cream background)
- **Navigation**: citizen-focused menu items
- **Features**: Profile access, booking management, support

### 🔴 Admin Layout  
- **Color Scheme**: Red accent colors
- **Navigation**: Administrative controls and system management
- **Features**: User management, system oversight, reporting
- **Icon**: Shield icon indicating security/administration

### 🔵 collector Layout
- **Color Scheme**: Blue accent colors  
- **Navigation**: Operational tools and citizen service
- **Features**: Task management, vehicle operations, citizen support
- **Icon**: UserCog icon indicating operational role

## Backward Compatibility

Legacy routes are automatically redirected to citizen routes:
- `/dashboard` → `/citizen/dashboard`
- `/profile` → `/citizen/profile`
- `/add-rental` → `/citizen/add-rental`
- (and all other legacy citizen routes)

## Navigation Features

Each layout includes:
- **Role-specific header** with appropriate branding
- **Contextual sidebar** with role-based navigation
- **Active state indicators** for current page
- **Responsive design** for mobile and desktop
- **Consistent styling** with role-based color schemes

## Getting Started

1. **Development Server**:
   ```bash
   npm run dev
   ```

2. **Access Different Portals**:
   - citizen Portal: `http://localhost:5174/citizen/dashboard`
   - Admin Portal: `http://localhost:5174/admin/dashboard`  
   - collector Portal: `http://localhost:5174/collector/dashboard`

3. **Login**: Start at `http://localhost:5174/login`

## Adding New Routes

### For citizen Routes:
1. Add component to `src/pages/features/citizenDashboard/`
2. Import and add route in `src/routes/citizen/citizen-routes.tsx`
3. Add navigation item to `src/components/layout/citizenSidebar.tsx`

### For Admin Routes:
1. Add component to `src/pages/features/admin/`
2. Import and add route in `src/routes/admin/admin-routes.tsx`
3. Add navigation item to `src/components/layout/AdminSidebar.tsx`

### For collector Routes:
1. Add component to `src/pages/features/collector/`
2. Import and add route in `src/routes/collector/collector-routes.tsx`
3. Add navigation item to `src/components/layout/collectorSidebar.tsx`

## Technology Stack

- **React 18** with TypeScript
- **React Router Dom v6** for routing
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Notes

- Each role has its own isolated routing structure
- Layouts are role-specific with appropriate styling and navigation
- The system supports role-based access control (ready for authentication integration)
- All routes are type-safe with TypeScript
- The design is responsive and follows modern UI/UX patterns
