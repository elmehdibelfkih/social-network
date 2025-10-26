

export default function RootLayout({ children }: { children: React.ReactNode; }) {
    console.log(children)
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    );
}

