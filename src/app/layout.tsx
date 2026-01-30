import type { Metadata } from "next";
import "./globals.css";
import { TransitionProvider } from '../util/TransitionProvider';

export const metadata: Metadata = {
  title: "Dweb for Creators",
  description: "Decentralized Web (DWeb) for Creators is an 8-week online course that empowers artists, designers, archivists, gallerists, curators, and others with the knowledge and tools necessary for exploring the decentralized web.",
   icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
         <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
