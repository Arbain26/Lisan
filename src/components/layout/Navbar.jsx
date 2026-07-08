import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { navLinks } from "../../constants";

// ─── Animation Variants ──────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const mobileMenuVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.28, ease: "easeIn" },
  },
};

const mobileAccordionVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────

const DesktopDropdown = ({ items }) => (
  <AnimatePresence>
    <motion.div
      key="dropdown"
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 min-w-[260px] overflow-hidden"
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      {/* Gold top accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />

      <div className="p-2">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-amber-50"
          >
            {/* Icon */}
            {item.icon && (
              <span className="mt-0.5 text-base flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-amber-100 transition-colors duration-200">
                {item.icon}
              </span>
            )}
            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-poppins font-semibold text-sm text-gray-800 group-hover:text-[#B91C1C] transition-colors duration-200 whitespace-nowrap">
                  {item.label}
                </span>
                <ArrowRight
                  size={12}
                  className="text-gray-300 group-hover:text-[#F59E0B] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                />
              </div>
              {item.desc && (
                <p className="font-inter text-xs text-gray-400 mt-0.5 leading-relaxed group-hover:text-gray-500 transition-colors">
                  {item.desc}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom caret pointer */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="w-3 h-3 bg-white rotate-45 border-t border-l border-gray-100 mx-auto mt-1"
          style={{ boxShadow: "-1px -1px 2px rgba(0,0,0,0.04)" }}
        />
      </div>
    </motion.div>
  </AnimatePresence>
);

// ─── Desktop Nav Item ─────────────────────────────────────────────────────────

const DesktopNavItem = ({ link, scrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const open = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };
  const close = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 120);
  };

  const baseTextClass = scrolled
    ? "text-gray-700 hover:text-[#B91C1C]"
    : "text-white/90 hover:text-white";

  if (!link.children) {
    return (
      <NavLink
        to={link.path}
        className={({ isActive }) =>
          `relative px-3.5 py-2 font-inter font-medium text-sm rounded-lg transition-all duration-200 ${isActive
            ? scrolled
              ? "text-[#B91C1C] font-semibold"
              : "text-[#F59E0B] font-semibold"
            : baseTextClass
          }`
        }
      >
        {({ isActive }) => (
          <>
            {link.label}
            {isActive && (
              <motion.span
                layoutId="activeBar"
                className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-[#F59E0B]"
              />
            )}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <button
        className={`flex items-center gap-1 px-3.5 py-2 font-inter font-medium text-sm rounded-lg transition-all duration-200 ${baseTextClass} ${isOpen ? (scrolled ? "text-[#B91C1C]" : "text-[#F59E0B]") : ""
          }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {link.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && <DesktopDropdown items={link.children} />}
    </div>
  );
};

// ─── Mobile Accordion Item ────────────────────────────────────────────────────

const MobileAccordionItem = ({ link, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!link.children) {
    return (
      <NavLink
        to={link.path}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center justify-between w-full px-4 py-3.5 rounded-xl font-inter font-medium text-base transition-all duration-200 ${isActive
            ? "bg-red-50 text-[#B91C1C] font-semibold"
            : "text-gray-700 hover:bg-gray-50 hover:text-[#B91C1C]"
          }`
        }
      >
        {link.label}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl font-inter font-medium text-base transition-all duration-200 ${isOpen
          ? "bg-red-50 text-[#B91C1C]"
          : "text-gray-700 hover:bg-gray-50"
          }`}
        aria-expanded={isOpen}
      >
        {link.label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-250 ${isOpen ? "rotate-180 text-[#F59E0B]" : "text-gray-400"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="accordion"
            variants={mobileAccordionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="mt-1 ml-4 pl-3 border-l-2 border-amber-200 space-y-0.5 pb-1">
              {link.children.map((child, i) => (
                <Link
                  key={i}
                  to={child.path}
                  onClick={onClose}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg group transition-all duration-200 hover:bg-amber-50"
                >
                  {child.icon && (
                    <span className="text-sm mt-0.5 flex-shrink-0">{child.icon}</span>
                  )}
                  <div>
                    <div className="font-inter font-semibold text-sm text-gray-700 group-hover:text-[#B91C1C] transition-colors">
                      {child.label}
                    </div>
                    {child.desc && (
                      <div className="font-inter text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {child.desc}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── LISAN Logo ───────────────────────────────────────────────────────────────

const Logo = ({ scrolled }) => (
  <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
    {/* Emblem */}
    <div className="relative">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-red-500/30 overflow-hidden bg-white"
        style={{
          border: "1.5px solid rgba(245,158,11,0.4)",
          boxShadow: "0 4px 16px rgba(185,28,28,0.35)",
        }}
      >
        <img src="/lisan.jpeg" alt="Logo LISAN" className="w-full h-full object-cover" />
      </div>
      {/* Gold dot accent */}
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F59E0B] border-2 border-white shadow-sm" />
    </div>

    {/* Text */}
    <div className="hidden sm:block">
      <div
        className={`font-poppins font-black text-lg leading-none transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"
          }`}
      >
        LISAN
      </div>
      <div
        className={`font-inter text-[10px] leading-none mt-0.5 tracking-wide transition-colors duration-300 ${scrolled ? "text-[#B91C1C]" : "text-[#F59E0B]"
          }`}
      >
        Lingkar Mahasiswa Islam untuk Perubahan
      </div>
    </div>
  </Link>
);

// ─── Main Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Scroll watcher
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const docH =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (y / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Navbar Shell ─────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={
          scrolled
            ? {
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow:
                "0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.06)",
            }
            : {
              background: "transparent",
            }
        }
      >
        {/* Scroll progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#B91C1C] to-[#F59E0B] transition-opacity duration-300"
          style={{ width: `${scrollProgress}%`, opacity: scrolled ? 1 : 0 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Left: Logo */}
            <Logo scrolled={scrolled} />

            {/* Center: Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-0.5"
              role="navigation"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <DesktopNavItem
                  key={link.label}
                  link={link}
                  scrolled={scrolled}
                />
              ))}
            </nav>

            {/* Right: Actions & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`hidden lg:flex items-center justify-center px-5 py-2 rounded-full font-poppins font-semibold text-sm transition-all duration-300 border ${scrolled
                    ? "border-primary text-primary hover:bg-primary hover:text-white"
                    : "border-white/40 text-white hover:bg-white hover:text-primary"
                  }`}
              >
                Login Admin
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${scrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/15"
                  }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* ── Mobile Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="drawer"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm lg:hidden flex flex-col overflow-hidden"
            style={{
              background: "#ffffff",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
            }}
            aria-label="Mobile navigation"
          >
            {/* Drawer Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
              style={{ background: "#fafafa" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #B91C1C, #7f1d1d)",
                    boxShadow: "0 4px 12px rgba(185,28,28,0.35)",
                    border: "1px solid rgba(245,158,11,0.4)",
                  }}
                >
                  <span className="font-poppins font-black text-white text-sm">L</span>
                </div>
                <div>
                  <div className="font-poppins font-black text-gray-900 text-base leading-none">
                    LISAN
                  </div>
                  <div className="font-inter text-[10px] text-[#B91C1C] leading-none mt-0.5">
                    Lingkar Mahasiswa Islam untuk Perubahan
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Gold accent */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />

            {/* Drawer Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <MobileAccordionItem
                  key={link.label}
                  link={link}
                  onClose={() => setMobileOpen(false)}
                />
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-3" style={{ background: "#fafafa" }}>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 flex items-center justify-center rounded-xl font-poppins font-medium text-sm border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Login Admin
              </Link>
              <p className="text-center text-xs text-gray-400 font-inter leading-relaxed">
                Bersama LISAN, jadilah bagian dari perubahan.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
