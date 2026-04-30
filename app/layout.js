import "./globals.css";

export const metadata = {
  title: "Houseiana Leads Management",
  description: "Houseiana Leads Management Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
