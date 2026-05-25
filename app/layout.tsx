export const metadata = {
  title: "Nederland Danst",
  description: "Nederland Danst PWA",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}