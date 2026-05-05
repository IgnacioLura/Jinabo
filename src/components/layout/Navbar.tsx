"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Users, BarChart3, Tag, LogOut } from "lucide-react";

const LINKS = [
  { href: "/articulos", label: "Artículos", icon: Package },
  { href: "/modo-cliente", label: "Cliente", icon: Users },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/categorias", label: "Categorías", icon: Tag },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-30 shadow-lg" style={{ background: "var(--navy)" }}>
      <div className="px-4 md:px-8 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link href="/articulos" className="flex items-center gap-3 mr-4 shrink-0 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Jin Bao" className="w-full h-full object-cover" />
          </motion.div>
          <div className="hidden sm:block leading-tight">
            <p className="font-black text-xl text-white tracking-tight leading-none">
              Jin Bao
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--brand)" }}
            >
              Importaciones
            </p>
          </div>
        </Link>

        {/* Nav links */}
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
                    active ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/8"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "var(--brand)" }}
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

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="tap flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </motion.button>
      </div>
    </nav>
  );
}
