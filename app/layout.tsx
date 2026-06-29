import type { Metadata } from "next";
import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const inter = Inter({
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
      <body>
        {children} <Analytics />
      </body>
    </html>
  );
};

export default Layout;
