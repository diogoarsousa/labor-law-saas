import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Como Funciona", href: "/#como-funciona" },
  { label: "Planos", href: "/#planos" },
  { label: "Blog", href: "/#blog" },
  { label: "Dúvidas", href: "/#duvidas" },
  { label: "Chat AI", href: "/chat" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-6 ${
          scrolled ? "glass-strong shadow-[0_8px_30px_-12px_rgba(95,88,78,0.18)]" : "glass"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-coffee)] text-[var(--color-cream)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-serif text-xl tracking-tight">Doutor Trabalho</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-sm text-[var(--color-coffee)]/80 transition hover:bg-[var(--color-beige)]/60 hover:text-[var(--color-coffee)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-1.5 text-sm text-[var(--color-coffee)]/80 hover:text-[var(--color-coffee)]"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[var(--color-coffee)] px-4 py-2 text-sm text-[var(--color-cream)] transition hover:opacity-90"
          >
            Criar conta
          </Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-beige)]/60 md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong mx-auto mt-2 max-w-6xl rounded-3xl p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm hover:bg-[var(--color-beige)]/60"
                >
                  {l.label}
                </a>
              ))}
              <div className="my-2 h-px bg-[var(--color-border)]" />
              <Link to="/login" className="rounded-xl px-3 py-2 text-sm hover:bg-[var(--color-beige)]/60">
                Entrar
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-[var(--color-coffee)] px-3 py-2 text-center text-sm text-[var(--color-cream)]"
              >
                Criar conta
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
