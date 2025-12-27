# Vehicle Watchlist Platform - Development Instructions

## Overview

Build a web application that allows users to search for Israeli vehicle information using the government's open data API, view details, and manage a personal "Watchlist" of vehicles.

---

## Tech Stack Requirements

| Category            | Technology                                            |
| ------------------- | ----------------------------------------------------- |
| **Language**        | TypeScript (Strict mode enabled)                      |
| **Frontend**        | React (Next.js), Tailwind CSS, **shadcn/ui**          |
| **Backend**         | Node.js (NestJS)                                      |
| **Database**        | MongoDB                                               |
| **Validation**      | Zod (for both API input and Frontend form validation) |
| **Infrastructure**  | Docker, Docker Compose, GitHub Actions                |
| **Package Manager** | bun                                                   |

> **Note**: shadcn/ui is built on top of Radix UI primitives. Components using `@radix-ui/*` imports with Tailwind styling are the correct shadcn/ui pattern.

---

## Feature Requirements

### A. Authentication

- [ ] Implement Register and Login mechanism
- [ ] **Registration**: User provides Name, Email, and Password
- [ ] **Login**: User provides Email and Password to receive JWT token
- [ ] **Validation Rules**:
  - Email: Must be valid email format
  - Password: Minimum 8 characters, with upper/lower case letters and numbers

### B. Vehicle Search (Data Integration)

- [ ] Create search interface for Vehicle License Plate Number
- [ ] Add filters: Color, Year, etc.
- [ ] **Validation**: Israeli license plate format (7 or 8 digits)
- [ ] **API Integration**:
  - Resource ID: `053cea08-09bc-40ec-8f7a-4b9525b57555` (Private Vehicles)
  - API Docs: [Data.gov.il API Docs](https://data.gov.il/dataset/private-vehicles)
- [ ] Display search results
- [ ] Show Popup/Drawer with vehicle details on row click

### C. The Watchlist

- [ ] Allow logged-in users to "Star" or "Save" vehicles from search results
- [ ] Store saved vehicles in MongoDB
- [ ] Create "My Watchlist" page showing all saved vehicles
- [ ] Allow users to remove vehicles from watchlist

---

## DevOps & Infrastructure Requirements

### A. Dockerization

- [ ] Create Dockerfile(s) for the application
- [ ] Use multi-stage builds for optimization

### B. CI/CD (GitHub Actions)

- [ ] Set up workflow that triggers on push to `main` branch
- [ ] Workflow steps:
  1. Lint and Type-check the code
  2. Build the Docker image
  3. Publish image to GitHub Container Registry (GHCR)

### C. Docker Compose

- [ ] Create `docker-compose.yml` in repository root
- [ ] **Requirement**: Reviewers can run project without installing Node.js locally
- [ ] Compose file must:
  1. Pull application image from GHCR (built by CI)
  2. Spin up local MongoDB instance
  3. Set up necessary networking
- [ ] Include `.env.example` with instructions

---

## Database Fallback (CodeSandbox Compatibility)

The app must work in Githubbox/CodeSandbox environment:

- [ ] Detect if `MONGO_URI` environment variable is present
- [ ] If `MONGO_URI` exists → Use MongoDB connection
- [ ] If `MONGO_URI` missing → Use `mongodb-memory-server` (in-memory database)
- [ ] App must not crash without MongoDB connection
- [ ] Configure `package.json` scripts for CodeSandbox (use `concurrently`)

**Test URL**: `https://githubbox.com/<username>/<repo>`

---

## Submission Checklist

- [ ] Push code to public GitHub repository
- [ ] Include `README.md` with docker-compose instructions
- [ ] Ensure Githubbox compatibility
- [ ] Verify Register/Login works without errors in CodeSandbox

---

## Evaluation Criteria

1. **Functionality**: Search works, DB saves work, Auth works
2. **DevOps Lifecycle**: GitHub Action passes, `docker-compose up` works
3. **Code Quality**: TypeScript strictness, component structure, clean architecture
4. **Zod Usage**: Shared types between Frontend/Backend, robust validation
5. **UI/UX**: shadcn/ui components usage, general aesthetic

---

## Bonus Features (Optional)

### Bonus 1: Mobile Responsiveness

- [ ] Fully responsive layout
- [ ] Navbar collapses to hamburger menu on mobile
- [ ] Data tables transform to card view on small screens

### Bonus 2: Watchlist Analytics (Charts)

- [ ] Add "Analytics" tab to Watchlist page
- [ ] Show Bar/Pie Chart of vehicles by Manufacturer (`tozeret_nm`)
- [ ] **Backend**: Use MongoDB Aggregation Pipeline (not JS filtering)
- [ ] **Frontend**: Use shadcn/ui Charts (Recharts)

### Bonus 3: OAuth Integration

- [ ] Implement Social Login (Google, GitHub, or Auth0)
- [ ] Works alongside standard email/password flow

---

## API Reference

### Data.gov.il Vehicle API

- **Base URL**: `https://data.gov.il/api/3/action/datastore_search`
- **Resource ID**: `053cea08-09bc-40ec-8f7a-4b9525b57555`
- **Documentation**: [Data.gov.il API Docs](https://data.gov.il/dataset/private-vehicles)

### Query Example

```bash
curl "https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-4b9525b57555&q=12345678"
```

---

## Component Guidelines

### shadcn/ui Usage

shadcn/ui components are pre-styled wrappers around Radix UI primitives. They follow this pattern:

```tsx
// Correct shadcn/ui pattern
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
// ... styled components with Tailwind classes
```

### Required UI Components

- [ ] Button, Input, Label (forms)
- [ ] Card (vehicle display)
- [ ] Select (filters)
- [ ] Dialog/Drawer (vehicle details popup)
- [ ] Table (search results)
- [ ] Toast/Sonner (notifications)

---

## Project Structure

```
vehicle-watchlist/
├── apps/
│   ├── vehicle-watchlist-api/     # NestJS Backend
│   │   └── src/
│   │       ├── auth/              # Authentication module
│   │       ├── users/             # Users module
│   │       ├── vehicles/          # Vehicle search module
│   │       └── watchlist/         # Watchlist module
│   └── vehicle-watchlist-ui/      # Next.js Frontend
│       └── src/
│           ├── app/               # Next.js app router
│           ├── components/        # React components
│           │   └── ui/            # shadcn/ui components
│           └── lib/               # Utilities
├── libs/                          # Shared libraries
│   ├── api/                       # Shared API types
│   ├── database/                  # Database utilities
│   └── utils/                     # Shared utilities
├── docker/                        # Docker configurations
├── .github/
│   └── workflows/                 # GitHub Actions
├── docker-compose.yml
└── package.json
```

---

## Environment Variables

### Backend (.env)

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/vehicle-watchlist

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# API
GOV_IL_API_URL=https://data.gov.il/api/3/action/datastore_search
GOV_IL_RESOURCE_ID=053cea08-09bc-40ec-8f7a-4b9525b57555

# Optional: OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```
