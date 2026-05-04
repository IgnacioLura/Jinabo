"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Users, BarChart3, Tag, LogOut } from "lucide-react";

const LINKS = [
  { href: "/articulos", label: "Articulos", icon: Package },
  { href: "/modo-cliente", label: "Cliente", icon: Users },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/categorias", label: "Categorias", icon: Tag },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <nav className="glass sticky top-0 z-30 border-b border-[var(--glass-border)]">
      <div className="px-4 md:px-8 h-16 flex items-center gap-3">
        <Link href="/articulos" className="flex items-center gap-2.5 mr-3 group">
          <motion.span
            whileHover={{ scale: 1.08, rotate: -3 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 text-white font-black grid place-items-center text-xl shadow-md"
          >
            J
          </motion.span>
          <span className="font-extrabold text-lg hidden sm:block tracking-tight">
            Jinbao
          </span>
        </Link>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="relative">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`tap flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "text-white"
                      : "text-[var(--foreground)]/70 hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 rounded-xl shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={18} strokeWidth={2.5} />
                    <span className="hidden md:inline">{link.label}</span>
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="tap flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl hover:bg-rose-50 text-[var(--foreground)]/60 hover:text-rose-600 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </motion.button>
      </div>
    </nav>
  );
}
