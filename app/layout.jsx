export const metadata = { title: "My Site", description: "Deployed on Vercel" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <style jsx global>{`
          body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
          .container { max-width: 960px; margin: 0 auto; padding: 24px; }
        `}</style>
      </body>
    </html>
  );
}
