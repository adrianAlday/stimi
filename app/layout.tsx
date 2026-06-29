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
    <html
      lang="en"
      className={`subpixel-antialiased ${montserrat.className} overflow-x-auto overflow-y-auto scrollbar-none overscroll-x-none overscroll-y-none`}
    >
      <body className="overflow-x-auto overflow-y-auto scrollbar-none overscroll-x-none overscroll-y-none">
        {children} <Analytics />
      </body>
    </html>
  );
};

export default Layout;
