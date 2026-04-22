"use client";

import Link from "next/link";
import { DIcons } from "dicons";


const navColumns = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/#pricing", scrollTo: "pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#theological-integrity", scrollTo: "theological-integrity" },
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
                <ul className={col.heading === "Legal" ? "flex gap-4" : "space-y-2"}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                        onClick={
                          "scrollTo" in link
                            ? (e) => {
                                e.preventDefault();
                                const el = document.getElementById(link.scrollTo as string);
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth" });
                                } else {
                                  window.location.href = link.href;
                                }
                              }
                            : undefined
                        }
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
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-5">
          {/* Copyright */}
          <p className="text-xs text-white/30">
            © 2026 Made with{" "}
            <DIcons.Heart className="mx-1 inline-block h-3.5 w-3.5 text-red-500" fill="currentColor" />{" "}
            by <a href="https://stellaflo.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">StellaFlo</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
