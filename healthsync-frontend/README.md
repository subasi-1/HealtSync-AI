# HealthSync AI - Frontend

HealthSync AI is an enterprise AI-Driven Health Center & Supply Chain Management System. This repository contains the scaffolded frontend architecture.

## Tech Stack
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Axios**
- **React Query** (TanStack Query)
- **React Hook Form**
- **Zod**
- **Recharts**
- **Leaflet**
- **Lucide Icons**

## Folder Structure
The project is scaffolded using an enterprise-grade modular and domain-driven folder organization:

- `src/assets/`: Static files like images, SVGs, etc.
- `src/components/`: Reusable, layout, and domain-specific UI components (scaffolded with placeholders).
- `src/pages/`: Page-level components corresponding to router views.
- `src/hooks/`: Reusable React hooks.
- `src/services/`: API clients, service classes, and data fetchers (e.g. Axios, React Query).
- `src/context/`: Global React contexts.
- `src/routes/`: Routing tables and route definitions.
- `src/types/`: TypeScript interfaces and type definitions.
- `src/constants/`: Read-only constants, enums, config maps.
- `src/utils/`: Generic utility helper functions.
- `src/styles/`: Global stylesheets and CSS/Tailwind utilities.

## Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```
