# 📁 SOCIAL-NETWORK ARCHITECTURE

## FRONTEND ARCHITECTURE

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
│       ├── hooks # → Client-only or shared hooks tied to that feature.
│       ├── services # → Thin API wrapper calling libs/apiClient. Encapsulates endpoints used by the feature.
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