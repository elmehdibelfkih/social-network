# components

- [go back to the next doc](./next.md)

## structure
```
├── components/           # Reusable UI components (Buttons, Navbar, etc.)
│   ├── ui/
│   ├── layout/
│   └── forms/
```

## ui

- this floder is responsable of creating components that are shared across all the web app like buttons,headers,navbar,footer...

## layout

- this folder is dedicated for a components that are shared acroos a global layout of a specific route 

for example:
    
```
├── components/
│   ├── chat/
        conversation.tsx
```

## forms

- this folder is used to keep all the forms user in the web app together so when u are creating a new form make sure u add it in this folder

```
├── components/
│   ├── forms/
        loginForm.tsx
```


styles of the components should be placed in styles/components/ and must be named *.module.css and imported in their component
for example:

```
├── components/
│   ├── forms/
        loginForm.tsx

├── styles/
        ├── components/
                loginForm.module.css
```

## server side vs client side components 

### Server Components (default)

- Rendered **on the server** and sent as HTML.
- Use when:
  - Fetching data for initial render
  - Using environment variables or secrets
  - Rendering static layouts (headers, footers)
  - SEO is important
- Cannot use:
  - React hooks (`useState`, `useEffect`)
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (`onClick`, `onChange`)

### Client Components (`"use client"`)

- Rendered **in the browser** for interactivity.
- Use when:
  - Handling forms, buttons, or modals
  - Using React hooks
  - Accessing browser APIs
- Limitations:
  - Adds JavaScript to the client bundle
  - Cannot access server-only secrets
