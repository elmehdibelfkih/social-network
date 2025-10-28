# services

- [go back to the next doc](./next.md)

## Services & Types

This project uses a **`services/` folder** to handle all backend API interactions and a **`types/` folder** to maintain consistent TypeScript types.

---

## Services Folder

**Path:** `services/`

The `services/` folder contains **API service wrappers** that handle CRUD operations and abstract HTTP requests to the backend (Go API in this case).  

### Structure

```
services/
├── userService.ts # Handles CRUD for users
├── authService.ts # Handles authentication
└── ... # Additional services
```

# Types Folder

The `types/` folder contains **TypeScript types and interfaces** used throughout the project.  
Centralizing types ensures consistency, strong typing, and safer refactoring across services and components.

---

## Folder Structure

```
types/
├── user.ts # User-related types
├── auth.ts # Authentication-related types
└── index.ts # Optional: central export for all types
```

# Types Index

The `types/index.ts` file is used to **re-export all TypeScript types** from the `types/` folder.  
This allows cleaner and shorter imports in components and services.

---

## Example: `types/index.ts`

```ts
    // types/index.ts

    export * from "./user"
    export * from "./auth"
    // export * from "./post"   // add more types as needed
```

You can import everything from the index:

```ts
    import type { User, AuthResponse } from "@/types"
```
