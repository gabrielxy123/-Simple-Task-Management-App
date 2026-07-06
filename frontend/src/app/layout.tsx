import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow – Simple Task Management",
  description:
    "A modern, collaborative task management application built with Next.js and FastAPI. Organize, track, and complete tasks efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
