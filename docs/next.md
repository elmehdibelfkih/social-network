# getting started
    npx create-nextapp@latest .

# 📁 Project Structure — my-next-app

This document describes the purpose and contents of each folder in the **my-next-app** Next.js project.

```
my-next-app/
├── app/                  # Main application routes (Next.js App Router)
│   ├── layout.tsx        # Root layout (shared UI)
│   ├── page.tsx          # Home page
│   ├── about/
│   │   └── page.tsx      # /about route
│   ├── dashboard/
│   │   ├── layout.tsx    # Nested layout
│   │   └── page.tsx      # /dashboard route
│
├── components/           # Reusable UI components (Buttons, Navbar, etc.)
│   ├── ui/
│   ├── layout/
│   └── forms/
│
├── hooks/                # Custom React hooks
│   └── useUser.ts
│
├── lib/                  # Helpers, utils, constants, and config
│   ├── api.ts
│   ├── auth.ts
│   └── constants.ts
│
├── services/             # API service wrappers or data fetching logic
│   └── userService.ts
│
├── types/                # TypeScript types/interfaces
│   └── user.ts
│
├── styles/               # Global and module CSS/SCSS files
│   ├── globals.css
│   ├── variables.css
│   └── components/
│
├── public/               # Static assets (images, fonts, icons)
│   └── favicon.ico
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
