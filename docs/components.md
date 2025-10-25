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