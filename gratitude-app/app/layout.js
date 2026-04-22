import "./globals.css";

export const metadata = {
  title: "🌿 Daily Mind",
  description: "Your daily gratitude and meditation companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
