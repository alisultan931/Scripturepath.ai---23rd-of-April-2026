"use client";

import React from "react";
import { DIcons } from "dicons";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const navColumns = [
  {
    links: [
      { label: "About", href: "#" },
      { label: "Works", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    links: [
      { label: "Products", href: "#" },
      { label: "Agency", href: "#" },
      { label: "Dashboard", href: "#" },
    ],
  },
  {
    links: [
      { label: "DIcons", href: "#" },
      { label: "DShapes", href: "#" },
      { label: "Graaadients", href: "#" },
    ],
  },
  {
    links: [
      { label: "Design", href: "#" },
      { label: "Components", href: "#" },
      { label: "Blogs", href: "#" },
    ],
  },
  {
    links: [
      { label: "Graphic", href: "#" },
      { label: "3D Icons", href: "#" },
      { label: "Colors", href: "#" },
    ],
  },
  {
    links: [
      { label: "Contact", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

const socialIcons = [
  { icon: "Mail", label: "Email", href: "#" },
  { icon: "X", label: "X", href: "#" },
  { icon: "Instagram", label: "Instagram", href: "#" },
  { icon: "Threads", label: "Threads", href: "#" },
  { icon: "WhatsApp", label: "WhatsApp", href: "#" },
  { icon: "Behance", label: "Behance", href: "#" },
  { icon: "Facebook", label: "Facebook", href: "#" },
  { icon: "LinkedIn", label: "LinkedIn", href: "#" },
  { icon: "YouTube", label: "YouTube", href: "#" },
];

const Footer = () => {

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      {/* Top: logo + description */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-start gap-6">
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white text-xl">
            D
          </div>
          <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
            Description will go here. It can be a tagline, a mission statement, or a brief
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/10" />

      {/* Nav columns */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-3 gap-y-6 sm:grid-cols-6">
          {navColumns.map((col, i) => (
            <ul key={i} className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/10" />

      {/* Social icons + scroll to top */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative flex items-center justify-center">
          <div className="flex flex-wrap items-center gap-3">
            {socialIcons.map(({ icon, label, href }) => {
              const Icon = DIcons[icon as keyof typeof DIcons] as React.ElementType;
              return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
                >
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                </a>
              );
            })}
          </div>

          {/* Scroll to top */}
          <div className="absolute right-0 flex items-center rounded-full border border-white/20 px-1">
            <button
              type="button"
              onClick={handleScrollTop}
              aria-label="Scroll to top"
              className="p-2 text-white/70 transition-colors hover:text-white"
            >
              <DIcons.ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/10" />

      {/* Copyright */}
      <div className="px-6 py-6 text-center text-sm text-white/50">
        © 2026 Made with{" "}
        <DIcons.Heart className="mx-1 inline-block h-4 w-4 text-red-500" fill="currentColor" />{" "}
        by <span className="font-semibold text-white ml-1">StellaFlo</span>
      </div>
    </footer>
  );
};

export default Footer;
