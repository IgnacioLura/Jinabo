"use client";

import { motion } from "framer-motion";

interface Props {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 20, className = "" }: Readonly<Props>) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{ width: size, height: size }}
      className={`border-2 border-current/25 border-t-current rounded-full ${className}`}
      aria-label="Cargando"
      role="status"
    />
  );
}
