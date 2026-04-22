"use client";

import React from "react";
import Link from "next/link";
import { DIcons } from "dicons";

function handleScrollTop() {
  window.scroll({ top: 0, behavior: "smooth" });
}

const navColumns = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "#pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

const socialIcons = [
  { icon: "Mail", label: "Email", href: "#" },
  { icon: "Instagram", label: "Instagram", href: "#" },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      {/* Main row: brand + nav */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <span className="text-lg font-semibold tracking-tight text-white">
              Scripture Path
            </span>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Your daily companion for scripture study and spiritual growth —
              one verse at a time.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-x-14 gap-y-8">
            {navColumns.map((col) => (
              <div key={col.heading}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
                  {col.heading}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Socials */}
          <div className="flex items-center gap-2">
            {socialIcons.map(({ icon, label, href }) => {
              const Icon = DIcons[icon as keyof typeof DIcons] as React.ElementType;
              return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/40 hover:text-white"
                >
                  {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/30">
            © 2026 Made with{" "}
            <DIcons.Heart className="mx-1 inline-block h-3.5 w-3.5 text-red-500" fill="currentColor" />{" "}
            by <a href="https://stellaflo.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">StellaFlo</a>
          </p>

          {/* Scroll to top */}
          <button
            type="button"
            onClick={handleScrollTop}
            aria-label="Scroll to top"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/40 hover:text-white"
          >
            <DIcons.ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
