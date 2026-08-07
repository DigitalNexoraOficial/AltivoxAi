"use client";

import Link from "next/link";

export type Crumb = { href?: string; label: string };

export function OpsBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="ops-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`}>
              {!last && item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              )}
              {!last ? <span className="ops-bc-sep">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
