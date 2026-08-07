import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revisión de entregables · Altivox",
  description: "Portal privado de revisión de entregables",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function ReviewPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, #1a2332 0%, #0c1017 55%, #080a0e 100%)",
        color: "#e8eef6",
        fontFamily:
          '"Segoe UI", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
