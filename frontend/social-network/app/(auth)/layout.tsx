// WRONG for nested /auth/layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html> 
      <body>{children}</body>
    </html>
  );
}
