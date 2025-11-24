// WRONG for nested /auth/layout
export default function profileLayout({ children }: { children: React.ReactNode }) {
  return (
    <html> 
      <body>{children}</body>
    </html>
  );
}
