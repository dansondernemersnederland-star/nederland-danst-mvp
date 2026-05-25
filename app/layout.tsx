import "./globals.css";

export const metadata = {
  title: "Nederland Danst",
  description: "Nederland Danst PWA",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Nederland Danst",
    statusBarStyle: "black-translucent",
  },
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}