# getting started

    npx create-nextapp@latest .

## 📁 Project Structure — my-next-app

This document describes the purpose and contents of each folder in the **my-next-app** Next.js project.

```ini
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Avatar.tsx
│       └── Icon.tsx
|
├── features/
│   └── componentExample/
│       ├── *.server.tsx # → Server component: fetches data, runs on server, returns markup only. No hooks or event handlers.
│       ├── *.client.tsx # → Client component: begins with "use client". Uses useState, useEffect, event handlers, third-party browser libs, file inputs, sockets.
│       ├── hooks/ # → Client-only or shared hooks tied to that feature.
│       ├── services/ # → Thin API wrapper calling libs/apiClient. Encapsulates endpoints used by the feature.
│       ├── types.ts # → Local TypeScript types for the feature. Prefer referencing shared models from src/types/models.ts if available.
│       ├── styles.module.css # → Scoped CSS module (or CSS-in-TS variant). Theme tokens live in styles/variables.css.
│       └── index.ts # → Re-export public components.
|
├── libs/
│   ├── apiClient.ts              # single place for fetch/headers/refresh
│   └── auth.ts      
|
├── styles/
|   ├── globals.css
|   └── variables.css
|
│
├── .env.local            # Environment variables
├── next.config.mjs       # Next.js config
├── tsconfig.json         # TypeScript config
├── package.json
└── README.md

```


## 🏠 app/

Contains the main application logic and routes using the **Next.js App Router**.

## how to define a route

in next each folder contains a page.tsx is a route

```
├── customRoute/ #static route
        page.tsx                
    │── [id or something]/ #dynamin route
        page.tsx
```

## 🧩 components/

Holds reusable UI elements used throughout the application.

- [lean more about components](./components.md)

---

## ⚓ hooks/

Contains **custom React hooks** — reusable logic extracted from components.

- [lean more about hooks](./hooks.md)

---

## 🌐 services/

Contains higher-level functions that communicate with external APIs or backend services.

- [lean more about services](./services.md)

---

## ⚙️ lib/

Contains small, pure utility modules and app-wide configuration.

---

## 🧾 types/

Defines global **TypeScript types and interfaces**.

---

## 🎨 styles/

Holds all style-related files for the project.

---

## 🖼 public/

Static assets served directly from the root path (`/`).

---

## ⚙️ Root Files

- **.env.local** → Environment variables  
- **next.config.mjs** → Next.js configuration file  
- **tsconfig.json** → TypeScript configuration  
- **package.json** → Dependencies and scripts  

---

📘 **Summary**
This structure separates logic by concern:

- **app/** → Pages and routing  
- **components/** → UI  
- **hooks/** → Reusable logic  
- **lib/** → Low-level helpers  
- **services/** → Data interaction layer  
- **types/** → TypeScript definitions  
- **styles/** → Styling organization  
- **public/** → Static assets  

This modular setup ensures a scalable, maintainable, and clear Next.js project architecture.
