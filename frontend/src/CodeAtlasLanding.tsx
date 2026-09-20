import React, { useEffect, useRef, useState } from "react";
import "./CodeAtlasLanding.css";
const FAVICON_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cg transform='rotate(-30 12 12)'%3E%3Ccircle cx='7.3' cy='3.2' r='1.45'/%3E%3Crect x='5.5' y='4.7' width='3.6' height='14.6' rx='1.8'/%3E%3Crect x='14.9' y='4.7' width='3.6' height='14.6' rx='1.8'/%3E%3Ccircle cx='16.7' cy='20.8' r='1.45'/%3E%3C/g%3E%3C/svg%3E";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4";

const GOOGLE_FONTS_FALLBACK_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=Instrument+Serif:ital@1&display=swap";

type NavItem = {
  label: string;
  href: string;
  appear: "appear--scale" | "appear--soft";
  delay: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Benefits", href: "#benefits", appear: "appear--scale", delay: "0.16s" },
  { label: "How It Works", href: "#how-it-works", appear: "appear--soft", delay: "0.28s" },
  { label: "FAQs", href: "#faqs", appear: "appear--scale", delay: "0.40s" },
  { label: "Pricing", href: "#pricing", appear: "appear--soft", delay: "0.52s" },
];

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(-30 12 12)">
        <circle cx="7.3" cy="3.2" r="1.45" />
        <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <circle cx="16.7" cy="20.8" r="1.45" />
      </g>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      className="badge-star"
      width="18"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
    </svg>
  );
}

function WorkflowStatIcon() {
  return (
    <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="workflow-left" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="workflow-right" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#workflow-left)" />
      <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#workflow-right)" />
      <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
    </svg>
  );
}

function DownloadStatIcon() {
  return (
    <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
      <path
        d="M12 7.1v7.4"
        stroke="#111111"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8.15 12.35L12 16.2l3.85-3.85"
        stroke="#111111"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function AvatarsStatIcon() {
  return (
    <svg className="stat-icon-wide" viewBox="0 0 40 22" aria-hidden="true" focusable="false">
      {/* avatar 1 */}
      <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
      <polygon points="4.6,5.4 6.6,3.4 7.4,6.4" fill="#2b2b2b" />
      <polygon points="15.8,5.4 13.8,3.4 13,6.4" fill="#2b2b2b" />
      <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
      <circle cx="8.4" cy="11.6" r="0.7" fill="#1a1a1a" />
      <circle cx="12" cy="11.6" r="0.7" fill="#1a1a1a" />

      {/* avatar 2 */}
      <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
      <circle cx="17.6" cy="10.6" r="1.7" fill="#111111" />
      <circle cx="22.8" cy="10.6" r="1.7" fill="#111111" />
      <ellipse cx="20.2" cy="13.4" rx="1.1" ry="0.8" fill="#c9c9c9" />
      <path
        d="M16.8 15.6c1 1.2 5.4 1.2 6.4 0"
        stroke="#111111"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* avatar 3 */}
      <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
      <text
        x="30.2"
        y="15.1"
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight={700}
        fontSize="12.5"
        textAnchor="middle"
        fill="#ffffff"
      >
        e
      </text>
    </svg>
  );
}

function PrimaryCta({
  className,
  style,
  signedIn,
  onPrimaryCta,
}: {
  className: string;
  style?: React.CSSProperties;
  signedIn: boolean;
  onPrimaryCta?: () => void;
}) {
  if (signedIn) {
    return (
      <button type="button" className={className} style={style} onClick={onPrimaryCta}>
        Open Dashboard
      </button>
    );
  }
  return (
    <a className={className} style={style} href="/login">
      Start Improving
    </a>
  );
}

function Burger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="burger"
      aria-controls="site-nav"
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
    >
      <span className="burger-bars">
        <span className="burger-bar burger-bar-1" />
        <span className="burger-bar burger-bar-2" />
        <span className="burger-bar burger-bar-3" />
      </span>
    </button>
  );
}

interface CodeAtlasLandingProps {
 
  signedIn?: boolean;
  
  onPrimaryCta?: () => void;
}

export default function CodeAtlasLanding({ signedIn = false, onPrimaryCta }: CodeAtlasLandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "CodeAtlas.ai ";
    document.documentElement.lang = "en";

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = FAVICON_DATA_URI;
  }, []);

  useEffect(() => {
    if (document.querySelector(`link[href="${GOOGLE_FONTS_FALLBACK_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_FALLBACK_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const appearEls = Array.from(root.querySelectorAll<HTMLElement>(".appear, .hero-photo"));

    const handlers: Array<[HTMLElement, EventListener]> = [];
    appearEls.forEach((el) => {
      const handler = () => el.classList.add("is-in");
      el.addEventListener("animationend", handler, { once: true });
      handlers.push([el, handler]);
    });

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        appearEls.forEach((el) => {
          const running = el
            .getAnimations()
            .some((a) => a.playState === "running" || a.playState === "finished");
          if (!running) el.classList.add("is-in");
        });
      });
    });

    return () => {
      handlers.forEach(([el, handler]) => el.removeEventListener("animationend", handler));
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div ref={rootRef} style={{ background: "#000", color: "#fff" }}>
      <div className="grain" aria-hidden="true" />

      <video
        className="hero-photo appear"
        style={{ ["--d" as string]: "0s" }}
        src={HERO_VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      <div className="page">
        <div className="menu-backdrop" onClick={closeMenu} aria-hidden="true" />

        <header className="header">
          <a
            className="logo appear appear--scale"
            style={{ ["--d" as string]: "0.08s" }}
            href="#top"
            aria-label="Vesper.ai"
          >
            <LogoMark className="logo-mark" />
            <span>
              CodeAtlas<span className="logo-suffix">.ai</span>
            </span>
          </a>

          <nav id="site-nav" className="nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link appear ${item.appear}`}
                style={{ ["--d" as string]: item.delay }}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-right">
            <PrimaryCta
              className="btn btn-solid header-cta appear appear--scale"
              style={{ ["--d" as string]: "0.34s" }}
              signedIn={signedIn}
              onPrimaryCta={onPrimaryCta}
            />
            <Burger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
          </div>
        </header>

        <main className="hero" id="top">
          <div className="hero-copy">
            <span className="badge appear appear--pop" style={{ ["--d" as string]: "0.22s" }}>
              <SparkleIcon />
              ✦ AI Code Intelligence
            </span>

            <h1 className="headline">
              <span
                className="headline-line appear appear--mask"
                style={{ ["--d" as string]: "0.42s" }}
              >
                An AI engineering  <em>agent</em>  that understands
              </span>
              <span
                className="headline-line appear appear--mask"
                style={{ ["--d" as string]: "0.62s" }}
              >
                your GitHub repository
              </span>
            </h1>

            <p className="lede appear appear--soft" style={{ ["--d" as string]: "0.82s" }}>
            CodeAtlas understands your GitHub repositories, 
            answers questions using the actual code,
            and helps turn engineering tasks into validated code changes and Pull Requests.
            </p>

            <div className="hero-actions">
              <PrimaryCta
                className="btn btn-solid appear appear--btn"
                style={{ ["--d" as string]: "0.96s" }}
                signedIn={signedIn}
                onPrimaryCta={onPrimaryCta}
              />
              <a
                className="btn btn-ghost appear appear--side"
                style={{ ["--d" as string]: "1.10s" }}
                href="#demo"
              >
                See it in action
              </a>
            </div>
          </div>
        </main>

        <footer className="stats">
          <span className="stat appear appear--stat" style={{ ["--d" as string]: "1.12s" }}>
            <WorkflowStatIcon />
            Repository-aware
            AI understands your actual code
          </span>
          <span className="stat appear appear--stat" style={{ ["--d" as string]: "1.28s" }}>
            <DownloadStatIcon />
            Grounded answers
            Every answer backed by source code
          </span>
          <span className="stat appear appear--stat" style={{ ["--d" as string]: "1.44s" }}>
            <AvatarsStatIcon />
            PR-ready
            Changes can be validated before review
          </span>
        </footer>
      </div>
    </div>
  );
}
