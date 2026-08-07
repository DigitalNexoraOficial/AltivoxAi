"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  legacy?: boolean;
};

const NAV: NavItem[] = [
  { href: "/ops", label: "Dashboard" },
  { href: "/ops/projects", label: "Proyectos" },
  { href: "/ops/encargos", label: "Encargos" },
  { href: "/dashboard.html", label: "CRM", legacy: true },
  { href: "/clientes.html", label: "Clientes", legacy: true },
  { href: "/ajustes.html", label: "Ajustes", legacy: true },
];

export function OpsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="ops-sidebar" aria-label="Navegación Ops">
      <div className="ops-brand">
        <span className="ops-brand-mark">Altivox</span>
        <span className="ops-brand-os">OS</span>
      </div>
      <p className="ops-brand-sub">Centro de operaciones</p>
      <nav className="ops-nav">
        {NAV.map((item) => {
          const active =
            !item.legacy &&
            (item.href === "/ops"
              ? pathname === "/ops"
              : pathname === item.href || pathname.startsWith(item.href + "/"));
          const className = [
            "ops-nav-link",
            active ? "is-active" : "",
            item.legacy ? "is-legacy" : "",
          ]
            .filter(Boolean)
            .join(" ");

          if (item.legacy) {
            return (
              <a key={item.href} href={item.href} className={className}>
                <span>{item.label}</span>
                <span className="ops-legacy-tag">HTML · ADR-001</span>
              </a>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="ops-sidebar-foot">
        Módulos HTML = temporales hasta migración App Router.
      </p>
    </aside>
  );
}
