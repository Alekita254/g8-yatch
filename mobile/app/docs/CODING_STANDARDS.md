# React Native Coding Standards

These standards are mandatory for this Android POS app.

## 1. Project Structure

Keep code in src with flat feature boundaries:

- src/components
- src/screens
- src/navigation
- src/hooks
- src/services
- src/store
- src/utils
- src/types
- src/assets
- src/theme

Rules:

- Prefer shallow folders.
- Reusable UI belongs in components.
- Screen-specific UI belongs in screens.
- API access belongs in services.
- Domain types belong in types.

## 2. Component Rules

- Function components and hooks only.
- One component, one responsibility.
- No business logic or API calls inside UI components.
- Keep JSX blocks small by splitting into child components.

## 3. Naming Rules

- Components and component files: PascalCase.
- Variables, functions, and hooks: camelCase.
- Hooks must start with use.
- Avoid unclear names and abbreviations.

## 4. Function Design

- Target 10 to 25 lines per function.
- One function, one purpose.
- Extract helper functions when behavior grows.

## 5. TypeScript Rules

- Type all props and exported function signatures.
- Avoid any.
- Use interface for object shapes.
- Use type for unions and aliases.

## 6. Styling Rules

- Use StyleSheet.create, avoid inline styles.
- Use theme tokens for color/spacing/radius.
- Keep styles near the component unless very large.

## 7. State Rules

- Server state: React Query.
- App/global state: Zustand or Redux Toolkit.
- Context only for cross-cutting concerns like auth/theme.

## 8. API Rules

- No direct API calls from UI components.
- Services own HTTP integration.
- Hooks orchestrate services for screens.

## 9. Testing Rules

- Unit tests for logic and hooks.
- Component tests for core rendering states.
- E2E tests for main POS flow.

## 10. Quality Rules

- ESLint and Prettier are required.
- No console.log in production code.
- Keep nesting shallow and readable.
