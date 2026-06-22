import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stimi",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={"subpixel-antialiased"}>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
