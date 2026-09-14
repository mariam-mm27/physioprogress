# PhysioProgress - Angular Frontend

Modern Angular 17 frontend for PhysioProgress physiotherapy tracking application with dark theme and purple accent colors.

## 🎨 Design System

- **Theme**: Dark mode (background: #0f172a)
- **Primary Color**: Purple (#7c3aed)
- **Light Purple**: #a78bfa
- **Dark Purple**: #6d28d9
- **Text Colors**: Primary #f1f5f9, Secondary #cbd5e1

## 📦 Project Structure

```
src/
├── app/
│   ├── core/              # Services, guards, interceptors
│   ├── features/          # Feature modules (auth, dashboard, patient, therapist)
│   ├── shared/            # Shared components, pipes, models
│   ├── app.component.ts   # Root component
│   └── app.routes.ts      # Route configuration
│
├── styles.scss            # Global styles & utilities
├── main.ts                # Bootstrap
└── index.html             # Main template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 17+

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`

### Build

```bash
npm run build
# Production build
ng build --configuration production
```

## 📋 Key Features

### Core Module
- **AuthService**: Login, signup, token management
- **AuthGuard**: Route protection
- **RoleGuard**: Role-based access control
- **AuthInterceptor**: JWT token injection

### Routing
- **Public**: `/auth/login`, `/auth/signup`, `/auth/forgot-password`
- **Protected**: `/dashboard`
- **Patient Routes**: `/patient/exercise-plans`, `/patient/session-logs`, `/patient/analytics`, `/patient/profile`
- **Therapist Routes**: `/therapist/patients`, `/therapist/exercise-plans`, `/therapist/analytics`, `/therapist/profile`

### Global Styles (SCSS)
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`
- **Layouts**: `.flex`, `.grid`, `.container`
- **Utilities**: Margin, padding, shadow, rounded corners
- **Animations**: fadeIn, slideInUp, pulse

## 🛠️ Development Workflow

1. Generate components:
   ```bash
   ng generate component features/auth/pages/login
   ```

2. Generate services:
   ```bash
   ng generate service features/patient/services/exercise-plan
   ```

3. Build feature modules with lazy loading

## 📡 API Integration

Base URL: `http://localhost:8000/api`

### Authentication Endpoints
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/google`
- `GET /auth/me`

### Patient Endpoints
- `GET /api/plans/:patientId`
- `POST /api/logs`
- `GET /api/logs/patient/:patientId`

### Therapist Endpoints
- `GET /api/users/patients`
- `PUT /api/users/assign-patient`

## 🔐 Security

- JWT token stored in localStorage
- Token automatically injected via AuthInterceptor
- Route guards prevent unauthorized access
- Role-based access control for patient/therapist routes

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 768px, 480px
- Flexible layouts with CSS Grid and Flexbox

## 🧪 Testing

```bash
npm test
```

## 📖 Documentation

See `STRUCTURE.md` for detailed project structure documentation.

## 📝 License

MIT

## 👥 Authors

PhysioProgress Team
