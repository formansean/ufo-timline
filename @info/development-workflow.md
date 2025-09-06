# Development Workflow and Build Processes

## Overview

The UFO Timeline project follows modern development practices with TypeScript, Next.js 15, and comprehensive tooling for code quality, building, and deployment.

## Technology Stack

### Core Technologies
- **Next.js 15.5.2**: React framework with App Router and Turbopack
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5**: Full type safety across the application
- **Tailwind CSS 4**: Utility-first CSS framework with PostCSS
- **D3.js 7.9.0**: Data visualization library

### Development Tools
- **ESLint 9**: Code quality and style enforcement
- **Node.js 18+**: JavaScript runtime (Alpine Linux in containers)
- **Turbopack**: Next.js bundler for faster builds
- **Docker**: Containerized development and deployment

## Project Scripts (`package.json`)

### Development Scripts
```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack", 
  "build:docker": "next build --turbopack",
  "build:strict": "eslint --max-warnings 0 . && next build --turbopack",
  "start": "next start",
  "lint": "eslint",
  "lint:fix": "eslint --fix .",
  "type-check": "tsc --noEmit"
}
```

### Script Descriptions

**`npm run dev`**
- Starts development server with hot reload
- Uses Turbopack for faster builds and HMR
- Available at `http://localhost:3000`
- Supports file watching and automatic restart

**`npm run build`**
- Creates optimized production build
- Uses Turbopack for faster compilation
- Generates standalone output for Docker
- Includes static asset optimization

**`npm run build:docker`**
- Identical to build but explicitly for Docker
- Uses Turbopack for consistent build performance
- Optimized for containerized environments

**`npm run build:strict`**
- Zero-tolerance build process
- Requires all ESLint warnings to be resolved
- Fails build if any linting issues exist
- Used for production deployments

**`npm run start`**
- Starts production server
- Serves the built application
- Requires `npm run build` to be run first

**`npm run lint`**
- Runs ESLint on all TypeScript/JavaScript files
- Checks code quality and style consistency
- Reports warnings and errors

**`npm run lint:fix`**
- Automatically fixes ESLint issues where possible
- Applies consistent code formatting
- Manual review required for complex issues

**`npm run type-check`**
- TypeScript compilation check without emitting files
- Validates type safety across the entire codebase
- Faster than full build for type validation

## Configuration Files

### Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone'
};

export default nextConfig;
```

**Key Features**:
- **Standalone Output**: Self-contained production builds
- **Docker Optimization**: Minimal runtime dependencies
- **Turbopack Integration**: Automatic with Next.js 15

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Configuration Highlights**:
- **Strict Mode**: Full TypeScript strict checking
- **Path Aliases**: `@/*` maps to `src/*` for clean imports
- **Next.js Plugin**: Automatic type generation
- **Incremental Builds**: Faster compilation on changes

### ESLint Configuration (`eslint.config.mjs`)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**", 
      "out/**",
      "build/**",
      "next-env.d.ts",
      "backend/**",
      "oldCode/**"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn"
    }
  }
];
```

**Linting Strategy**:
- **Next.js Rules**: Core web vitals and TypeScript integration
- **Lenient Approach**: Warnings instead of errors for flexibility
- **Gradual Migration**: Allows legacy patterns during development
- **Exclude Patterns**: Ignores generated and third-party code

### PostCSS Configuration (`postcss.config.mjs`)

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"]
};

export default config;
```

**CSS Processing**:
- **Tailwind Integration**: Automatic CSS processing
- **Build Optimization**: Purging unused styles
- **PostCSS Pipeline**: Extensible CSS transformations

## Development Environment Setup

### Local Development (Recommended)

**Option 1: Docker Development (Recommended)**
```bash
# Quick start
./deploy.sh dev

# Access points:
# - App: http://localhost:3000
# - Database: localhost:5433 
# - pgAdmin: http://localhost:8080
```

**Option 2: Local Node.js Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access app at http://localhost:3000
```

### Development Scripts

**Local Development Script (`dev-local.sh`)**

```bash
# Setup local SQLite development
./dev-local.sh local

# Prepare for Docker PostgreSQL
./dev-local.sh docker

# Reset to clean state
./dev-local.sh reset
```

**Script Functions**:
- **Local Setup**: Configures SQLite for local development
- **Docker Preparation**: Switches to PostgreSQL configuration
- **Reset**: Cleans all generated files and databases

## Build Process

### Development Build Flow

```mermaid
graph TD
    A[Source Code] --> B[TypeScript Compilation]
    B --> C[ESLint Checking]
    C --> D[Next.js Build]
    D --> E[Turbopack Processing]
    E --> F[Hot Module Replacement]
    F --> G[Development Server]
```

### Production Build Flow

```mermaid
graph TD
    A[Source Code] --> B[ESLint Strict Check]
    B --> C[TypeScript Type Check]
    C --> D[Next.js Production Build]
    D --> E[Turbopack Optimization]
    E --> F[Static Asset Generation]
    F --> G[Standalone Output]
    G --> H[Docker Image]
```

### Build Optimization Features

**Turbopack Benefits**:
- **Faster Builds**: 10x faster than Webpack for large applications
- **Incremental Compilation**: Only rebuilds changed modules
- **Better Caching**: Persistent caching across builds
- **Hot Module Replacement**: Near-instant updates in development

**Next.js Optimizations**:
- **Automatic Code Splitting**: Route-based chunking
- **Image Optimization**: Built-in image processing
- **Bundle Analysis**: Automatic dependency optimization
- **Static Generation**: Pre-rendered pages where possible

## Code Quality Workflow

### Pre-commit Checks (Manual)

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix auto-correctable issues
npm run lint:fix

# Strict build (production-ready)
npm run build:strict
```

### Continuous Integration Workflow

**Recommended CI Pipeline**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build:strict
```

### Code Quality Standards

**TypeScript Standards**:
- **Strict Mode**: All strict TypeScript checks enabled
- **Type Coverage**: 100% TypeScript coverage required
- **Interface First**: Prefer interfaces over types
- **No Any**: Explicit any usage requires justification

**React Standards**:
- **Functional Components**: All components as functions
- **Hooks Usage**: Proper hook dependency arrays
- **Props Typing**: Full TypeScript interfaces for props
- **Component Structure**: Consistent file/folder organization

**Code Organization**:
- **Feature-Based**: Group by feature, not file type
- **Absolute Imports**: Use `@/` path aliases
- **Single Responsibility**: One concern per file
- **Consistent Naming**: camelCase for functions, PascalCase for components

## Development Tools and IDE Setup

### Recommended VSCode Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag"
  ]
}
```

### VSCode Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## Environment Variables

### Development Environment (`.env`)
```env
# Database Configuration
DATABASE_URL="postgresql://ufo_user:ufo_password@localhost:5433/ufo_timeline"

# Application Secrets (Development Only)
JWT_SECRET="your-super-secret-jwt-key-for-development"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXT_PUBLIC_API_URL="http://localhost:3003"

# Docker PostgreSQL Configuration
POSTGRES_PASSWORD="ufo_password"
```

### Environment Variable Hierarchy
1. **Production**: Docker environment variables
2. **Development**: `.env.local` (gitignored)
3. **Default**: `.env` (committed to repo)
4. **Runtime**: Process environment variables

## Performance Optimization

### Build Performance

**Turbopack Optimizations**:
- **Parallel Processing**: Multi-threaded compilation
- **Smart Caching**: File-based caching system
- **Tree Shaking**: Automatic dead code elimination
- **Module Federation**: Efficient dependency sharing

**Development Performance**:
- **Hot Module Replacement**: Sub-second updates
- **Lazy Loading**: Route-based code splitting
- **Memory Management**: Efficient memory usage in dev mode

### Runtime Performance

**Next.js Optimizations**:
- **Image Optimization**: Automatic WebP conversion
- **Font Optimization**: Automatic font loading optimization
- **Bundle Size**: Minimize JavaScript bundles
- **Static Generation**: Pre-rendered pages where applicable

**React Optimizations**:
- **Component Memoization**: Strategic use of React.memo
- **Hook Optimization**: Proper dependency arrays
- **State Management**: Efficient state updates
- **Lazy Loading**: Dynamic imports for large components

## Debugging and Monitoring

### Development Debugging

**Browser DevTools**:
- **React DevTools**: Component tree inspection
- **Redux DevTools**: State management debugging (if applicable)
- **Network Tab**: API request monitoring
- **Console Debugging**: Strategic console.log usage

**Next.js Debugging**:
- **Source Maps**: Accurate error reporting
- **API Route Debugging**: Server-side debugging
- **Build Analysis**: Bundle analyzer integration
- **Performance Monitoring**: Core Web Vitals tracking

### Error Handling

**Development Error Reporting**:
- **TypeScript Errors**: Compile-time error catching
- **Runtime Errors**: Error boundaries and logging
- **API Errors**: Proper HTTP status codes
- **Database Errors**: Connection and query error handling

## Testing Strategy (Future Enhancement)

### Recommended Testing Setup
```bash
# Testing dependencies (to be added)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev cypress @cypress/react
```

### Test Types
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API route testing
- **E2E Tests**: Full user workflow testing
- **Visual Tests**: Component visual regression testing

This development workflow ensures high code quality, efficient builds, and maintainable codebase while supporting both local and containerized development environments.