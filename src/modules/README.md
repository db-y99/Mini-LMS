# Modules

This directory contains all business domain modules following the Modular Monolith architecture.

## Module Structure

Each module follows this structure:

```
module-name/
├── domain/          # Business logic, entities, value objects
├── application/     # Use cases, application services
├── infrastructure/  # External dependencies, database, APIs
└── api/            # Public API (ONLY interface for other modules)
    └── ModuleNameModule.ts
```

## Available Modules

1. **loan** - Loan management and CRUD operations
2. **workflow** - State machine and transitions
3. **event** - Event logging and audit trail
4. **versioning** - Loan versioning and history
5. **payment** - Payment processing and schedules
6. **branch** - Branch and user management

## Module Boundaries

**CRITICAL RULES:**

1. ✅ **DO** import from module API:
   ```typescript
   import { loanModule } from '@modules';
   ```

2. ❌ **DON'T** import from module internals:
   ```typescript
   // WRONG!
   import { LoanService } from '@modules/loan/domain/LoanService';
   ```

3. ✅ **DO** communicate via events for async operations
4. ✅ **DO** use shared utilities from `@shared`

## Adding a New Module

1. Create module directory structure
2. Implement domain logic
3. Create public API in `api/ModuleNameModule.ts`
4. Export from `src/modules/index.ts`
5. Add ESLint rules if needed

## Testing Modules

Each module should have its own tests:

```
module-name/
├── __tests__/
│   ├── domain/
│   ├── application/
│   └── api/
```

Test modules independently using the public API.
