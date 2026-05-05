"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Pencil, Trash2, X, Check, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: number;
  username: string;
  role: string;
  markupExtra: number;
}

interface FormData {
  username: string;
  password: string;
  role: string;
  markupExtra: string;
}

const emptyForm: FormData = { username: "", password: "", role: "user", markupExtra: "0" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<UserRow | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/usuarios");
    if (res.ok) setUsuarios(await res.json());
    else toast.error("Sin permisos para ver usuarios");
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  function abrirCrear() {
    setEditando(null);
    setForm(emptyForm);
    setCreando(true);
  }

  function abrirEditar(u: UserRow) {
    setCreando(false);
    setForm({ username: u.username, password: "", role: u.role, markupExtra: String(u.markupExtra) });
    setEditando(u);
  }

  function cerrar() {
    setCreando(false);
    setEditando(null);
    setForm(emptyForm);
  }

  async function guardar() {
    setGuardando(true);
    try {
      const body = {
        username: form.username,
        password: form.password || undefined,
        role: form.role,
        markupExtra: parseFloat(form.markupExtra) || 0,
      };

      let res: Response;
      if (creando) {
        res = await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, password: form.password }),
        });
      } else {
        res = await fetch(`/api/usuarios/${editando!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Error al guardar");
      } else {
        toast.success(creando ? "Usuario creado" : "Usuario actualizado");
        cerrar();
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(u: UserRow) {
    if (!confirm(`¿Eliminar usuario "${u.username}"?`)) return;
    const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Usuario eliminado");
      cargar();
    } else {
      const d = await res.json();
      toast.error(d.error || "Error al eliminar");
    }
  }

  const panelOpen = creando || editando !== null;

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Usuarios</h1>
          <p className="text-[var(--foreground)]/50 mt-1">Gestioná acceso y precios por usuario</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={abrirCrear}
          className="tap inline-flex items-center gap-2 px-5 py-3 text-white rounded-xl font-bold shadow-md btn-glow"
          style={{ background: "var(--brand)" }}
        >
          <UserPlus size={18} />
          Nuevo usuario
        </motion.button>
      </motion.div>

      {/* Form panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-6 mb-6 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{creando ? "Nuevo usuario" : `Editar: ${editando?.username}`}</h2>
              <button onClick={cerrar} className="p-2 rounded-xl hover:bg-[var(--surface-soft)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--foreground)]/70">Usuario</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="h-11 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white"
                  placeholder="nombre de usuario"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--foreground)]/70">
                  Contraseña {!creando && <span className="font-normal opacity-60">(dejar vacío para no cambiar)</span>}
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="h-11 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white"
                  placeholder={creando ? "contraseña" : "••••••"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--foreground)]/70">Rol</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="h-11 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--foreground)]/70">
                  Markup extra (%)
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    value={form.markupExtra}
                    onChange={(e) => setForm((f) => ({ ...f, markupExtra: e.target.value }))}
                    className="h-11 w-full px-4 pr-10 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 font-bold">%</span>
                </div>
                <p className="text-xs text-[var(--foreground)]/40">
                  Se suma al costo → recalcula mayorista y minorista. ML queda fijo.
                </p>
              </label>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={cerrar}
                className="px-5 py-2.5 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--surface-soft)] transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={guardar}
                disabled={guardando || !form.username || (creando && !form.password)}
                className="tap px-5 py-2.5 rounded-xl text-white font-bold disabled:opacity-40 flex items-center gap-2"
                style={{ background: "var(--brand)" }}
              >
                <Check size={16} />
                {guardando ? "Guardando..." : "Guardar"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User list */}
      {cargando ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 shadow-sm"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: u.role === "admin" ? "var(--brand)" : "var(--surface-soft)" }}
              >
                {u.role === "admin"
                  ? <ShieldCheck size={20} className="text-white" />
                  : <User size={20} className="text-[var(--foreground)]/50" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px]">{u.username}</p>
                <p className="text-sm text-[var(--foreground)]/50">
                  {u.role === "admin" ? "Administrador" : "Usuario"} · Markup:{" "}
                  <span className="font-semibold text-[var(--foreground)]/70">
                    {u.markupExtra > 0 ? `+${u.markupExtra}%` : "sin markup"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => abrirEditar(u)}
                  className="tap p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] transition-colors"
                >
                  <Pencil size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => eliminar(u)}
                  className="tap p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
