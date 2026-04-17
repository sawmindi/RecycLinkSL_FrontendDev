# RecycLinkSL_FrontendDev

**Frontend** for **RecycLinkSL** — A Web-Based Recycling Collection and Citizen Engagement System for Urban Councils in Sri Lanka.

Final Year Project (IIT / University of Westminster)  
**Interim Progression Demonstration (IPD) Stage**

**Author**: Thenahandi Sandali Sawmindi De Silva

---

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router Dom v6 (role-based routing)
- Lucide React (icons)
- i18next (English / Sinhala translation)
- Axios (API calls)
- Leaflet (map picker)

---

## Folder Structure

```bash
src/
├── components/
│   ├── auth/                  # Authentication components
│   ├── forms/                 # Reusable forms (AddressMapPicker, MainCitySelect, etc.)
│   ├── layout/                # Role-based layouts & sidebars
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── CitizenLayout.tsx
│   │   ├── CitizenSidebar.tsx
│   │   ├── CollectorLayout.tsx
│   │   ├── CollectorSidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/                    # shadcn/ui components
│
├── data/                      # Static data & utilities
│   ├── cities.json
│   ├── mainCities.ts
│   ├── pickupRouteOrder.ts
│   ├── pradeshiyaSabhas.ts
│   └── scheduleAreaForCitizen.ts
│
├── environment/               # Environment configuration
│
├── hooks/                     # Custom React hooks
│
├── i18n/                      # Internationalization (English/Sinhala)
│
├── lib/                       # Helper libraries
│   ├── formatDate.ts
│   ├── leafletCdn.ts
│   ├── nominatimGeocode.ts
│   ├── swal.ts
│   └── utils.ts
│
├── models/                    # TypeScript interfaces
│   ├── Response.ts
│   ├── Role.ts
│   ├── Upload.ts
│   └── User.ts
│
├── pages/
│   ├── auth/                  # Authentication pages
│   │   ├── LoginPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ... (OTP pages)
│   └── features/
│       ├── admin/             # Admin pages
│       ├── citizen/           # Citizen pages
│       └── collector/         # Collector pages
│
├── routes/                    # Role-based routing
│   ├── admin/admin-routes.tsx
│   ├── citizen/citizen-routes.tsx
│   └── collector/collector-routes.tsx
│
├── services/                  # API service layers
│   ├── AuthService.ts
│   ├── AdminService.ts
│   ├── CitizenService.ts
│   ├── CollectorService.ts
│   └── pickupCancel.ts
│
├── App.tsx
├── main.tsx
└── Util.ts
```

## Development Setup
   - Node.js (v18 or higher)
   - npm or yarn

### Installation

1. Clone the repository and navigate to the backend folder

2. Install dependencies:
```bash
npm install
```

3. Run the project
```bash
npm run dev
```

2. **Access Different Portals**:
   - citizen Portal: `http://localhost:5173/citizen/dashboard`
   - Admin Portal: `http://localhost:5173/admin/dashboard`  
   - collector Portal: `http://localhost:5173/collector/dashboard`

3. **Login**: Start at `http://localhost:5173/login`


## Technology Stack

- **React 18** with TypeScript
- **React Router Dom v6** for routing
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Key Features Already Implemented 

- Full MPCLG cascading area selection (District → Council → Main City)
- Bilingual support (English ↔ Sinhala) with language toggle
- Responsive design on all 3 dashboards (mobile + desktop)
- Role-based authentication
- Dynamic pricing with live estimate
- Route ordering for collectors
- Admin CRUD for categories, prices, - schedules, and collector assignment
