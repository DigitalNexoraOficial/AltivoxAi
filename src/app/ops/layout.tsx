import type { Metadata } from "next";
import { OpsShell } from "@/components/ops/OpsShell";
import "./ops.css";

export const metadata: Metadata = {
  title: "Altivox OS | Ops",
  description: "Centro de operaciones interno de Altivox OS.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OpsShell>{children}</OpsShell>;
}
