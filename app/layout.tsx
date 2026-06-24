import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stimi",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={`subpixel-antialiased ${montserrat.className}`}>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
